"""
NeoFace Auth API
Endpoints:
- POST /api/v1/auth/login      — OAuth2 password flow, returns JWT pair
- POST /api/v1/auth/refresh    — Refresh access token
- POST /api/v1/auth/register   — Register new admin/user account
- GET  /api/v1/auth/me         — Get current user profile
- POST /api/v1/auth/logout     — Invalidate token (client-side for MVP)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import logger
from app.core.security import (
    JWTHandler,
    PasswordHasher,
    TokenData,
    TokenPair,
    get_current_user_token,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenPair,
    summary="Login with email and password",
    description="OAuth2 Password Flow. Returns JWT access + refresh token pair.",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> TokenPair:
    """
    Authenticate with email and password.

    - **username**: User email address
    - **password**: User password

    Returns JWT access token (30 min) and refresh token (7 days).
    """
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(form_data.username)

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not PasswordHasher.verify(form_data.password, user.hashed_password):
        logger.warning("Failed login attempt", email=form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token_pair = JWTHandler.create_token_pair(
        user_id=str(user.id),
        email=user.email,
        role=user.role,
    )

    logger.info("User logged in", user_id=str(user.id), role=user.role)
    return token_pair


@router.post(
    "/refresh",
    response_model=TokenPair,
    summary="Refresh access token",
)
async def refresh_token(
    refresh_token_str: str,
    db: AsyncSession = Depends(get_db),
) -> TokenPair:
    """Exchange a valid refresh token for a new access + refresh token pair."""
    payload = JWTHandler.decode_token(refresh_token_str)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type — expected refresh token",
        )

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(payload["sub"])

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return JWTHandler.create_token_pair(
        user_id=str(user.id),
        email=user.email,
        role=user.role,
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    schema: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Register a new user with email and password.
    This creates an account; biometric enrollment is a separate step.
    """
    user_repo = UserRepository(db)

    if await user_repo.exists_by_email(schema.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed = PasswordHasher.hash(schema.password)
    user = await user_repo.create(schema, hashed_password=hashed)

    logger.info("New user registered", user_id=str(user.id), email=user.email)
    return UserResponse.model_validate(user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
async def get_current_user(
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    from uuid import UUID

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(UUID(token_data.user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    # Resolve organization role using Firestore
    org_role = None
    try:
        m_docs = await db.collection("org_memberships").where("user_id", "==", str(user.id)).limit(1).get()
        if m_docs:
            org_role = m_docs[0].to_dict().get("role")
    except Exception as exc:
        logger.error("get_current_user: failed to load org_role from Firestore", error=str(exc))

    response = UserResponse.model_validate(user)
    response.org_role = org_role
    return response


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout (client-side token invalidation)",
)
async def logout(
    token_data: TokenData = Depends(get_current_user_token),
) -> dict:
    """
    Logout endpoint.

    MVP: Token invalidation is client-side (delete token from storage).
    Production upgrade: Maintain token blacklist in Redis.
    """
    logger.info("User logged out", user_id=token_data.user_id)
    return {"message": "Logged out successfully"}


# ── Google / Firebase Auth ─────────────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    id_token: str


@router.post(
    "/google",
    response_model=TokenPair,
    status_code=status.HTTP_200_OK,
    summary="Sign in with Google via Firebase",
    description=(
        "Accepts a Firebase ID token obtained by the frontend after Google sign-in. "
        "Verifies the token server-side using firebase-admin, then finds or creates "
        "a NeoFace user in Postgres and returns a native JWT access/refresh token pair."
    ),
)
async def google_sign_in(
    payload: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenPair:
    """
    Google OAuth sign-in bridge.

    Flow:
    1. Frontend calls Firebase signInWithPopup() → gets Firebase ID token
    2. Frontend sends that token to this endpoint
    3. We verify the token with firebase-admin (checks Google's signing keys)
    4. We find or create the user in our Postgres database
    5. We return our own JWT pair — the rest of the API works unchanged
    """
    from app.services.firebase_service import verify_firebase_id_token

    firebase_payload = verify_firebase_id_token(payload.id_token)

    if not firebase_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Firebase token verification failed. "
                "Ensure FIREBASE_CREDENTIALS_JSON is set and the token is valid."
            ),
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not firebase_payload.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not have an associated email address.",
        )

    user_repo = UserRepository(db)

    # Find existing user or auto-create one
    user = await user_repo.get_by_email(firebase_payload.email)
    if not user:
        user = await user_repo.create_biometric_user(
            name=firebase_payload.name or firebase_payload.email.split("@")[0],
            email=firebase_payload.email,
        )
        # Link Google users to default organization
        from app.repositories.organization_repository import OrganizationRepository
        org_repo = OrganizationRepository(db)
        default_org = await org_repo.get_default()
        if default_org:
            await org_repo.add_member(default_org.id, user.id, role="member")
            logger.info("New Google user added to default organization as member")
    else:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated.",
            )
        logger.info("Existing user signed in via Google Auth", user_id=str(user.id))

    token_pair = JWTHandler.create_token_pair(
        user_id=str(user.id),
        email=user.email,
        role=user.role,
    )
    return token_pair

