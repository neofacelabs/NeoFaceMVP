#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# NeoFace Backend — Docker Entrypoint
# Runs database migrations then starts the Uvicorn server.
# ─────────────────────────────────────────────────────────────────────────────
set -e

# Always run from /app so alembic.ini is found and relative paths resolve
cd /app

# Ensure the app package is discoverable by Python / Alembic
# Set unconditionally here so subprocesses (alembic, python) inherit it.
export PYTHONPATH=/app

# Database migrations are no longer needed as NeoFace is fully migrated to Firestore.

# Models are pre-downloaded during `docker build` into /app/models and /app/.insightface.
# No download or quantization at runtime — avoids OOM on memory-constrained hosts.
echo "[entrypoint] Verifying model files are present..."
python3 scripts/download_models.py --status

if [ $# -gt 0 ]; then
    echo "[entrypoint] Executing custom command: $@"
    exec "$@"
else
    echo "[entrypoint] Starting FastAPI server..."
    exec uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers "${WEB_CONCURRENCY:-1}" \
        --loop uvloop \
        --http httptools \
        --access-log \
        --no-use-colors
fi
