# Specification: ESM-2 Protein Explorer

## Goal

Build a local webapp that runs the [ESM-2](https://huggingface.co/facebook/esm2_t12_35M_UR50D)
protein language model on the user's own GPU and lets them explore a pasted amino acid sequence
through several interactive visualizations. Not a toy: real model inference, a real (public) 3D
structure prediction API, and a polished, custom-designed UI — not a generic dashboard look.

## Model & backend

- Model: `facebook/esm2_t12_35M_UR50D` (35M params — lightweight, fast, good enough for
  interactive use) via `transformers`' `AutoTokenizer` + `EsmForMaskedLM`. Load once at process
  startup, keep resident, `.eval()`, `torch.no_grad()` for all inference.
- Backend: Python, FastAPI, one process holding the loaded model. JSON API, no server-rendered
  pages.
- Device selection, in order: CUDA → Apple MPS (Apple Silicon) → CPU. An env var
  (e.g. `ESM_REQUIRE_GPU`, default `true`) controls whether the backend refuses to start with no
  GPU found, or warns loudly and falls back to CPU. Default strict — don't silently degrade on a
  machine that's supposed to have a GPU.
- Sequence validation: uppercase, strip FASTA `>` header lines and whitespace, allow the 20
  standard amino acids plus ambiguity codes (`X`, `B`, `U`, `Z`, `O`), reject anything else with a
  clear error naming the bad character(s).
- Length caps: general analysis endpoints ~512 residues; structure prediction 400 (see below —
  that one's a hard external API limit, not a model limit).

## API endpoints

- `GET /health` — device name, which accelerator got picked, model id, param count.
- `GET /presets` — a handful of curated example sequences (e.g. ubiquitin, lysozyme, myoglobin,
  a short insulin chain, GFP, a spike-protein fragment) with short descriptions, so the demo works
  without the user needing their own sequence.
- `POST /embeddings {sequence}` — per-residue hidden states from the last layer, projected to 2D
  (plain PCA via `numpy` SVD is enough, no need for scikit-learn).
- `POST /contacts {sequence}` — attention-derived contact map.
- `POST /mutations {sequence}` — in-silico mutagenesis scan (see gotcha below) + a whole-sequence
  pseudo-perplexity score.
- `POST /structure {sequence}` — proxies to the public ESMFold API server-side (keeps one API
  surface, avoids CORS) and returns the PDB text plus parsed per-residue confidence.

## Frontend features

React + TypeScript + Vite. Four interactive visualizer panels, switchable via tabs, plus a
persistent sequence-input sidebar:

1. **Contact map** — L×L heatmap, hover shows residue pair + contact probability.
2. **3D structure** — real folded structure (not the language model's own output — see gotcha
   below), rendered with an interactive 3D viewer (e.g. 3Dmol.js), colored by per-residue
   confidence, with style toggles (cartoon/stick/sphere) and a PDB download button.
3. **Embedding explorer** — 2D scatter of the projected embeddings, colorable by amino acid
   property (hydrophobicity, charge, category), with a trace line connecting residues in sequence
   order.
4. **Mutation scan** — 20-amino-acids × sequence-length heatmap of predicted mutation effects,
   plus a headline pseudo-perplexity stat and a short "top predicted mutations" list.

Sidebar: sequence textarea, preset dropdown, live amino-acid composition bar, validation errors.
Header: app title + a live GPU/accelerator status badge from `/health`.

Render heatmaps/scatter plots on `<canvas>` by hand rather than pulling in a charting library —
it's not much code for these shapes and gives full control over the custom look.

## Visual style

Give it an opinionated, specific identity — not a generic dark-mode AI dashboard. Ground the
design in the actual subject matter: e.g. a dark, high-contrast "instrument/darkroom" feel with a
monospace type used boldly for headings and data (not just as a utility font), a serif for
prose/descriptions, and one recurring, functionally-grounded motif (e.g. residue-index tick marks
as a ruler along heatmap axes) that ties the panels together. Confidence/structure coloring should
follow the field's actual convention (blue→red pLDDT-style gradient) rather than reinventing it.

## Technical gotchas (save yourself the research)

- `transformers`' `EsmModel` has a real `predict_contacts(input_ids, attention_mask)` method — a
  trained contact-regression head over attention maps, parity with the original `fair-esm`
  library. It already strips special tokens from its output, so no manual offset handling needed
  there (unlike everywhere else, where `<cls>` adds a +1 index offset).
- ESM-2 is a language model, not a structure predictor — it has no 3D output. For real 3D
  structure, call Meta's public ESMFold endpoint:
  `POST https://api.esmatlas.com/foldSequence/v1/pdb/` with the raw sequence as the POST body
  (no JSON, no auth). Returns a PDB file with per-residue confidence packed into the B-factor
  column (0–1 scale). Hard server-side cap: 400 residues.
- Mutation scanning: use the masked-marginal method — for each position, mask just that token and
  run the model, then compare the softmax log-probability of each amino acid against the wildtype
  residue's. Batch many masked copies into one forward pass (chunked, e.g. 64 at a time) rather
  than looping one-token-at-a-time; it's dramatically faster and still fits comfortably in VRAM
  for a model this size.
- Pick a torch build matching what the GPU driver actually supports — installing the latest
  default `pip install torch` can silently grab a newer CUDA build than an older driver supports.
  Check the driver's supported CUDA version and pin the torch wheel index accordingly.

## Deployment

Should run in more than one environment without code changes:

- **Docker**, cross-platform (Linux and macOS): a CPU-portable base image/compose file that works
  everywhere, plus an optional GPU overlay (build-arg for a CUDA-enabled torch wheel + a GPU
  device reservation) for a Linux host with an NVIDIA GPU and the container GPU toolkit installed.
  Frontend built to static assets and served by a small web server that reverse-proxies API calls
  to the backend container — don't run a dev server in the deployed container.
  Important: **Docker on macOS cannot reach a GPU at all**, neither NVIDIA nor Apple's own
  Metal/MPS — that's a platform limitation of the container runtime there, not something fixable
  in a Dockerfile. Document this rather than fighting it.
- **Bare-metal / native script**, for hot-reload development and for actually using an Apple
  Silicon Mac's GPU (only reachable running natively, not from a container): a single idempotent
  setup+run script that detects the OS to pick the right torch install, starts both processes,
  waits for a health check, and cleans up both on Ctrl+C.
- Whatever binds a dev server to a network interface should default to `localhost`, not a
  hardcoded IP — make the bind address a runtime flag instead, for anyone who wants to reach it
  from another device (e.g. over Tailscale or LAN) without editing source.

## Out of scope

- No user accounts, auth, or multi-user session handling.
- No persistence/database — every request is a fresh, stateless computation.
- No model training or fine-tuning.
- No local structure-folding model (ESMFold itself is far larger than the language model this app
  runs) — structure prediction is intentionally delegated to the public API.
