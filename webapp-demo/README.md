# ESM-2 Protein Explorer

A local webapp for exploring proteins with [ESM-2](https://huggingface.co/facebook/esm2_t12_35M_UR50D)
(`facebook/esm2_t12_35M_UR50D`, 35M params) running on your own GPU, plus a real 3D structure
viewer via Meta's public ESMFold API.

Features: attention-derived contact maps, ESMFold 3D structure prediction, PCA embedding
exploration, and in-silico mutation scanning (masked-marginal scoring + pseudo-perplexity).

## Requirements

- A GPU: either an NVIDIA GPU + driver (built against driver 535.x / CUDA 12.1 — adjust the torch
  index URL below for a different CUDA version), or an Apple Silicon Mac (M1/M2/M3/M4, via
  PyTorch's Metal/MPS backend). CPU-only also works, just slower.
- Python 3.12, Node 20+.

### GPU acceleration on macOS

Apple Silicon Macs have a real, fairly capable GPU, and the backend uses it automatically (via
PyTorch's MPS backend) — but only when run **natively**, not inside Docker. Docker Desktop on
macOS has no GPU passthrough at all, for NVIDIA or for Apple's own Metal/MPS — every container
on Mac is CPU-only regardless of what's in the Dockerfile, and no Dockerfile trick changes that.

So:
- Want your Mac's GPU? Run `./deploy.sh` natively (see below) — it detects Apple Silicon and
  installs a PyTorch build with MPS support automatically, no config needed.
- Using Docker on a Mac? You get CPU-only, same as Docker on any other GPU-less machine.

## Run it

### Docker (recommended — works on macOS and Linux)

```bash
docker compose up --build
```

Runs CPU-only by default — Docker on macOS can't reach the Mac's GPU at all (see above), so this
is the only option there. The 35M model is small enough that CPU inference is still usable, just
slower than on a GPU.

Open **http://localhost:5173**.

On a **Linux host with an NVIDIA GPU** (+ the [nvidia-container-toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)
installed), layer the GPU overlay on top instead to get real GPU acceleration in the container:

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up --build
```

The backend's container port is only published to `127.0.0.1` on the host — only the frontend
(which proxies `/api/*` to the backend over the internal Docker network via nginx) is meant to be
reachable externally. To expose it beyond localhost (e.g. Tailscale/LAN), change the frontend's
`ports:` mapping in `docker-compose.yml`.

### Bare metal (Linux + NVIDIA, or macOS + Apple Silicon — with hot reload and real GPU use)

```bash
./deploy.sh
```

This sets up the Python venv + torch + backend deps and the frontend `node_modules` the first
time (skipped on later runs if already present), starts both servers, waits for the backend's
health check, then prints the URL. Press Ctrl+C to stop both cleanly.

It detects the OS and installs the right torch build: the CUDA 12.1 wheel index on Linux, or a
plain `pip install torch` on macOS (which gets you MPS/Apple Silicon GPU support automatically,
no config needed). It then prints which accelerator it actually found (`cuda`, `mps`, or `cpu`).

Open **http://localhost:5173**.

To expose the frontend beyond this machine (e.g. over Tailscale), pass `--host`:

```bash
./deploy.sh --host 100.x.x.x
```

The backend always stays bound to `localhost` regardless — the frontend proxies `/api` requests
to it internally (see `frontend/vite.config.ts`), so it never needs to be reachable remotely.

Other options: `--backend-port`, `--frontend-port`, `--help`. Logs are written to
`.deploy-logs/{backend,frontend}.log`.

### Manual setup (equivalent to what deploy.sh does)

**Backend** (from the repo root):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install torch --index-url https://download.pytorch.org/whl/cu121   # Linux + NVIDIA
# pip install torch                                                    # macOS (Apple Silicon MPS)
pip install -r backend/requirements.txt
cd backend && uvicorn app.main:app --reload --port 8000
```

Check `curl localhost:8000/api/health` — `"accelerator"` should read `"cuda"` or `"mps"`.

**Frontend** (in a second terminal):

```bash
cd frontend
npm install
npm run dev -- --host <ip-or-localhost>
```

## Notes

- General analysis (contact map, embeddings, mutation scan) is capped at 512 residues.
- Structure prediction is capped at 400 residues — that's a hard limit of the public ESMFold API,
  not the local model.
- The first request after starting the backend loads the model onto the device; subsequent
  requests are fast.
- `ESM_REQUIRE_GPU` (env var, default `true`) controls whether the backend refuses to start
  without a GPU (checks both CUDA and Apple MPS). It's `true` for bare-metal/`deploy.sh` (matching
  a machine you know has a GPU) and `false` in the default Docker image (CPU-portable). The GPU
  compose overlay sets it back to `true`.
