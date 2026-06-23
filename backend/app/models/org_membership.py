"""
NeoFace AaaS — Org Membership Model
Links platform Users (admin/user) to Organizations with a role.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OrgMembership(Base):
    """
    Many-to-many bridge: User ↔ Organization with a role.

    role: owner | admin | member
    One user can belong to multiple organizations (e.g. consultants).
    """

    __tablename__ = "org_memberships"
    __table_args__ = (
        UniqueConstraint("organization_id", "user_id", name="uq_org_user"),
    )

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
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="member",
        server_default="member",
        comment="owner | admin | member",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="memberships",
        lazy="select",
    )
    user: Mapped["User"] = relationship(  # noqa: F821
        "User",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<OrgMembership org={self.organization_id} "
            f"user={self.user_id} role={self.role}>"
        )
