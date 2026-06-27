"""
NeoFace Verification API
Endpoints:
- POST /api/v1/verify — Verify identity against enrolled users
- POST /api/v1/verify/identity-terminal — Admin face-lookup returning full user profile
"""

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.logging import logger
from app.core.security import TokenData, require_admin
from app.schemas.verification import VerificationResponse
from app.services.verification_service import VerificationService
from app.utils.dependencies import get_client_ip, get_verification_service

router = APIRouter(prefix="/verify", tags=["Face Verification"])

SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = int(settings.MAX_IMAGE_SIZE_MB * 1024 * 1024)


@router.post(
    "",
    response_model=VerificationResponse,
    summary="Verify a face against enrolled users",
    description="""
    Upload a live face image to authenticate against enrolled users.

    **Pipeline (default — `use_pipeline=true`):**

    | Stage | Check | Notes |
    |---|---|---|
    | 1 | Face Detection | InsightFace buffalo_l |
    | 2 | Quality Validation | Blur, resolution, detection score |
    | 3 | Blink Detection | MediaPipe EAR |
    | 4 | Head Movement | Yaw angle ≥ 15° |
    | 5 | Passive Anti-Spoof | MiniFASNet ONNX (heuristic fallback) |
    | 6 | Score Composition | Weighted aggregation |

    **Decision rule:**
    `is_live = anti_spoof_passed AND (blink OR head_turn) AND score ≥ threshold`

    **Authentication threshold:** configurable via `threshold` query param (default 0.65).

    All attempts — success and failure — are written to the audit log.
    """,
    responses={
        200: {"description": "Verification result (authenticated may be false)"},
        400: {"description": "Invalid image or parameters"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def verify_face(
    request: Request,
    image: UploadFile = File(
        ...,
        description="Live face image (JPEG, PNG, or WebP). Max 10 MB.",
    ),
    threshold: float | None = Query(
        default=None,
        ge=0.0,
        le=1.0,
        description="Override cosine similarity threshold (0.0–1.0). Defaults to SIMILARITY_THRESHOLD env var.",
    ),
    use_pipeline: bool = Query(
        default=True,
        description=(
            "Use the full 6-stage pipeline with anti-spoofing (recommended). "
            "Set false to use the lighter single-stage MediaPipe check."
        ),
    ),
    verification_service: VerificationService = Depends(get_verification_service),
) -> VerificationResponse:
    """
    Verify a face image against all enrolled users.

    Always returns 200 with a VerificationResponse — HTTP errors are only raised
    for malformed requests (bad image format, size exceeded, invalid params).
    Authentication failures are expressed via `authenticated: false` in the body.
    """
    # ── Validate content type ─────────────────────────────────────────────────
    if image.content_type and image.content_type not in SUPPORTED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported image type '{image.content_type}'. "
                "Accepted: image/jpeg, image/png, image/webp"
            ),
        )

    # ── Read and validate size ────────────────────────────────────────────────
    image_data = await image.read()

    if len(image_data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file is empty",
        )

    if len(image_data) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image exceeds maximum size of {settings.MAX_IMAGE_SIZE_MB} MB",
        )

    # ── Run verification ──────────────────────────────────────────────────────
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("User-Agent")

    return await verification_service.verify(
        image_bytes=image_data,
        ip_address=ip_address,
        user_agent=user_agent,
        threshold=threshold,
        use_pipeline=use_pipeline,
    )


@router.post(
    "/identity-terminal",
    summary="Admin: Identify a person by face scan (Trust Terminal)",
    description="""
    **Admin-only endpoint** for the NeoFace Trust Terminal.

    Accepts a live webcam frame, runs face detection + 1:N identity matching,
    and returns the matched user's full profile (name, email, role, enrollment status).

    Use this in the Super Admin or Org Admin dashboards to verify who someone is
    without requiring them to log in.
    """,
)
async def identity_terminal_verify_face(
    request: Request,
    image: UploadFile = File(..., description="Live face frame (JPEG/PNG/WebP)"),
    threshold: float | None = Query(default=None, ge=0.0, le=1.0),
    token_data: TokenData = Depends(require_admin),
    verification_service: VerificationService = Depends(get_verification_service),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Admin identity terminal — 1:N face lookup with full profile return.
    Requires admin or super-admin role. Does NOT require the person being
    scanned to be logged in.
    """
    if image.content_type and image.content_type not in SUPPORTED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type. Use JPEG, PNG, or WebP.",
        )

    image_data = await image.read()
    if not image_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image is empty")
    if len(image_data) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Image exceeds {settings.MAX_IMAGE_SIZE_MB}MB limit")

    ip_address = get_client_ip(request)
    user_agent = request.headers.get("User-Agent")

    # Run verification (skip full liveness pipeline for speed in terminal mode)
    result = await verification_service.verify(
        image_bytes=image_data,
        ip_address=ip_address,
        user_agent=user_agent,
        threshold=threshold,
        skip_liveness=True,   # Admin terminal: skip active liveness, just match face
        use_pipeline=False,
    )

    if not result.authenticated or not result.user_id:
        return {
            "identified": False,
            "confidence": result.confidence_score or 0.0,
            "message": result.failure_reason or "No matching identity found in the system.",
            "user": None,
        }

    # Fetch full user profile for admin view
    from app.repositories.user_repository import UserRepository
    from app.repositories.embedding_repository import EmbeddingRepository
    from app.repositories.credential_repository import CredentialRepository

    user_repo = UserRepository(db)
    emb_repo = EmbeddingRepository(db)

    user = await user_repo.get_by_id(result.user_id)
    if not user:
        return {
            "identified": False,
            "confidence": result.confidence_score or 0.0,
            "message": "Matched user record not found.",
            "user": None,
        }

    face_count = await emb_repo.count_by_user(user.id)

    # Check fingerprint (WebAuthn credentials)
    fp_enrolled = False
    try:
        cred_repo = CredentialRepository(db)
        creds = await cred_repo.list_by_user(user.id)
        fp_enrolled = len(creds) > 0
    except Exception:
        pass

    logger.info(
        "identity_terminal.match",
        admin_id=token_data.user_id,
        matched_user=str(user.id),
        confidence=result.confidence_score,
    )

    return {
        "identified": True,
        "confidence": result.confidence_score or 0.0,
        "message": "Identity matched successfully.",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_enrolled": user.is_enrolled,
            "is_fingerprint_enrolled": fp_enrolled,
            "face_embedding_count": face_count,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if hasattr(user, "last_login") and user.last_login else None,
        },
    }
