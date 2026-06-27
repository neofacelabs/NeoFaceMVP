import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Device(Base):
    """
    Represents an edge device (e.g. face camera, fingerprint reader, turnstile, gate).
    """

    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # turnstile, face_camera, fingerprint_reader
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="offline", server_default="offline")
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    firmware_version: Mapped[str] = mapped_column(String(50), nullable=False, default="1.0.0", server_default="1.0.0")
    health_score: Mapped[int] = mapped_column(Integer, nullable=False, default=100, server_default="100")
    battery_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    last_heartbeat: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
    )
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="SET NULL"),
        nullable=True,
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

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", lazy="select")  # noqa: F821
    application: Mapped["Application"] = relationship("Application", lazy="select")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Device id={self.id} name={self.name} type={self.type} status={self.status}>"
