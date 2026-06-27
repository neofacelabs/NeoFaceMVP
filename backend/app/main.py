"""
NeoFace Backend — Application Entry Point
FastAPI application factory with full lifecycle management.

Architecture:
- Clean layered architecture (API → Services → Repositories → DB)
- Async-first throughout (asyncpg, async SQLAlchemy)
- Dependency injection via FastAPI Depends
- Structured logging via Loguru
- Rate limiting via slowapi
- Swagger UI + ReDoc documentation
"""

import os
# Force single-threaded execution for numerical libraries to prevent thread-safety segfaults on macOS/ARM
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
# Matplotlib cache dir — /home/neoface is not writable in the Render container
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

import socket as _socket
# ── Force IPv4-only DNS resolution ────────────────────────────────────────────
# Render's cloud instances cannot reach Supabase over IPv6 (Network unreachable).
# Patching getaddrinfo at startup ensures asyncpg and all other network clients
# always resolve to IPv4 addresses only.
_orig_getaddrinfo = _socket.getaddrinfo
def _force_ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    try:
        results = _orig_getaddrinfo(host, port, _socket.AF_INET, type, proto, flags)
        if results:
            return results
    except _socket.gaierror:
        pass
    return _orig_getaddrinfo(host, port, family, type, proto, flags)
_socket.getaddrinfo = _force_ipv4_getaddrinfo

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.v1 import (
    auth, dashboard, enrollment, users, verification,
    merchants, biometrics, webauthn,
    # Trust Engine v2
    liveness, emotion, headpose, deepfake, risk, device_trust, behavioral, continuous_auth,
    webrtc, trust_engine,
    # AaaS
    api_keys, identities, sessions, analytics, audit_logs, webhooks,
    projects, waitlist,
)
from app.api.admin import organizations as admin_orgs
from app.api.admin import metrics as admin_metrics
from app.api.admin import fraud as admin_fraud
from app.api.admin import models as admin_models
from app.api.admin import infrastructure as admin_infra
from app.api.admin import projects as admin_projects
from app.api.admin import identities as admin_identities
from app.api.admin import authentication as admin_authentication
from app.api.admin import devices as admin_devices
from app.api.admin import security as admin_security
from app.api.admin import reports as admin_reports
from app.api.admin import integrations as admin_integrations
from app.api.admin import audit_logs as admin_audit_logs
from app.api.admin import notifications as admin_notifications
from app.api.admin import settings as admin_settings
from app.core.config import settings
from app.core.database import close_db, init_db
from app.core.logging import logger, setup_logging
from app.services.face_detector import FaceDetectorService
from app.utils.dependencies import get_face_detector


