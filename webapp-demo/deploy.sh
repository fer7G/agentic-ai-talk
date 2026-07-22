#!/usr/bin/env bash
# Deploys the ESM-2 Protein Explorer locally: sets up the backend venv and
# frontend deps if needed, then runs both dev servers in the foreground.
# Ctrl+C stops both.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

HOST="localhost"
BACKEND_PORT="8000"
FRONTEND_PORT="5173"

# macOS has no NVIDIA/CUDA wheels at all — plain `pip install torch` there
# gets an Apple Silicon build with Metal/MPS GPU support built in, no special
# index needed. Linux defaults to the CUDA 12.1 wheel index (matches driver
# 535.x; override TORCH_INDEX_URL for a different CUDA version, or set it to
# an empty string to force a CPU-only install).
if [ "$(uname -s)" = "Darwin" ]; then
  TORCH_INDEX_URL="${TORCH_INDEX_URL-}"
else
  TORCH_INDEX_URL="${TORCH_INDEX_URL-https://download.pytorch.org/whl/cu121}"
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) HOST="$2"; shift 2 ;;
    --backend-port) BACKEND_PORT="$2"; shift 2 ;;
    --frontend-port) FRONTEND_PORT="$2"; shift 2 ;;
    -h|--help)
      cat <<EOF
Usage: $0 [--host HOST] [--backend-port PORT] [--frontend-port PORT]

  --host           Interface for the frontend dev server (default: localhost).
                    Pass a Tailscale/LAN IP to expose it beyond this machine.
  --backend-port   Backend (FastAPI) port (default: 8000).
  --frontend-port  Frontend (Vite) port (default: 5173).

The backend always binds to localhost only — the frontend proxies /api
requests to it internally, so it never needs to be reachable remotely.
EOF
      exit 0
      ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

LOG_DIR="$ROOT_DIR/.deploy-logs"
mkdir -p "$LOG_DIR"

command -v python3 >/dev/null || { echo "python3 is required." >&2; exit 1; }
command -v npm >/dev/null || { echo "npm is required." >&2; exit 1; }

if [ ! -d "$ROOT_DIR/.venv" ]; then
  echo "==> Creating Python venv"
  python3 -m venv "$ROOT_DIR/.venv"
fi
# shellcheck disable=SC1091
source "$ROOT_DIR/.venv/bin/activate"

if ! python3 -c "import torch" >/dev/null 2>&1; then
  pip install --upgrade pip -q
  if [ -n "$TORCH_INDEX_URL" ]; then
    echo "==> Installing torch (index: $TORCH_INDEX_URL)"
    pip install torch --index-url "$TORCH_INDEX_URL" -q
  else
    echo "==> Installing torch"
    pip install torch -q
  fi
fi

echo "==> Installing backend requirements"
pip install -r "$ROOT_DIR/backend/requirements.txt" -q

ACCELERATOR="$(python3 -c "
import torch
print('cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu')
")"
if [ "$ACCELERATOR" = "cpu" ]; then
  echo "WARNING: no GPU detected (checked CUDA and Apple MPS) — the backend requires one and will fail to start unless ESM_REQUIRE_GPU=false is set." >&2
else
  echo "==> Detected accelerator: $ACCELERATOR"
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "==> Installing frontend dependencies"
  (cd "$ROOT_DIR/frontend" && npm install)
fi

cleanup() {
  echo
  echo "==> Stopping"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Starting backend on http://localhost:$BACKEND_PORT"
(cd "$ROOT_DIR/backend" && exec uvicorn app.main:app --host localhost --port "$BACKEND_PORT") \
  > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

echo -n "==> Waiting for backend"
ready=false
for _ in $(seq 1 60); do
  if curl -s -o /dev/null "http://localhost:$BACKEND_PORT/api/health"; then
    ready=true
    break
  fi
  echo -n "."
  sleep 1
done
echo
if [ "$ready" != "true" ]; then
  echo "Backend did not become healthy in time. Last log lines:" >&2
  tail -n 30 "$LOG_DIR/backend.log" >&2
  exit 1
fi

echo "==> Starting frontend on http://$HOST:$FRONTEND_PORT"
# Invoke the local vite binary directly (not `npm run dev`) so $! captures
# the actual server process — npm run wraps it in a child shell/process
# that outlives a kill sent to npm's own pid.
(cd "$ROOT_DIR/frontend" && exec ./node_modules/.bin/vite --host "$HOST" --port "$FRONTEND_PORT" --strictPort) \
  > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

cat <<EOF

ESM-2 Protein Explorer is running:
  Frontend  http://$HOST:$FRONTEND_PORT
  Backend   http://localhost:$BACKEND_PORT/api/health

Logs: $LOG_DIR/{backend,frontend}.log
Press Ctrl+C to stop.
EOF

wait "$BACKEND_PID" "$FRONTEND_PID"
