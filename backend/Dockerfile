# ─────────────────────────────────────────────────────────────────────────────
# NeoFace Backend — Production Dockerfile
# Multi-stage build:
#   Stage 1 (builder): Install Python deps with uv + download ONNX models
#   Stage 2 (runtime): Minimal image with only runtime artifacts
#
# Models are baked in at build time to avoid runtime OOM on Render (512MB limit).
# Pass --build-arg SKIP_MODEL_DOWNLOAD=true for fast local dev builds.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

# Build arg: set to "true" to skip model downloads (useful for local dev builds)
ARG SKIP_MODEL_DOWNLOAD=false

# System dependencies for OpenCV, InsightFace, and mediapipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    cmake \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    libglib2.0-dev \
    libprotobuf-dev \
    protobuf-compiler \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /build

# Copy dependency files first (layer caching)
COPY requirements.txt ./

# Install dependencies into a virtual environment
RUN uv venv /opt/venv --python python3.12
ENV PATH="/opt/venv/bin:$PATH"
RUN uv pip install --no-cache -r requirements.txt

# ── Download ONNX models at build time ───────────────────────────────────────
# Runs on the build server (unlimited RAM/disk) — never at runtime.
# Models are then copied to the final image via COPY --from=builder.
# Set SKIP_MODEL_DOWNLOAD=true to skip for fast local builds.
COPY ./scripts ./scripts
RUN mkdir -p /build/models /build/.insightface \
    && if [ "$SKIP_MODEL_DOWNLOAD" != "true" ]; then \
         INSIGHTFACE_HOME=/build/.insightface \
         PYTHONPATH=/build \
         python scripts/download_models.py --all ; \
       else \
         echo "[build] Skipping model download (SKIP_MODEL_DOWNLOAD=true)" ; \
       fi


# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Labels
LABEL maintainer="NeoFace Engineering <engineering@neoface.io>"
LABEL version="1.0.0"
LABEL description="NeoFace Biometric Authentication Engine"

# Runtime system deps (shared libs only — no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgl1 \
    libprotobuf-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN groupadd -r neoface && useradd -r -g neoface -s /bin/false neoface

# Force IPv4 preference for getaddrinfo (resolves psycopg2/libpq IPv6 connection issues on Render)
RUN echo "precedence ::ffff:0:0/96  100" >> /etc/gai.conf

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=neoface:neoface ./app ./app
COPY --chown=neoface:neoface .env.example .env.example

# Startup entrypoint script (runs migrations then starts server)
COPY --chown=neoface:neoface ./docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Create directories for storage and logs
RUN mkdir -p /app/storage/faces /app/logs /app/.insightface /app/models \
    && chown -R neoface:neoface /app/storage /app/logs /app/.insightface /app/models

# Copy pre-downloaded ONNX models from builder (already on disk, zero runtime download)
COPY --from=builder --chown=neoface:neoface /build/models /app/models
COPY --from=builder --chown=neoface:neoface /build/.insightface /app/.insightface

# Copy scripts (kept for manual use, not run at startup)
COPY --chown=neoface:neoface ./scripts ./scripts

# InsightFace model cache directory
ENV INSIGHTFACE_HOME=/app/.insightface

# Python settings
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Switch to non-root user
USER neoface

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Entrypoint: run migrations then start server
ENTRYPOINT ["/app/docker-entrypoint.sh"]
