"""
NeoFace Bank Account Model
Represents a user's linked bank account for biometric payment settlement.
Stores only masked/tokenized data — never raw account numbers.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BankAccount(Base):
    """
    BankAccount table — linked financial accounts for payment settlement.

    Security design:
    - Full account numbers are NEVER stored.
    - encrypted_token holds the Plaid/Stripe bank token or an AES-encrypted reference.
    - account_mask stores only the last 4 digits for display purposes.
    """

    __tablename__ = "bank_accounts"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Bank account record unique identifier",
    )

    # ── Foreign Key ───────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
        comment="Owner user reference (intentionally no FK to allow soft-linking)",
    )

    # ── Bank Identity ─────────────────────────────────────────────────────────
    bank_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Display name of the bank (e.g. Chase, Wells Fargo)",
    )
    account_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="checking",
        comment="checking | savings | business",
    )
    account_mask: Mapped[str] = mapped_column(
        String(4),
        nullable=False,
        comment="Last 4 digits of account number for display",
    )
    routing_mask: Mapped[str | None] = mapped_column(
        String(4),
        nullable=True,
        comment="Last 4 digits of routing number (display only)",
    )
    account_holder_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Name on the bank account",
    )

    # ── Secure Token ─────────────────────────────────────────────────────────
    encrypted_token: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
        comment="Encrypted Plaid access token / Stripe bank token / internal ref",
    )
    token_provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="internal",
        comment="internal | plaid | stripe | manual",
    )
    external_account_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
        comment="Provider-side account ID (e.g. Plaid account_id)",
    )

    # ── Status ────────────────────────────────────────────────────────────────
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        comment="Micro-deposit or instant verification passed",
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        comment="Primary account used for payments if multiple are linked",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
        comment="Soft-delete flag",
    )

    # ── Currency ──────────────────────────────────────────────────────────────
    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="USD",
        server_default="USD",
        comment="ISO 4217 currency code",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    linked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="When the account was linked",
    )
    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When the account was verified",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Last update timestamp",
    )

    def __repr__(self) -> str:
        return (
            f"<BankAccount id={self.id} bank={self.bank_name} "
            f"mask=****{self.account_mask} user_id={self.user_id}>"
        )
