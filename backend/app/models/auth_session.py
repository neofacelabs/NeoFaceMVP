"""
NeoFace AaaS — Authentication Session Model
Records every authentication event (enrollment, verification, liveness, auth).
Provides the data source for the Sessions page and usage analytics.

event_type: enrollment | verification | liveness | authentication
status:     success | failure | pending | challenge
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuthenticationSession(Base):
    """
    Immutable record of a single authentication attempt.

    confidence_score: 0.0–1.0 biometric match confidence
    risk_score:       0.0–100.0 from Trust Engine (higher = riskier)
    latency_ms:       end-to-end processing time
    """

    __tablename__ = "authentication_sessions"

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
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    identity_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("identities.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="enrollment | verification | liveness | authentication",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="success | failure | pending | challenge",
    )
    confidence_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Biometric match confidence 0.0–1.0",
    )
    risk_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Trust Engine risk score 0.0–100.0",
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    device_fingerprint: Mapped[str | None] = mapped_column(String(512), nullable=True)
    latency_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="End-to-end processing time in milliseconds",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    application: Mapped["Application"] = relationship(  # noqa: F821
        "Application",
        back_populates="sessions",
        lazy="select",
    )
    identity: Mapped["Identity | None"] = relationship(  # noqa: F821
        "Identity",
        back_populates="sessions",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<AuthenticationSession id={self.id} "
            f"type={self.event_type} status={self.status}>"
        )
