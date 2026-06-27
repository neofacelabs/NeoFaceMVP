"""
NeoFace AaaS — Identity Model
Represents an end-user biometric identity registered by a customer application.
Wraps the existing FaceEmbedding infrastructure with multi-tenant scoping.

enrollment_status: pending | enrolled | failed | revoked
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Identity(Base):
    """
    Tenant-scoped identity record.

    external_user_id: the customer's own user ID (e.g. their internal UUID/email)
    face_embedding_id: FK to the existing face_embeddings table (nullable until enrolled)
    """

    __tablename__ = "identities"

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
    external_user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Customer's own user identifier",
    )
    enrollment_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="pending",
        server_default="pending",
        comment="pending | enrolled | failed | revoked",
    )
    # Optional FK into existing face_embeddings table
    face_embedding_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("face_embeddings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    identity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="member",
        server_default="member",
    )
    site: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
        server_default="active",
    )
    metadata_fields: Mapped[dict] = mapped_column(
        "metadata",
        JSON,
        nullable=False,
        default=dict,
        server_default="{}",
    )
    is_fingerprint_enrolled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )
    is_iris_enrolled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
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
        back_populates="identities",
        lazy="select",
    )
    application: Mapped["Application"] = relationship(  # noqa: F821
        "Application",
        back_populates="identities",
        lazy="select",
    )
    sessions: Mapped[list["AuthenticationSession"]] = relationship(  # noqa: F821
        "AuthenticationSession",
        back_populates="identity",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<Identity id={self.id} "
            f"ext={self.external_user_id} "
            f"status={self.enrollment_status}>"
        )
