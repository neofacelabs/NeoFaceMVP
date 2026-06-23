"""
NeoFace User Model
Represents a registered user in the system.
Supports both end-users (biometric subjects) and admin accounts.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    """
    User table — core identity record.

    Relationships:
        face_embeddings: 1-to-many (one user may have multiple embedding records)
        auth_logs: 1-to-many (full verification history per user)
    """

    __tablename__ = "users"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="User unique identifier",
    )

    # ── Identity ──────────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Full display name",
    )
    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique email address",
    )
    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="Optional E.164 phone number",
    )

    # ── Auth ──────────────────────────────────────────────────────────────────
    hashed_password: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="bcrypt hashed password (null for biometric-only users)",
    )
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="user",
        server_default="user",
        comment="user | admin",
    )

    # ── Status ────────────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
        comment="Soft-delete / account suspension flag",
    )
    is_enrolled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        comment="True once face enrollment is complete",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Account creation timestamp",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Last profile update timestamp",
    )

    # ── Biometric Flags ───────────────────────────────────────────────────────
    is_iris_enrolled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        comment="True once iris enrollment is complete",
    )
    is_fingerprint_enrolled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        comment="True once fingerprint enrollment is complete",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    face_embeddings: Mapped[list["FaceEmbedding"]] = relationship(  # noqa: F821
        "FaceEmbedding",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    iris_embeddings: Mapped[list["IrisEmbedding"]] = relationship(  # noqa: F821
        "IrisEmbedding",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    fingerprint_templates: Mapped[list["FingerprintTemplate"]] = relationship(  # noqa: F821
        "FingerprintTemplate",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    auth_logs: Mapped[list["AuthLog"]] = relationship(  # noqa: F821
        "AuthLog",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    enrollment_logs: Mapped[list["EnrollmentLog"]] = relationship(  # noqa: F821
        "EnrollmentLog",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    verification_logs: Mapped[list["VerificationLog"]] = relationship(  # noqa: F821
        "VerificationLog",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(  # noqa: F821
        "AuditLog",
        back_populates="actor",
        cascade="all, delete-orphan",
        lazy="select",
        foreign_keys="AuditLog.actor_id",
    )
    transactions: Mapped[list["Transaction"]] = relationship(  # noqa: F821
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    biometric_credentials: Mapped[list["BiometricCredential"]] = relationship(  # noqa: F821
        "BiometricCredential",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
