"""
NeoFace AaaS — API Key Model
API keys are used for machine-to-machine authentication.

Security design:
- key_prefix (12 chars) stored in plaintext for O(1) lookup
- hashed_secret (bcrypt) stored — plaintext NEVER persisted
- Full key format:  nf_live_<12-char-prefix><32-char-random>
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AaaSApiKey(Base):
    """
    API key belonging to an Organization/Application pair.

    scopes example: ["identity:read", "identity:write", "session:read"]
    status: active | revoked | rotated
    """

    __tablename__ = "aaas_api_keys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Human-readable label, e.g. 'Production iOS SDK'",
    )
    key_prefix: Mapped[str] = mapped_column(
        String(12),
        nullable=False,
        index=True,
        comment="First 12 chars of key used for DB lookup",
    )
    hashed_secret: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="bcrypt hash of the full API key — plaintext never stored",
    )
    scopes: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="'[]'::jsonb",
        comment="List of permitted scopes",
    )
    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp of most recent successful authentication",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
        server_default="active",
        comment="active | revoked | rotated",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="api_keys",
        lazy="select",
    )
    application: Mapped["Application | None"] = relationship(  # noqa: F821
        "Application",
        back_populates="api_keys",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<AaaSApiKey id={self.id} prefix={self.key_prefix} status={self.status}>"