# ── Rate limiter ───────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application startup and shutdown lifecycle.
    - Startup: Configure logging, init DB, bootstrap admin, load AI models
    - Shutdown: Release DB connection pool
    """
    # ── Startup ───────────────────────────────────────────────────────────────
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Initialize database tables
    await init_db()

    # Model verification check
    # Only runs when STRICT_MODEL_VERIFICATION=true.
    # When false (default in production without bundled models), startup
    # continues with a warning — models lazy-load or fall back to heuristics.
    import os
    if settings.STRICT_MODEL_VERIFICATION:
        required_models = [
            settings.ANTI_SPOOF_MODEL_PATH,
            settings.MINIFASNET_V1_PATH,
            settings.MINIFASNET_V2_PATH,
            settings.EMOTION_MODEL_PATH,
            settings.MIDAS_SMALL_PATH,
            settings.DPT_HYBRID_PATH,
            settings.EFFICIENTNET_DEEPFAKE_PATH,
            settings.XCEPTIONNET_DEEPFAKE_PATH,
        ]
        missing = [p for p in required_models if p and not os.path.exists(p)]
        if missing:
            msg = f"Model verification failed. Missing weights: {missing}"
            logger.error(f"CRITICAL: {msg}")
            raise RuntimeError(msg)
    else:
        # Soft check — log which models are missing but never crash
        required_models = [
            settings.ANTI_SPOOF_MODEL_PATH,
            settings.MINIFASNET_V1_PATH,
            settings.MINIFASNET_V2_PATH,
            settings.EMOTION_MODEL_PATH,
            settings.MIDAS_SMALL_PATH,
            settings.DPT_HYBRID_PATH,
            settings.EFFICIENTNET_DEEPFAKE_PATH,
            settings.XCEPTIONNET_DEEPFAKE_PATH,
        ]
        missing = [p for p in required_models if p and not os.path.exists(p)]
        if missing:
            logger.warning(
                f"Model weights not found (non-fatal, STRICT_MODEL_VERIFICATION=false): {missing}. "
                "API endpoints requiring these models will use fallback heuristics."
            )

    # Bootstrap admin user
    await bootstrap_admin()

    # ── ML Model Loading ──────────────────────────────────────────────────────
    # Models are LAZY-LOADED by default (loaded on first request).
    # Set PRELOAD_MODELS=true to warm them up at startup (requires ≥4GB RAM).
    preload = os.environ.get("PRELOAD_MODELS", "false").lower() == "true"
    if preload:
        logger.info("PRELOAD_MODELS=true — warming up ML models at startup...")
        try:
            from app.services.anti_spoof_service import AntiSpoofService
            from app.services.deepfake_service import DeepfakeService
            from app.services.depth_estimation_service import DepthEstimationService
            from app.services.emotion_service import EmotionService
            from app.services.passive_liveness_service import PassiveLivenessService
            detector = get_face_detector()
            detector.initialize()
            AntiSpoofService.get_instance().initialize()
            PassiveLivenessService.get_instance().initialize()
            EmotionService.get_instance().initialize()
            DepthEstimationService.get_instance().initialize()
            DeepfakeService.get_instance().initialize()
            logger.info("ML model warmup complete")
        except Exception as e:
            logger.warning(f"ML model warmup failed (non-fatal, will lazy-load): {e}")
    else:
        logger.info("ML models will lazy-load on first request (set PRELOAD_MODELS=true to pre-warm)")

    logger.info(f"{settings.APP_NAME} is ready to accept requests")
    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("Shutting down NeoFace backend...")
    await close_db()
    logger.info("Shutdown complete")


async def bootstrap_admin() -> None:
    """
    Create default admin and demo users if they don't exist.
    Credentials are loaded from environment variables and defaults.
    """
    from app.core.database import AsyncSessionLocal
    from app.core.security import PasswordHasher
    from app.repositories.user_repository import UserRepository
    from app.repositories.organization_repository import OrganizationRepository
    from app.schemas.user import UserCreate

    async with AsyncSessionLocal() as session:
        user_repo = UserRepository(session)
        org_repo = OrganizationRepository(session)

        default_org = await org_repo.get_default()
        if not default_org:
            logger.warning("Default organization not seeded yet. Skipping membership seeding.")

        # 1. Super Admin
        if not await user_repo.exists_by_email(settings.ADMIN_EMAIL):
            hashed = PasswordHasher.hash(settings.ADMIN_PASSWORD)
            admin_schema = UserCreate(
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL,
                password=settings.ADMIN_PASSWORD,
            )
            user = await user_repo.create(admin_schema, hashed_password=hashed, role="admin")
            if default_org:
                await org_repo.add_member(default_org.id, user.id, role="owner")
            await session.commit()
            logger.info("Admin user bootstrapped", email=settings.ADMIN_EMAIL)
        else:
            logger.debug("Admin user already exists", email=settings.ADMIN_EMAIL)
        # 2. Org Admin
        org_admin_email = "orgadmin@neoface.io"
        if not await user_repo.exists_by_email(org_admin_email):
            hashed = PasswordHasher.hash("AdminPass123!")
            org_admin_schema = UserCreate(
                name="Demo Org Admin",
                email=org_admin_email,
                password="AdminPass123!",
            )
            user = await user_repo.create(org_admin_schema, hashed_password=hashed, role="user")
            if default_org:
                await org_repo.add_member(default_org.id, user.id, role="admin")
            await session.commit()
            logger.info("Org admin user bootstrapped", email=org_admin_email)
        else:
            logger.debug("Org admin user already exists", email=org_admin_email)

        # 3. Regular Member
        member_email = "member@neoface.io"
        if not await user_repo.exists_by_email(member_email):
            hashed = PasswordHasher.hash("AdminPass123!")
            member_schema = UserCreate(
                name="Demo Member User",
                email=member_email,
                password="AdminPass123!",
            )
            user = await user_repo.create(member_schema, hashed_password=hashed, role="user")
            if default_org:
                await org_repo.add_member(default_org.id, user.id, role="member")
            await session.commit()
            logger.info("Member user bootstrapped", email=member_email)
        else:
            logger.debug("Member user already exists", email=member_email)
# ── Application factory ────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    Called once at module level.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description="""
## NeoFace Labs — Authentication as a Service

