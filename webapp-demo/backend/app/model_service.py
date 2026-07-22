import contextlib
import math
import os
import platform
import sys
import time

import numpy as np
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, EsmForMaskedLM

MODEL_ID = "facebook/esm2_t12_35M_UR50D"
STANDARD_AAS = list("ACDEFGHIKLMNPQRSTVWY")
MUTATION_CHUNK = 64


def _require_gpu() -> bool:
    # Defaults to strict (matches bare-metal/deploy.sh on a machine you know
    # has a GPU). The CPU/portable Docker image explicitly sets this to
    # false, since Docker on macOS can't reach either an NVIDIA GPU or
    # Apple's own Metal/MPS GPU — Docker Desktop has no passthrough for
    # either on that platform.
    return os.environ.get("ESM_REQUIRE_GPU", "true").lower() not in ("false", "0", "no")


class ModelService:
    def __init__(self):
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
            self.device_name = torch.cuda.get_device_name(0)
        elif torch.backends.mps.is_available():
            # Apple Silicon GPU, via PyTorch's Metal Performance Shaders
            # backend. Only reachable running natively — not from inside
            # Docker on macOS, which has no GPU passthrough at all.
            self.device = torch.device("mps")
            self.device_name = "Apple GPU (MPS)"
        elif _require_gpu():
            raise RuntimeError(
                "No GPU available (checked CUDA and Apple MPS) — refusing to silently fall "
                "back to CPU. Set ESM_REQUIRE_GPU=false to allow CPU execution."
            )
        else:
            self.device = torch.device("cpu")
            self.device_name = platform.processor() or "CPU"
            print(
                f"WARNING: no GPU available — running {MODEL_ID} on CPU "
                f"({self.device_name}). This will be noticeably slower.",
                file=sys.stderr,
            )

        t0 = time.time()
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        self.model = EsmForMaskedLM.from_pretrained(MODEL_ID).to(self.device).eval()
        self.load_seconds = time.time() - t0

        self.num_params = sum(p.numel() for p in self.model.parameters())
        self.aa_token_ids = [
            self.tokenizer.convert_tokens_to_ids(aa) for aa in STANDARD_AAS
        ]

    def health(self) -> dict:
        return {
            "status": "ok",
            "device": self.device_name,
            "accelerator": self.device.type,  # "cuda" | "mps" | "cpu"
            "cuda": self.device.type == "cuda",
            "model_id": MODEL_ID,
            "num_params": self.num_params,
            "load_seconds": round(self.load_seconds, 2),
        }

    def _tokenize(self, sequence: str):
        enc = self.tokenizer(sequence, return_tensors="pt").to(self.device)
        return enc["input_ids"], enc["attention_mask"]

    @torch.no_grad()
    def embeddings(self, sequence: str) -> dict:
        input_ids, attention_mask = self._tokenize(sequence)
        out = self.model.esm(input_ids=input_ids, attention_mask=attention_mask)
        hidden = out.last_hidden_state[0, 1:-1, :].float().cpu().numpy()  # strip cls/eos

        coords2d = self._pca_2d(hidden)
        return {
            "residues": list(sequence),
            "coords2d": coords2d.tolist(),
        }

    @staticmethod
    def _pca_2d(x: np.ndarray) -> np.ndarray:
        mean = x.mean(axis=0, keepdims=True)
        centered = x - mean
        _, _, vt = np.linalg.svd(centered, full_matrices=False)
        return centered @ vt[:2].T

    @torch.no_grad()
    def contacts(self, sequence: str) -> dict:
        input_ids, attention_mask = self._tokenize(sequence)
        contact_map = self.model.esm.predict_contacts(input_ids, attention_mask)
        matrix = contact_map[0].float().cpu().numpy()
        return {"matrix": matrix.tolist()}

    @torch.no_grad()
    def mutation_scan(self, sequence: str) -> dict:
        input_ids, attention_mask = self._tokenize(sequence)
        seq_len = len(sequence)
        mask_id = self.tokenizer.mask_token_id

        log_odds = np.zeros((seq_len, len(STANDARD_AAS)), dtype=np.float32)
        wt_logprob = np.zeros(seq_len, dtype=np.float32)

        for start in range(0, seq_len, MUTATION_CHUNK):
            end = min(start + MUTATION_CHUNK, seq_len)
            positions = list(range(start, end))  # 0-indexed residue positions
            batch_size = len(positions)

            batch_ids = input_ids.repeat(batch_size, 1).clone()
            batch_mask = attention_mask.repeat(batch_size, 1)
            for row, pos in enumerate(positions):
                batch_ids[row, pos + 1] = mask_id  # +1 offset for <cls>

            autocast_ctx = (
                torch.autocast(device_type="cuda", dtype=torch.float16)
                if self.device.type == "cuda"
                else contextlib.nullcontext()
            )
            with autocast_ctx:
                logits = self.model(input_ids=batch_ids, attention_mask=batch_mask).logits

            for row, pos in enumerate(positions):
                token_logits = logits[row, pos + 1, :].float()
                logprobs = F.log_softmax(token_logits, dim=-1)
                aa_logprobs = logprobs[self.aa_token_ids].cpu().numpy()
                wt_id = input_ids[0, pos + 1].item()
                wt_lp = logprobs[wt_id].item()
                log_odds[pos, :] = aa_logprobs - wt_lp
                wt_logprob[pos] = wt_lp

        perplexity = float(math.exp(-wt_logprob.mean()))

        return {
            "wildtype": list(sequence),
            "amino_acids": STANDARD_AAS,
            "matrix": log_odds.tolist(),
            "perplexity": perplexity,
        }


_service: ModelService | None = None


def get_service() -> ModelService:
    global _service
    if _service is None:
        _service = ModelService()
    return _service
