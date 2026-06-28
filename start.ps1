# ─────────────────────────────────────────────────────────────────────────────
# NeoFace — Local Development Startup Script for Windows (Storage-Efficient)
#
# What this script does:
#   ✅ Copies environment templates if missing
#   ✅ Only rebuilds Docker image when Dockerfile or requirements.txt actually change
#   ✅ Only runs npm install when package.json/package-lock.json changed
#   ✅ Auto-prunes dangling images, dead containers, and unused networks
#   ✅ Runs the backend stack in Docker and the Next.js frontend in the background
#   ✅ Automatically cleans up all processes and containers on exit/Ctrl+C
#
# Usage (run in PowerShell as Administrator or with process policy bypass):
#   PowerShell -ExecutionPolicy Bypass -File .\start.ps1
#   PowerShell -ExecutionPolicy Bypass -File .\start.ps1 -ForceRebuild
#   PowerShell -ExecutionPolicy Bypass -File .\start.ps1 -Clean
# ─────────────────────────────────────────────────────────────────────────────

param (
    [switch]$ForceRebuild,
    [switch]$Clean
)

# Set shell to exit on error
$ErrorActionPreference = "Stop"

# ── Color logging helpers ──────────────────────────────────────────────────────
function Write-Info ($msg) { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Step ($msg) { Write-Host "`n$msg" -ForegroundColor Cyan }
function Write-Warn ($msg) { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Write-Cleanup ($msg) { Write-Host "  🧹 $msg" -ForegroundColor Red }

# ── Script root setup ─────────────────────────────────────────────────────────
$ScriptDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($ScriptDir)) {
    $ScriptDir = Get-Location
}
Set-Location $ScriptDir

# ── Cache directory for storing hashes ────────────────────────────────────────
$CacheDir = Join-Path $ScriptDir ".neoface-cache"
if (-not (Test-Path $CacheDir)) {
    New-Item -ItemType Directory -Path $CacheDir -Force | Out-Null
}

# ── Setup initial env files if missing ────────────────────────────────────────
if (-not (Test-Path "backend/.env")) {
    if (Test-Path "backend/.env.example") {
        Copy-Item "backend/.env.example" "backend/.env"
        Write-Info "Created backend/.env (please configure it as needed)"
    }
}
if (-not (Test-Path "frontend/.env.local")) {
    if (Test-Path "frontend/.env.example") {
        Copy-Item "frontend/.env.example" "frontend/.env.local"
        Write-Info "Created frontend/.env.local"
    }
}

# Copy backend/.env to root .env so docker compose can read it
if (Test-Path "backend/.env") {
    Copy-Item "backend/.env" ".env" -Force
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   🚀  NeoFace Windows Local Environment  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green

$FrontendProcess = $null

try {
    # ─────────────────────────────────────────────────────────────────────────
    # STEP 0: DEEP CLEAN (only when -Clean is passed)
    # ─────────────────────────────────────────────────────────────────────────
    if ($Clean) {
        Write-Step "🗑️  0. Deep clean — removing all NeoFace Docker data..."
        docker compose down --remove-orphans --volumes 2>$null
        # Remove project images
        $images = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "neoface"
        foreach ($img in $images) {
            docker rmi -f $img.ToString() 2>$null
        }
        # System prune
        docker system prune -f --volumes 2>$null
        # Remove cached hashes
        Remove-Item (Join-Path $CacheDir "*.hash") -Force -ErrorAction SilentlyContinue
        Write-Info "Deep clean complete. Starting fresh..."
    }

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 1: PRUNE DANGLING/UNUSED DOCKER RESOURCES
    # ─────────────────────────────────────────────────────────────────────────
    Write-Step "🧹 1. Pruning unused Docker resources (keeps your disk storage clean)..."
    
    # Dangling images
    $dangling = docker images -f "dangling=true" -q 2>$null
    if ($dangling) {
        Write-Cleanup "Removing dangling image(s)..."
        docker image prune -f 2>$null | Out-Null
    }

    # Stopped containers
    $dead = docker ps -a --filter "status=exited" --filter "status=dead" --filter "status=created" -q 2>$null
    if ($dead) {
        Write-Cleanup "Removing stopped container(s)..."
        docker container prune -f 2>$null | Out-Null
    }

    # Unused networks
    docker network prune -f 2>$null | Out-Null
    Write-Info "Pruning done."

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 2: CHECK IF DOCKER IMAGE NEEDS REBUILD
    # ─────────────────────────────────────────────────────────────────────────
    Write-Step "🔍 2. Checking if Docker image needs rebuild..."
    
    $HashFile = Join-Path $CacheDir "backend.hash"
    $hash1 = ""
    $hash2 = ""
    if (Test-Path "backend/Dockerfile") {
        $hash1 = (Get-FileHash "backend/Dockerfile" -Algorithm MD5).Hash
    }
    if (Test-Path "backend/requirements.txt") {
        $hash2 = (Get-FileHash "backend/requirements.txt" -Algorithm MD5).Hash
    }
    $CurrentHash = "$hash1-$hash2"

    $StoredHash = ""
    if (Test-Path $HashFile) {
        $StoredHash = (Get-Content $HashFile -Raw).Trim()
    }

    # Check if the image exists
    $anyImage = docker images --format "{{.Repository}}" | Select-String "^neoface"
    $ImageExists = if ($anyImage) { 1 } else { 0 }

    $NeedsBuild = $false
    if ($ForceRebuild) {
        Write-Warn "Force rebuild requested — will rebuild image."
        $NeedsBuild = $true
    } elseif ($CurrentHash -ne $StoredHash -or $ImageExists -eq 0) {
        Write-Warn "Dockerfile or requirements.txt changed (or image missing) — will rebuild."
        $NeedsBuild = $true
    } else {
        Write-Info "Docker image is up-to-date. Skipping rebuild."
    }

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 3: STOP STALE CONTAINERS
    # ─────────────────────────────────────────────────────────────────────────
    Write-Step "🧹 3. Stopping any stale containers..."
    docker compose stop 2>$null | Out-Null
    $containers = @("neoface_api", "neoface_worker", "neoface_beat", "neoface_flower", "neoface_postgres", "neoface_redis")
    foreach ($name in $containers) {
        $inspect = docker inspect $name 2>$null
        if ($inspect) {
            docker rm -f $name 2>$null | Out-Null
        }
    }
    Write-Info "Stale containers cleared."

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 4: START BACKEND DOCKER STACK
    # ─────────────────────────────────────────────────────────────────────────
    Write-Step "📦 4. Starting backend (Postgres, Redis, API, Celery)..."
    if ($NeedsBuild) {
        Write-Host "   Building Docker image (this may take a few minutes)..."
        $env:DOCKER_BUILDKIT = "1"
        docker compose build --no-cache api worker beat
        Set-Content -Path $HashFile -Value $CurrentHash
        Write-Info "Image built and cached."
    }

    docker compose up -d
    docker image prune -f 2>$null | Out-Null
    Write-Info "Backend services starting..."

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 5: FRONTEND — Running npm install if package-lock changed
    # ─────────────────────────────────────────────────────────────────────────
    Write-Step "💻 5. Starting frontend dev server..."
    
    Set-Location (Join-Path $ScriptDir "frontend")
    
    $NpmHashFile = Join-Path $CacheDir "npm.hash"
    $LockFile = ""
    if (Test-Path "package-lock.json") { $LockFile = "package-lock.json" }
    elseif (Test-Path "yarn.lock") { $LockFile = "yarn.lock" }
    elseif (Test-Path "pnpm-lock.yaml") { $LockFile = "pnpm-lock.yaml" }

    $NeedsNpmInstall = $false
    if (-not (Test-Path "node_modules")) {
        Write-Warn "node_modules missing — running npm install..."
        $NeedsNpmInstall = $true
    } elseif ($ForceRebuild) {
        Write-Warn "Force rebuild: running npm install..."
        $NeedsNpmInstall = $true
    } elseif ($LockFile -ne "") {
        $NpmCurrent = (Get-FileHash $LockFile -Algorithm MD5).Hash
        $NpmStored = ""
        if (Test-Path $NpmHashFile) {
            $NpmStored = (Get-Content $NpmHashFile -Raw).Trim()
        }
        if ($NpmCurrent -ne $NpmStored) {
            Write-Warn "$LockFile changed — running npm install..."
            $NeedsNpmInstall = $true
        }
    }

    if ($NeedsNpmInstall) {
        # Using cmd /c to ensure npm executes correctly in PowerShell across different system configurations
        cmd.exe /c "npm install --prefer-offline --legacy-peer-deps"
        if ($LockFile -ne "") {
            $NpmCurrent = (Get-FileHash $LockFile -Algorithm MD5).Hash
            Set-Content -Path $NpmHashFile -Value $NpmCurrent
        }
        Write-Info "npm install done."
    } else {
        Write-Info "node_modules up-to-date. Skipping npm install."
    }

    # Start frontend dev server as a background job/process
    $FrontendProcess = Start-Process cmd.exe -ArgumentList "/c npm run dev" -NoNewWindow -PassThru
    Set-Location $ScriptDir

    # ─────────────────────────────────────────────────────────────────────────
    # STARTUP SUMMARY
    # ─────────────────────────────────────────────────────────────────────────
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   ✨ NeoFace is live!                    ║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║  Frontend  →  http://localhost:3000      ║" -ForegroundColor Green
    Write-Host "║  API Docs  →  http://localhost:8000/docs ║" -ForegroundColor Green
    Write-Host "║  Flower    →  http://localhost:5555      ║" -ForegroundColor Green
    Write-Host "║             (admin / neoface_flower_pass)║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║  Press CTRL+C to stop all services       ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Tip: Run .\start.ps1 -Clean to free Docker storage." -ForegroundColor Cyan
    Write-Host "  Tip: Run .\start.ps1 -ForceRebuild to force a full rebuild." -ForegroundColor Cyan
    Write-Host ""

    # Monitor frontend process and wait for interrupt
    while ($true) {
        Start-Sleep -Seconds 1
        if ($FrontendProcess.HasExited) {
            Write-Warn "Frontend process exited unexpectedly."
            break
        }
    }
}
finally {
    # ─────────────────────────────────────────────────────────────────────────
    # CLEANUP / SHUTDOWN ON EXIT
    # ─────────────────────────────────────────────────────────────────────────
    Write-Host ""
    Write-Host "🛑 Shutting down services..." -ForegroundColor Cyan
    
    if ($null -ne $FrontendProcess) {
        if (-not $FrontendProcess.HasExited) {
            Write-Host "   Stopping frontend (PID: $($FrontendProcess.Id))..."
            Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue
        }
    }
    
    Write-Host "   Stopping Docker services..."
    docker compose stop 2>$null | Out-Null
    
    # Return to the root folder just in case
    Set-Location $ScriptDir
    
    Write-Host "`n👋 All services stopped. Run .\start.ps1 to resume." -ForegroundColor Green
}
