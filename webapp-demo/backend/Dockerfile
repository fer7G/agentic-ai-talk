FROM python:3.12-slim

# Defaults to the CPU-only torch wheel index for maximum portability — this
# is what makes the image work on macOS (Docker Desktop has no NVIDIA GPU
# passthrough at all, Apple Silicon or Intel) and on any Linux host without
# an NVIDIA GPU. For a Linux host with a GPU + nvidia-container-toolkit,
# override at build time (see docker-compose.gpu.yml), e.g.:
#   --build-arg TORCH_INDEX_URL=https://download.pytorch.org/whl/cu121
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url ${TORCH_INDEX_URL} \
    && pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
