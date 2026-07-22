PRESETS = [
    {
        "id": "ubiquitin",
        "name": "Ubiquitin",
        "description": "Small regulatory protein found in almost all tissues (76 aa).",
        "sequence": "MQIFVKTLTGKTITLEVEPSDTIENVKAKIQDKEGIPPDQQRLIFAGKQLEDGRTLSDYNIQKESTLHLVLRLRGG",
    },
    {
        "id": "lysozyme",
        "name": "Hen Egg-White Lysozyme",
        "description": "Classic antibacterial enzyme, one of the first proteins ever crystallized (129 aa).",
        "sequence": "KVFGRCELAAAMKRHGLDNYRGYSLGNWVCAAKFESNFNTQATNRNTDGSTDYGILQINSRWWCNDGRTPGSRNLCNIPCSALLSSDITASVNCAKKIVSDGNGMNAWVAWRNRCKGTDVQAWIRGCRL",
    },
    {
        "id": "myoglobin",
        "name": "Sperm Whale Myoglobin",
        "description": "Oxygen-storing muscle protein, the first protein structure ever solved (154 aa).",
        "sequence": "MVLSEGEWQLVLHVWAKVEADVAGHGQDILIRLFKSHPETLEKFDRVKHLKTEAEMKASEDLKKHGVTVLTALGAILKKKGHHEAELKPLAQSHATKHKIPIKYLEFISEAIIHVLHSRHPGDFGADAQGAMNKALELFRKDIAAKYKELGYQG",
    },
    {
        "id": "insulin_a",
        "name": "Human Insulin (A-chain)",
        "description": "A-chain of the insulin hormone (21 aa) — short, fast to analyze.",
        "sequence": "GIVEQCCTSICSLYQLENYCN",
    },
    {
        "id": "gfp",
        "name": "Green Fluorescent Protein (GFP)",
        "description": "The famous jellyfish fluorescent protein used throughout biotech (238 aa).",
        "sequence": "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTLTYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK",
    },
    {
        "id": "spike_rbd",
        "name": "SARS-CoV-2 Spike RBD (fragment)",
        "description": "Receptor-binding domain fragment of the spike protein (191 aa).",
        "sequence": "NITNLCPFGEVFNATRFASVYAWNRKRISNCVADYSVIYNFAPFFAFKCYGVSPTKLNDLCFTNVYADSFVIRGDEVRQIAPGQTGKIADYNYKLPDDFTGCVIAWNSNNLDSKVGGNYNYLYRLFRKSNLKPFERDISTEIYQAGSTPCNGVEGFNCYFPLQSYGFQPTNGVGYQPYRVVVLSFELLHAPATVCGPKKSTNLVKNKCVNF",
    },
]

PRESETS_BY_ID = {p["id"]: p for p in PRESETS}
