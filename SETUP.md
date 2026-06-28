# NeoFace — First-Time Setup Guide

This guide takes you from a fresh `git clone` to a fully running NeoFace stack in under 15 minutes.

---

## Prerequisites

Install these before starting:

| Tool | Version | Install |
|---|---|---|
| **Docker Desktop** | 24+ | https://docs.docker.com/get-docker/ |
| **Docker Compose** | v2 (bundled with Docker Desktop) | — |
| **Node.js** | 18+ | https://nodejs.org/ |
| **Python** | 3.12+ | https://www.python.org/ |
| **Git** | any | https://git-scm.com/ |

> **RAM:** The AI models require at least **8 GB RAM** free. The `dpt_hybrid.onnx` depth model alone is 508 MB.

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/DivyeBhatnagar/NeoFace.git
cd NeoFace
```

---

## Step 2 — Configure Environment

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Now **edit `backend/.env`** and set at minimum:

```bash
# Generate a secure JWT secret:
python3 -c "import secrets; print(secrets.token_hex(32))"

# Then paste the output into backend/.env:
JWT_SECRET=<paste-output-here>

# Change the admin password:
ADMIN_PASSWORD=<your-secure-password>
```

For local development with Docker Compose, the **database and Redis settings are pre-configured** — you don't need to change them unless you're using Supabase or a remote DB.

---

## Step 3 — Download ONNX Models

The AI models are not stored in git (they're too large). Download them:

```bash
cd backend
python3 scripts/download_models.py --all
cd ..
```

This downloads ~770 MB total. The large `dpt_hybrid.onnx` (~508 MB) may take 3–5 minutes depending on your connection.

Check status:
```bash
python3 backend/scripts/download_models.py --status
```

> **Note:** All services have heuristic fallbacks. You can start the app even if models are missing — they just won't use the AI-enhanced versions.

---

## Step 4 — Start the Stack

```bash
# One command starts everything:
./start.sh

# OR using make:
make start
```

This will:
1. Build the Docker image (first run: ~3–5 min)
2. Start PostgreSQL, Redis, API, Celery worker, Celery beat, Flower
3. Start the Next.js frontend dev server

**First run takes ~2–3 minutes** to build Docker and download InsightFace models.  
Subsequent runs start in **<30 seconds**.

---

## Step 5 — Run Database Migrations

In a **new terminal** (while the stack is running):

```bash
make migrate

# OR manually:
docker compose exec api alembic upgrade head
```

This creates all database tables. Only needed on first run or after migrations are added.

---

## Step 6 — Verify Everything Works

| Service | URL | What you should see |
|---|---|---|
| **Frontend** | http://localhost:3000 | Landing page with 3D animation |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Health Check** | http://localhost:8000/health | `{"status": "healthy"}` |
| **Celery Flower** | http://localhost:5555 | Task monitoring UI |

Flower credentials: `admin` / `neoface_flower_pass`

---

## Step 7 — Create Your First Account

1. Go to http://localhost:3000/register
2. Create an account with email and password
3. Go to http://localhost:3000/enroll
4. Allow webcam access and enroll your face
5. Go to http://localhost:3000/verify to test face verification

**Default admin account:**
```
Email:    admin@neoface.io
Password: (whatever you set in backend/.env)
```

---

## 🪟 Windows Local Setup Guide

If you are on Windows, you have two options to run the NeoFace stack: **Option A: Native Windows (using PowerShell)** or **Option B: WSL2 (Windows Subsystem for Linux - Highly Recommended)**.

### Option A — Native Windows Setup (PowerShell)

Use this option to run everything natively on Windows without setting up a virtualized Linux subsystem.

#### 1. Prerequisites
Install the following Windows installers:
* **Docker Desktop for Windows**: [Download Here](https://docs.docker.com/desktop/install/windows/). Ensure it is configured to use Linux containers (default).
* **Node.js 18+ (LTS)**: [Download Here](https://nodejs.org/). Make sure the installer adds Node/NPM to your system `PATH`.
* **Python 3.12+**: [Download Here](https://www.python.org/downloads/). **IMPORTANT:** During installation, check the box that says **"Add python.exe to PATH"**.
* **Git for Windows**: [Download Here](https://git-scm.com/download/win).

#### 2. Configure Environment
Open PowerShell in the root of the project directory and run:
```powershell
# Copy environment templates
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```
Now edit `backend/.env` and configure:
* `JWT_SECRET` (generate with: `python -c "import secrets; print(secrets.token_hex(32))"`)
* `ADMIN_PASSWORD` (set a secure admin password)

#### 3. Download ONNX Models
In PowerShell, run:
```powershell
cd backend
python scripts/download_models.py --all
cd ..
```

#### 4. Start the NeoFace Stack
Windows disables script execution by default for security. Run the custom PowerShell script with a temporary execution policy bypass:
```powershell
PowerShell -ExecutionPolicy Bypass -File .\start.ps1
```
This script will:
1. Verify and copy your `.env` files.
2. Check if the backend Docker image needs a rebuild.
3. Start the Postgres database, Redis cache, Celery worker, and FastAPI server inside Docker.
4. Detect if frontend dependencies need installation (runs `npm install`).
5. Launch the Next.js frontend dev server.
6. Gracefully shut down all Docker containers and background processes when you press `Ctrl+C`.

#### 5. Run Database Migrations
While the stack is running, open a **new PowerShell window** and run:
```powershell
docker compose exec api alembic upgrade head
```

---

### Option B — WSL2 Setup (Highly Recommended)

WSL2 provides a native Ubuntu Linux command-line environment inside Windows, providing 100% production parity and enabling the use of `Makefile` commands (`make setup`, `make start`, etc.).

#### 1. Enable WSL2 & Install Ubuntu
Open PowerShell as Administrator and run:
```powershell
wsl --install
```
If prompted, reboot your computer. Once finished, set up your Ubuntu username and password.

#### 2. Configure Docker Desktop Integration
1. Open **Docker Desktop** on Windows.
2. Go to **Settings** (gear icon) → **General** → Ensure **"Use the WSL 2 based engine"** is checked.
3. Go to **Resources** → **WSL Integration**.
4. Toggle **"Enable integration with my default WSL distro"** (e.g., `Ubuntu`) to **ON**.
5. Click **Apply & Restart**.

#### 3. Install Development Tools in WSL Ubuntu
Open your Ubuntu terminal and run the following command to install dependencies:
```bash
sudo apt update && sudo apt install -y make python3 python3-pip python3-venv nodejs npm git
```
> ⚠️ **Note:** The default nodejs package in some Ubuntu repositories may be outdated. If so, update it to Node 18+ using [NodeSource Node.js Binary Distributions](https://github.com/nodesource/distributions) or [nvm](https://github.com/nvm-sh/nvm).

#### 4. Clone, Configure, and Start
Within the WSL Ubuntu terminal, run:
```bash
# Clone
git clone https://github.com/DivyeBhatnagar/NeoFace.git
cd NeoFace

