import re

from pydantic import BaseModel, field_validator

VALID_AA = set("ACDEFGHIKLMNPQRSTVWYXBUZO")
MAX_ANALYSIS_LEN = 512
MAX_STRUCTURE_LEN = 400


def clean_sequence(raw: str) -> str:
    lines = [l for l in raw.strip().splitlines() if not l.startswith(">")]
    seq = "".join(lines).strip().upper()
    seq = re.sub(r"\s+", "", seq)
    if not seq:
        raise ValueError("Sequence is empty.")
    bad = sorted(set(seq) - VALID_AA)
    if bad:
        raise ValueError(f"Sequence contains invalid character(s): {', '.join(bad)}")
    return seq


class SequenceRequest(BaseModel):
    sequence: str

    @field_validator("sequence")
    @classmethod
    def validate_sequence(cls, v: str) -> str:
        return clean_sequence(v)


class AnalysisSequenceRequest(SequenceRequest):
    @field_validator("sequence")
    @classmethod
    def validate_length(cls, v: str) -> str:
        if len(v) > MAX_ANALYSIS_LEN:
            raise ValueError(
                f"Sequence too long ({len(v)} residues). Max {MAX_ANALYSIS_LEN} for this analysis."
            )
        return v


class StructureSequenceRequest(SequenceRequest):
    @field_validator("sequence")
    @classmethod
    def validate_length(cls, v: str) -> str:
        if len(v) > MAX_STRUCTURE_LEN:
            raise ValueError(
                f"Sequence too long ({len(v)} residues). The ESMFold API caps input at {MAX_STRUCTURE_LEN}."
            )
        return v
