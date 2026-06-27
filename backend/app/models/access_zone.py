import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AccessZone(Base):
    """
    Represents a secured area within a physical Site.
    """

    __tablename__ = "access_zones"

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
    site_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    allowed_identities: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list, server_default="'[]'::jsonb")
    allowed_projects: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list, server_default="'[]'::jsonb")
    allowed_schedule: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict, server_default="'{}'::jsonb")
    assigned_devices: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list, server_default="'[]'::jsonb")
    security_policies: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict, server_default="'{}'::jsonb")
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

    # Relationships
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        lazy="select",
    )
    site: Mapped["Site"] = relationship(  # noqa: F821
        "Site",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<AccessZone id={self.id} name={self.name}>"
