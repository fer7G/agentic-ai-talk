import httpx

ESMFOLD_URL = "https://api.esmatlas.com/foldSequence/v1/pdb/"


async def fold_sequence(sequence: str) -> dict:
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(ESMFOLD_URL, content=sequence)
        resp.raise_for_status()
        pdb_text = resp.text

    confidences = _parse_confidences(pdb_text)
    return {"pdb": pdb_text, "confidences": confidences}


def _parse_confidences(pdb_text: str) -> list[float]:
    """Pull one per-residue confidence value (B-factor column, CA atoms) from the PDB."""
    confidences = []
    for line in pdb_text.splitlines():
        if line.startswith("ATOM") and line[12:16].strip() == "CA":
            try:
                confidences.append(float(line[60:66]))
            except ValueError:
                continue
    return confidences