# Setup environment files and install frontend dependencies
make setup

# Download models
make models

# Start the stack
make start
```

#### 5. Run Migrations (WSL2)
In a **second WSL2 terminal window**, navigate to the project directory and run:
```bash
make migrate
```

---

### ⚠️ Common Windows Troubleshooting

* **Script execution is blocked:** Ensure you run PowerShell using `-ExecutionPolicy Bypass` as shown:
  `PowerShell -ExecutionPolicy Bypass -File .\start.ps1`
* **Docker Memory Limit (OOM):** The AI models require significant RAM. By default, WSL2 might consume too much RAM or limit Docker memory.
  If containers crash during startup or show OOM errors, create a `.wslconfig` file in your Windows user profile folder (`C:\Users\<YourUsername>\.wslconfig`) and configure:
  ```ini
  [wsl2]
  memory=8GB   # Give WSL2 at least 8 GB of RAM
  ```
  Then restart WSL in PowerShell: `wsl --shutdown`.
* **Line Endings Warning:** If git checks out files with CRLF (Windows carriage returns), Docker scripts might fail to execute. If you see errors like `/bin/bash^M: bad interpreter`, run this in git:
  `git config --global autocrlf input`
  Then re-clone the repository.

---

## Common Commands

```bash
make help           # See all available commands
make status         # Check model download status
make models         # Download models (skip existing)
make logs           # Tail API logs
make migrate        # Run DB migrations
make test           # Run backend tests
make shell-api      # Shell into the API container
make shell-db       # psql into the database
make stop           # Stop all services (preserves data)
make clean          # Remove dangling Docker resources
```

---

## Troubleshooting

### API won't start / crashes immediately
- **Check logs:** `make logs` or `docker compose logs api`
- **Common cause:** Missing `.env` file → `cp backend/.env.example backend/.env`
- **Common cause:** Models missing in strict mode → Set `STRICT_MODEL_VERIFICATION=false` in `backend/.env`

### Database connection error
- **Check postgres is running:** `docker compose ps postgres`
- **Check migrations:** `make migrate`
- Ensure `DATABASE_URL` in `backend/.env` points to `localhost:5432` (not Supabase) for local dev

### Models show as missing
- Run: `python3 backend/scripts/download_models.py --all`
- Some models may fail to download if HuggingFace URLs change — check `backend/models/README.md` for updated URLs

### Frontend shows "Network Error" / can't reach API
- Confirm API is running: http://localhost:8000/health
- Check `frontend/.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- Check CORS: ensure `ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:3000`

### Port conflicts
- Frontend uses **3000**, API uses **8000**, Redis uses **6379**, Postgres uses **5432**, Flower uses **5555**
- If ports are busy: `lsof -i :3000` to find what's using them, or change ports in `docker-compose.yml`

### Fresh start (wipe everything)
```bash
make nuke      # Destroys all containers and volumes (wipes local DB)
make setup     # Re-run setup
make start
make migrate
```

---

## Production Deployment

For production, see the [Deployment section in README.md](./README.md#-deployment).

Key differences from local dev:
- Set `ENVIRONMENT=production` in backend env
- Set `STRICT_MODEL_VERIFICATION=true`  
- Set a strong `JWT_SECRET` (min 64 chars)
- Use Supabase or managed Postgres (not the compose postgres)
- Deploy backend to Railway / Render / AWS ECS
- Deploy frontend to Vercel (`cd frontend && vercel deploy`)
