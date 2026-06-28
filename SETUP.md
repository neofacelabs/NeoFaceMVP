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

Configure your **Firebase Firestore** and **Cloudflare R2** settings:

```bash
# Firebase Firestore credentials:
FIREBASE_CREDENTIALS_JSON='{"type": "service_account", ...}'

# Cloudflare R2 Credentials:
STORAGE_BACKEND=s3
AWS_ACCESS_KEY_ID=<your-r2-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
AWS_S3_ENDPOINT_URL=https://<your-account-id>.r2.cloudflarestorage.com
AWS_S3_BUCKET=<your-r2-bucket-name>
AWS_S3_REGION=auto
```

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

---

## Step 4 — Configure Cloud Storage Rules & Indexes

### Firebase Firestore Setup

1. **Deploy Rules**: Execute the firebase command to deploy the security configuration (`firestore.rules`):
   ```bash
   firebase deploy --only firestore:rules
   ```
   Or copy the contents of `firestore.rules` directly into the Rules tab in your Firebase Console.

2. **Deploy Composite Indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```
   Or create the composite indexes listed in `firestore.indexes.json` manually in the Indexes tab in your Firebase Console.

### Cloudflare R2 CORS Policy Configuration

To ensure the Trust Terminal and frontend can correctly send face, fingerprint, and iris biometric media to the private R2 storage bucket, you must enable a CORS policy on the bucket settings:

1. Log into your **Cloudflare Dashboard** and navigate to **R2 -> Buckets -> Settings**.
2. Click **CORS Policy** under the Bucket settings.
3. Paste the following configuration:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": [],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
4. Save the changes.

---

## Step 5 — Start the Stack

```bash
# One command starts everything:
./start.sh

# OR using make:
make start
```

This will:
1. Build the Docker image (first run: ~3–5 min)
2. Start Redis, API, Celery worker, Celery beat, Flower
3. Start the Next.js frontend dev server

---

## Step 6 — Verify Everything Works

| Service | URL | What you should see |
|---|---|---|
| **Frontend** | http://localhost:3000 | Landing page with 3D animation |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Health Check** | http://localhost:8000/health | `{"status": "healthy"}` |
| **Celery Flower** | http://localhost:5555 | Task monitoring UI |

---

## Step 7 — Create Your First Account

1. Go to http://localhost:3000/register
2. Create an account with email and password
3. Go to http://localhost:3000/enroll
4. Allow webcam access and enroll your face
5. Go to http://localhost:3000/verify to test face verification

---

## 🪟 Windows Local Setup Guide

If you are on Windows, you have two options to run the NeoFace stack: **Option A: Native Windows (using PowerShell)** or **Option B: WSL2 (Windows Subsystem for Linux - Highly Recommended)**.

### Option A — Native Windows Setup (PowerShell)

#### 1. Prerequisites
Install the following Windows installers:
* **Docker Desktop for Windows**: [Download Here](https://docs.docker.com/desktop/install/windows/). Ensure it is configured to use Linux containers (default).
* **Node.js 18+ (LTS)**: [Download Here](https://nodejs.org/). Make sure the installer adds Node/NPM to your system `PATH`.
* **Python 3.12+**: [Download Here](https://www.python.org/downloads/). **IMPORTANT:** During installation, check the box that says **"Add python.exe to PATH"**.
* **Git for Windows**: [Download Here](https://git-scm.com/download/win).

#### 2. Configure Environment
Open PowerShell in the root of the project directory and run:
```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```
Edit your environment values in `backend/.env` with your Firestore and Cloudflare R2 keys.

#### 3. Download ONNX Models
```powershell
cd backend
python scripts/download_models.py --all
cd ..
```

#### 4. Start the NeoFace Stack
```powershell
PowerShell -ExecutionPolicy Bypass -File .\start.ps1
```

---

### Option B — WSL2 Setup (Highly Recommended)

#### 1. Enable WSL2 & Install Ubuntu
```powershell
wsl --install
```

#### 2. Configure Docker Desktop Integration
1. Open **Docker Desktop** on Windows.
2. Go to **Settings** → **General** → Ensure **"Use the WSL 2 based engine"** is checked.
3. Go to **Resources** → **WSL Integration** → Toggle your default distro to **ON**.

#### 3. Install Development Tools in WSL Ubuntu
```bash
sudo apt update && sudo apt install -y make python3 python3-pip python3-venv nodejs npm git
```

#### 4. Clone, Configure, and Start
```bash
git clone https://github.com/DivyeBhatnagar/NeoFace.git
cd NeoFace
make setup
make models
make start
```

---

### ⚠️ Common Windows Troubleshooting

* **Script execution is blocked:** Ensure you run PowerShell using `-ExecutionPolicy Bypass` as shown:
  `PowerShell -ExecutionPolicy Bypass -File .\start.ps1`
* **Docker Memory Limit (OOM):** Create a `.wslconfig` file in your Windows user profile folder (`C:\Users\<YourUsername>\.wslconfig`) and configure:
  ```ini
  [wsl2]
  memory=8GB   # Give WSL2 at least 8 GB of RAM
  ```
  Then restart WSL in PowerShell: `wsl --shutdown`.
* **Line Endings Warning:** If git checks out files with CRLF, run this in git:
  `git config --global autocrlf input`
  Then re-clone the repository.
