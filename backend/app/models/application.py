"""
NeoFace AaaS — Application Model
A logical grouping of identities and sessions within an organization.
Supports multiple environments (development / staging / production).
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Application(Base):
    """
    Customer application registered under an Organization.

    environment: development | staging | production
    status: active | inactive | archived
    """

    __tablename__ = "applications"

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
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    environment: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="production",
        server_default="production",
        comment="development | staging | production",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
        server_default="active",
        comment="active | inactive | archived",
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    allowed_origins: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    allowed_domains: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    webhook_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rate_limit: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=100,
        server_default="100"
    )
    site_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
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
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="applications",
        lazy="select",
    )
    site: Mapped["Site | None"] = relationship(  # noqa: F821
        "Site",
        lazy="select",
    )
    api_keys: Mapped[list["AaaSApiKey"]] = relationship(  # noqa: F821
        "AaaSApiKey",
        back_populates="application",
        cascade="all, delete-orphan",
        lazy="select",
    )
    sessions: Mapped[list["AuthenticationSession"]] = relationship(  # noqa: F821
        "AuthenticationSession",
        back_populates="application",
        cascade="all, delete-orphan",
        lazy="select",
    )
    identities: Mapped[list["Identity"]] = relationship(  # noqa: F821
        "Identity",
        back_populates="application",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Application id={self.id} name={self.name} env={self.environment}>"
