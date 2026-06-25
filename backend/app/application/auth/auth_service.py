"""Authentication use‑cases (sign‑up, login, refresh, profile)."""
from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from app.core.logging import logger
from app.core.security import JWTHandler, PasswordHasher
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse


# ── Errors ─────────────────────────────────────────────────────────────────────
class AuthError(Exception):
    """Base authentication error."""


class InvalidCredentialsError(AuthError):
    pass


class AccountInactiveError(AuthError):
    pass


class EmailAlreadyRegisteredError(AuthError):
    pass


# ── DTOs ───────────────────────────────────────────────────────────────────────
@dataclass(slots=True)
class TokenBundle:
    """Plain dataclass returned by the service so the route layer can wrap it."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ── Service ────────────────────────────────────────────────────────────────────
class AuthService:
    """Coordinates the user repository and the security helpers.

    The route layer talks to this class; it never touches the repository
    directly.  This keeps HTTP concerns separate from business rules.
    """

    def __init__(self, users: UserRepository) -> None:
        self._users = users

    # ── Queries ────────────────────────────────────────────────────────────────
    async def get_profile(self, user_id: UUID | str) -> UserResponse:
        user = await self._users.get_by_id(user_id)
        if user is None:
            raise AuthError("User not found")
        return UserResponse.model_validate(user)

    # ── Commands ───────────────────────────────────────────────────────────────
    async def register(self, payload: UserCreate) -> TokenBundle:
        existing = await self._users.get_by_email(payload.email)
        if existing is not None:
            raise EmailAlreadyRegisteredError(payload.email)

        hashed = PasswordHasher.hash(payload.password)
        user = await self._users.create(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hashed,
            role=payload.role,
        )
        logger.info("User registered", user_id=str(user.id), email=user.email)
        return self._issue_tokens(user)

    async def authenticate(self, email: str, password: str) -> TokenBundle:
        user = await self._users.get_by_email(email)
        if not user or not user.hashed_password:
            raise InvalidCredentialsError("Invalid email or password")

        if not PasswordHasher.verify(password, user.hashed_password):
            logger.warning("Failed login attempt", email=email)
            raise InvalidCredentialsError("Invalid email or password")

        if not user.is_active:
            raise AccountInactiveError("Account is deactivated")

        logger.info("User logged in", user_id=str(user.id), role=user.role)
        return self._issue_tokens(user)

    async def refresh(self, refresh_token_str: str) -> TokenBundle:
        payload = JWTHandler.decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise InvalidCredentialsError("Token is not a refresh token")

        user_id = payload.get("sub")
        if not user_id:
            raise InvalidCredentialsError("Refresh token missing subject")

        user = await self._users.get_by_id(user_id)
        if not user or not user.is_active:
            raise InvalidCredentialsError("User no longer active")

        return self._issue_tokens(user)

    # ── Helpers ────────────────────────────────────────────────────────────────
    def _issue_tokens(self, user: User) -> TokenBundle:
        pair = JWTHandler.create_token_pair(
            user_id=str(user.id),
            email=user.email,
            role=user.role,
        )
        return TokenBundle(
            access_token=pair.access_token,
            refresh_token=pair.refresh_token,
            token_type=pair.token_type,
        )
