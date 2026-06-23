"""
NeoFace WebAuthn Biometric Credential Model

Stores WebAuthn public-key credentials for fingerprint/platform authenticators.
Raw biometric data (images, templates, scans) is NEVER stored.
Only cryptographic artifacts from the device secure enclave are persisted.
"""

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, LargeBinary, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BiometricCredential(Base):
    """
    Stores WebAuthn public-key credentials for platform authenticators
    (Touch ID, Windows Hello, Android Biometric).

    Security model:
      - credential_id: opaque byte string returned by the authenticator
      - public_key:    COSE-encoded EC/RSA public key (never the private key)
      - sign_count:    monotonic counter; used to detect cloned authenticators
    """

    __tablename__ = "biometric_credentials"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    # ── Owner ─────────────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── WebAuthn Credential ───────────────────────────────────────────────────
    credential_id: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
        unique=True,
        comment="Opaque credential ID from the authenticator (base64url raw bytes)",
    )
    public_key: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
        comment="COSE-encoded public key from the authenticator",
    )
    sign_count: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        comment="Monotonic counter; a decrease signals a cloned authenticator",
    )
    aaguid: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
        comment="Authenticator Attestation GUID — identifies authenticator model",
    )

    # ── Device Info ───────────────────────────────────────────────────────────
    device_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        default="My Device",
        comment="User-assigned friendly name for this credential",
    )
    device_metadata: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
        comment="UA string, OS, browser — stored encrypted at rest via column-level policy",
    )

    # ── Status ────────────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
        comment="False = revoked; cannot be used to sign challenges",
    )
    fingerprint_payments_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
        comment="User toggle: allow this credential for payment signing",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="biometric_credentials")  # noqa: F821

    def __repr__(self) -> str:
        return f"<BiometricCredential user={self.user_id} device={self.device_name} active={self.is_active}>"
