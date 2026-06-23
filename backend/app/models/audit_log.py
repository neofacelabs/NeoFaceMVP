"""
NeoFace Audit Log Model
Immutable record of all privileged and administrative actions in the system.

Every significant state change — user creation, role change, deletion,
admin actions, bulk operations — should emit one row here via the
audit service so there is a full, tamper-evident trail for compliance.

The JSONB metadata column allows flexible, schema-free capture of
action-specific context (e.g. old/new values, affected record counts).
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuditLog(Base):
    """
    Immutable audit trail entry.

    Design principles:
      - Append-only: rows are never updated or deleted.
      - actor_id is nullable so system-initiated actions can be recorded
        without a human actor (e.g. scheduled cleanup tasks).
      - resource_type + resource_id provide a polymorphic foreign reference
        without hard FK constraints, allowing cross-table tracking.
      - metadata JSONB stores action-specific context; consumers should not
        rely on a fixed schema — it varies per action type.

    Columns:
        id            Unique log entry identifier.
        actor_id      User who performed the action (null = system/automated).
        action        Machine-readable verb, e.g. "user.create", "user.delete",
                      "enrollment.reset", "admin.role_change".
        resource_type Table/entity affected, e.g. "users", "face_embeddings".
        resource_id   UUID or string identifier of the affected record.
        metadata      Arbitrary JSON context for the action (old/new values, etc.).
        ip_address    Source IP of the request, if available.
        created_at    Event timestamp (server UTC).
    """

    __tablename__ = "audit_logs"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Audit log entry unique identifier",
    )

    # ── Actor (nullable for system-initiated actions) ─────────────────────────
    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="User who performed the action; null for automated/system actions",
    )

    # ── Action ────────────────────────────────────────────────────────────────
    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="Machine-readable action verb, e.g. 'user.create', 'enrollment.reset'",
    )

    # ── Resource (polymorphic reference — no FK constraint) ───────────────────
    resource_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="Entity/table name affected, e.g. 'users', 'face_embeddings'",
    )
    resource_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Identifier of the affected record (UUID as string)",
    )

    # ── Flexible Context ──────────────────────────────────────────────────────
    metadata_: Mapped[dict[str, Any] | None] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
        comment="Action-specific context as JSONB (e.g. old/new field values)",
    )

    # ── Request Metadata ──────────────────────────────────────────────────────
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
        comment="Source IPv4 or IPv6 address of the request",
    )

    # ── Timestamp ─────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="Audit event timestamp (server UTC)",
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    actor: Mapped["User | None"] = relationship(  # noqa: F821
        "User",
        back_populates="audit_logs",
        lazy="select",
        foreign_keys=[actor_id],
    )

    def __repr__(self) -> str:
        return (
            f"<AuditLog id={self.id} actor_id={self.actor_id} "
            f"action={self.action} resource={self.resource_type}/{self.resource_id}>"
        )
