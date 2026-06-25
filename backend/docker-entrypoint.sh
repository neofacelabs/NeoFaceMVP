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

echo "[entrypoint] PYTHONPATH=${PYTHONPATH}"
echo "[entrypoint] DATABASE_URL host: $(echo "${DATABASE_URL}" | sed 's|.*@\([^/:]*\).*|\1|' 2>/dev/null || echo 'NOT SET')"
echo "[entrypoint] Running Alembic migrations..."

# Run alembic with PYTHONPATH explicitly in environment to be safe
PYTHONPATH=/app alembic upgrade head

echo "[entrypoint] Migrations complete."

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
