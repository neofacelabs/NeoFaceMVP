"""
NeoFace AaaS — Audit Event Model
Append-only AaaS-specific audit trail.
Separate from the legacy audit_logs table to avoid coupling.

event_type examples:
    identity.enrolled | identity.verified | api_key.created | api_key.rotated
    liveness.passed | liveness.failed | settings.changed
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuditEvent(Base):
    """
    Immutable AaaS audit event.

    Design:
    - Append-only (never UPDATE or DELETE)
    - actor_id nullable — system-generated events have no actor
    - entity_type + entity_id: polymorphic resource reference (no FK constraint)
    - metadata_ JSONB: flexible per-event context
    """

    __tablename__ = "audit_events"

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
    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Platform user who triggered this event; null for automated actions",
    )
    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="e.g. identity.enrolled, api_key.created, liveness.failed",
    )
    entity_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="Type of affected entity, e.g. 'identity', 'api_key'",
    )
    entity_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="UUID string of the affected entity",
    )
    metadata_: Mapped[dict[str, Any] | None] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
        comment="Event-specific context as JSONB",
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="audit_events",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<AuditEvent id={self.id} "
            f"type={self.event_type} entity={self.entity_type}/{self.entity_id}>"
        )