Production-grade API powering biometric authentication infrastructure for developers and enterprises.

### Core Capabilities
- **Face Authentication** — ArcFace 512-d embedding + real-time liveness detection
- **Identity Management** — Multi-tenant identity enrollment and verification
- **Trust Engine** — Deepfake detection, behavioral biometrics, continuous auth
- **Webhook Delivery** — HMAC-signed event streaming with automatic retry

### API Access
All protected endpoints accept either:
- `x-api-key` header for machine-to-machine (M2M) calls
- `Authorization: Bearer <token>` for dashboard-authenticated users

Obtain a JWT via `POST /api/v1/auth/login`.

### Tech Stack
InsightFace • ArcFace • MediaPipe • FastAPI • PostgreSQL • Redis • Celery
        """,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        contact={
            "name": "NeoFace Engineering",
            "email": "engineering@neoface.io",
        },
        license_info={
            "name": "Proprietary",
        },
        lifespan=lifespan,
    )

    # ── Rate limiter state ────────────────────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Middleware stack ──────────────────────────────────────────────────────
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID", "x-api-key"],
    )

    # GZip compression for responses > 1KB
    app.add_middleware(GZipMiddleware, minimum_size=1024)

    # Rate limiting
    app.add_middleware(SlowAPIMiddleware)

    # ── Request timing middleware ─────────────────────────────────────────────
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        process_time = (time.perf_counter() - start) * 1000
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        return response

    # ── Global exception handler ──────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(
            "Unhandled exception",
            path=str(request.url),
            method=request.method,
            error=str(exc),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "path": str(request.url.path),
            },
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    API_PREFIX = "/api/v1"

    app.include_router(auth.router, prefix=API_PREFIX)
    app.include_router(enrollment.router, prefix=API_PREFIX)
    app.include_router(verification.router, prefix=API_PREFIX)
    app.include_router(users.router, prefix=API_PREFIX)
    app.include_router(dashboard.router, prefix=API_PREFIX)
    # Payment infrastructure routers
    app.include_router(merchants.router, prefix=API_PREFIX)
    app.include_router(biometrics.router, prefix=API_PREFIX)
    app.include_router(webauthn.router, prefix=API_PREFIX)

    # ── Trust Engine v2 Routers ───────────────────────────────────────────────
    app.include_router(liveness.router, prefix=API_PREFIX)
    app.include_router(emotion.router, prefix=API_PREFIX)
    app.include_router(headpose.router, prefix=API_PREFIX)
    app.include_router(deepfake.router, prefix=API_PREFIX)
    app.include_router(risk.router, prefix=API_PREFIX)
    app.include_router(device_trust.router, prefix=API_PREFIX)
    app.include_router(behavioral.router, prefix=API_PREFIX)
    app.include_router(continuous_auth.router, prefix=API_PREFIX)
    app.include_router(webrtc.router, prefix=API_PREFIX)
    app.include_router(trust_engine.router, prefix=API_PREFIX)

    # ── AaaS Routers (v1) ─────────────────────────────────────────────────────
    app.include_router(api_keys.router, prefix=API_PREFIX)
    app.include_router(identities.router, prefix=API_PREFIX)
    app.include_router(sessions.router, prefix=API_PREFIX)
    app.include_router(analytics.router, prefix=API_PREFIX)
    app.include_router(audit_logs.router, prefix=API_PREFIX)
    app.include_router(webhooks.router, prefix=API_PREFIX)
    app.include_router(projects.router, prefix=API_PREFIX)
    app.include_router(waitlist.router, prefix=API_PREFIX)

    # ── Admin Routers ─────────────────────────────────────────────────────────
    ADMIN_PREFIX = "/api/admin"
    app.include_router(admin_orgs.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_metrics.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_fraud.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_models.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_infra.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_projects.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_identities.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_authentication.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_devices.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_security.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_reports.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_integrations.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_audit_logs.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_notifications.router, prefix=ADMIN_PREFIX)
    app.include_router(admin_settings.router, prefix=ADMIN_PREFIX)

    # ── Root health endpoint ──────────────────────────────────────────────────
    @app.get("/", tags=["Health"], summary="Root health check")
    async def root():
        return {
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "online",
            "docs": "/docs",
        }

    @app.get("/health", tags=["Health"], summary="Health check")
    async def health():
        return {"status": "healthy", "service": settings.APP_NAME}

    @app.get("/health/deep", tags=["Health"], summary="Deep health check (DB + Redis + models)")
    async def health_deep():
        """
        Checks all critical dependencies:
        - PostgreSQL connectivity
        - Redis connectivity
        - ONNX model file presence

        Returns 200 if all healthy, 503 if any check fails.
        """
        import os
        checks: dict[str, str] = {}
        healthy = True

        # ── Database ──────────────────────────────────────────────────────────
        try:
            from app.core.database import AsyncSessionLocal
            from sqlalchemy import text
            async with AsyncSessionLocal() as session:
                await session.execute(text("SELECT 1"))
            checks["database"] = "ok"
        except Exception as e:
            checks["database"] = f"error: {e}"
            healthy = False

        # ── Redis ─────────────────────────────────────────────────────────────
        try:
            import redis.asyncio as aioredis
            r = aioredis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
            await r.ping()
            await r.aclose()
            checks["redis"] = "ok"
        except Exception as e:
            checks["redis"] = f"error: {e}"
            healthy = False

        # ── ONNX Models ───────────────────────────────────────────────────────
        model_paths = {
            "anti_spoof": settings.ANTI_SPOOF_MODEL_PATH,
            "liveness_v1": settings.MINIFASNET_V1_PATH,
            "liveness_v2": settings.MINIFASNET_V2_PATH,
            "emotion": settings.EMOTION_MODEL_PATH,
            "midas_small": settings.MIDAS_SMALL_PATH,
            "dpt_hybrid": settings.DPT_HYBRID_PATH,
            "deepfake_primary": settings.EFFICIENTNET_DEEPFAKE_PATH,
            "deepfake_secondary": settings.XCEPTIONNET_DEEPFAKE_PATH,
        }
        model_status = {}
        for name, path in model_paths.items():
            if path and os.path.exists(path):
                size_mb = os.path.getsize(path) / 1024 / 1024
                model_status[name] = f"ok ({size_mb:.1f} MB)"
            else:
                model_status[name] = "missing (heuristic fallback active)"
        checks["models"] = model_status

        from fastapi.responses import JSONResponse as _JSONResponse
        status_code = 200 if healthy else 503
        return _JSONResponse(
            status_code=status_code,
            content={
                "status": "healthy" if healthy else "degraded",
                "service": settings.APP_NAME,
                "checks": checks,
            },
        )

    return app


# ── Application instance ───────────────────────────────────────────────────────
app = create_app()
