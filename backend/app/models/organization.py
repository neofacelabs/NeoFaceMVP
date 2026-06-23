"""
NeoFace AaaS — Organization Model
Multi-tenant root entity. Every application, API key, identity,
session, and audit event belongs to exactly one organization.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Organization(Base):
    """
    Top-level tenant boundary.

    Plans: free | starter | pro | enterprise
    Status: active | suspended | trial | cancelled
    """

    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Organization unique identifier",
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Display name",
    )
    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        comment="URL-safe unique identifier, e.g. 'acme-corp'",
    )
    plan: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="free",
        server_default="free",
        comment="Subscription plan: free | starter | pro | enterprise",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
        server_default="active",
        comment="Lifecycle status: active | suspended | trial | cancelled",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    applications: Mapped[list["Application"]] = relationship(  # noqa: F821
        "Application",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="select",
    )
    api_keys: Mapped[list["AaaSApiKey"]] = relationship(  # noqa: F821
        "AaaSApiKey",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="select",
    )
    memberships: Mapped[list["OrgMembership"]] = relationship(  # noqa: F821
        "OrgMembership",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="select",
    )
    identities: Mapped[list["Identity"]] = relationship(  # noqa: F821
        "Identity",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="select",
    )
    audit_events: Mapped[list["AuditEvent"]] = relationship(  # noqa: F821
        "AuditEvent",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="select",
    )
    webhook_endpoints: Mapped[list["WebhookEndpoint"]] = relationship(  # noqa: F821
        "WebhookEndpoint",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Organization id={self.id} slug={self.slug} plan={self.plan}>"
