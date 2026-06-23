"""
NeoFace Merchant Model
Represents a business entity that accepts biometric payments via NeoFace.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Merchant(Base):
    """
    Merchant table — registered businesses accepting NeoFace biometric payments.

    Relationships:
        transactions: 1-to-many (all payments received by this merchant)
    """

    __tablename__ = "merchants"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Merchant unique identifier",
    )

    # ── Identity ──────────────────────────────────────────────────────────────
    business_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Registered business name",
    )
    business_email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
        comment="Business contact / API owner email",
    )
    business_category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="e.g. retail, hospitality, healthcare, e-commerce",
    )
    website_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Merchant website",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Short description of the business",
    )

    # ── API Credentials ───────────────────────────────────────────────────────
    api_key_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
        comment="bcrypt-hashed API key for merchant-facing payment requests",
    )
    api_key_prefix: Mapped[str | None] = mapped_column(
        String(12),
        nullable=True,
        comment="First 8 chars of API key for display (e.g. nf_live_ab12)",
    )

    # ── Status & Verification ─────────────────────────────────────────────────
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        comment="KYB (Know Your Business) verification passed",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
        comment="Soft-disable a merchant without deleting records",
    )
    is_sandbox: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
        comment="True = sandbox / test mode, False = live payments",
    )

    # ── Financial ─────────────────────────────────────────────────────────────
    settlement_account: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Encrypted bank account or settlement reference for payouts",
    )
    default_currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="USD",
        server_default="USD",
        comment="ISO 4217 currency code",
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
        comment="Last update timestamp",
    )
    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="KYB verification approval timestamp",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    transactions: Mapped[list["Transaction"]] = relationship(  # noqa: F821
        "Transaction",
        back_populates="merchant",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Merchant id={self.id} name={self.business_name}>"
