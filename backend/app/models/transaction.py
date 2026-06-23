"""
NeoFace Transaction Model
Represents a biometrically-authorized payment transaction.
Each transaction is linked to its biometric verification details.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Transaction(Base):
    """
    Transaction table — the core financial event record.

    Lifecycle:
        pending  → authorized (biometric passed) → settled (funds moved)
        pending  → failed     (biometric failed or risk rejected)
        settled  → refunded   (partial or full reversal)
    """

    __tablename__ = "transactions"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Transaction unique identifier",
    )

    # ── Participants ──────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Paying user (null if biometric did not resolve to a known user)",
    )
    merchant_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("merchants.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Receiving merchant",
    )
    bank_account_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Source bank account used for settlement (denormalized for audit)",
    )

    # ── Financials ────────────────────────────────────────────────────────────
    amount: Mapped[float] = mapped_column(
        Numeric(precision=18, scale=4),
        nullable=False,
        comment="Transaction amount (positive = debit from user)",
    )
    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="USD",
        server_default="USD",
        comment="ISO 4217 currency code",
    )
    amount_settled: Mapped[float | None] = mapped_column(
        Numeric(precision=18, scale=4),
        nullable=True,
        comment="Actual settled amount (may differ due to fx fees)",
    )

    # ── Status ────────────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        server_default="pending",
        index=True,
        comment="pending | authorized | settled | failed | refunded",
    )
    failure_reason: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Human-readable failure reason if status=failed",
    )

    # ── Biometric Authorization ───────────────────────────────────────────────
    biometric_modality: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="face",
        comment="face | iris | fingerprint | multi_modal",
    )
    fusion_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Final biometric fusion score (0.0–1.0) used to authorize",
    )
    is_liveness_passed: Mapped[bool] = mapped_column(
        String(5),  # stored as string for DB portability; cast in Python
        nullable=False,
        default="false",
        server_default="false",
        comment="Anti-spoofing liveness check result",
    )

    # ── Merchant Reference ────────────────────────────────────────────────────
    merchant_reference: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
        comment="Merchant's own order/invoice ID for reconciliation",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Human-readable payment description",
    )

    # ── Metadata ──────────────────────────────────────────────────────────────
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
        comment="Client IP address at time of payment (IPv4 or IPv6)",
    )
    device_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Device fingerprint or terminal ID",
    )
    user_agent: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="User agent / SDK version string",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="Transaction initiation timestamp",
    )
    authorized_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Biometric authorization completion timestamp",
    )
    settled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Settlement completion timestamp",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="transactions",
        lazy="select",
    )
    merchant: Mapped["Merchant"] = relationship(  # noqa: F821
        "Merchant",
        back_populates="transactions",
        lazy="select",
    )
    biometric_detail: Mapped["TransactionBiometricDetail"] = relationship(
        "TransactionBiometricDetail",
        back_populates="transaction",
        cascade="all, delete-orphan",
        uselist=False,
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<Transaction id={self.id} amount={self.amount} {self.currency} "
            f"status={self.status} modality={self.biometric_modality}>"
        )


class TransactionBiometricDetail(Base):
    """
    Stores the biometric signal breakdown for each transaction.
    Separated from Transaction for normalization and audit compliance.
    """

    __tablename__ = "transaction_biometric_details"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
        comment="Parent transaction",
    )

    # ── Per-modality scores ───────────────────────────────────────────────────
    face_similarity_score: Mapped[float | None] = mapped_column(Float, nullable=True, comment="ArcFace cosine similarity (0–1)")
    face_liveness_score: Mapped[float | None] = mapped_column(Float, nullable=True, comment="Face liveness score (0–100)")
    iris_hamming_distance: Mapped[float | None] = mapped_column(Float, nullable=True, comment="Iris IrisCode Hamming Distance (0–1, lower=better)")
    iris_match_score: Mapped[float | None] = mapped_column(Float, nullable=True, comment="Derived iris match confidence (0–1)")
    fingerprint_match_score: Mapped[float | None] = mapped_column(Float, nullable=True, comment="Minutiae match score (0–1)")
    fusion_score: Mapped[float | None] = mapped_column(Float, nullable=True, comment="Weighted fusion score (0–1)")

    # ── Liveness flags ────────────────────────────────────────────────────────
    face_liveness_passed: Mapped[bool] = mapped_column(String(5), nullable=False, default="false", server_default="false")
    anti_spoof_passed: Mapped[bool] = mapped_column(String(5), nullable=False, default="false", server_default="false")
    blink_detected: Mapped[bool] = mapped_column(String(5), nullable=False, default="false", server_default="false")
    head_turn_detected: Mapped[bool] = mapped_column(String(5), nullable=False, default="false", server_default="false")

    # ── Raw payload hashes (for audit — never store raw biometric bytes here) ──
    face_embedding_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="SHA-256 of the face embedding used")
    iris_code_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="SHA-256 of the IrisCode used")
    fingerprint_template_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="SHA-256 of the fingerprint template used")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    transaction: Mapped["Transaction"] = relationship(
        "Transaction",
        back_populates="biometric_detail",
    )

    def __repr__(self) -> str:
        return f"<TransactionBiometricDetail txn_id={self.transaction_id} fusion={self.fusion_score}>"
