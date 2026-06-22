#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# NeoFace Backend — Docker Entrypoint
# Runs database migrations then starts the Uvicorn server.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "[entrypoint] Running Alembic migrations..."
alembic upgrade head

echo "[entrypoint] Migrations complete. Starting server..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 2 \
    --loop uvloop \
    --http httptools \
    --access-log \
    --no-use-colors
