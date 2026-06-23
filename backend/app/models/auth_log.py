"""
NeoFace Authentication Log Model
Immutable audit trail for all verification attempts.
Used for dashboard analytics, fraud detection, and compliance.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuthLog(Base):
    """
    Immutable authentication event log.

    Every verification attempt is recorded regardless of outcome.
    Records are append-only — never mutated after creation.
    """

    __tablename__ = "auth_logs"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Log entry unique identifier",
    )

    # ── User Reference (nullable — failed attempts may not identify user) ─────
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Matched user (null if no match found)",
    )

    # ── Scores ────────────────────────────────────────────────────────────────
    confidence_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Face similarity score vs. stored embedding (0.0–1.0)",
    )
    liveness_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Liveness detection score (0–100)",
    )

    # ── Result ────────────────────────────────────────────────────────────────
    authentication_result: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        comment="True if authentication succeeded",
    )
    failure_reason: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Human-readable failure reason when authentication_result=false",
    )

    # ── Request Metadata ──────────────────────────────────────────────────────
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
        comment="IPv4 or IPv6 address of the requester",
    )
    user_agent: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
        comment="HTTP User-Agent header",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="Event timestamp (server UTC)",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User | None"] = relationship(  # noqa: F821
        "User",
        back_populates="auth_logs",
    )

    def __repr__(self) -> str:
        return (
            f"<AuthLog id={self.id} user_id={self.user_id} "
            f"result={self.authentication_result} ts={self.timestamp}>"
        )
