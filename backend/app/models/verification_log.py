"""
NeoFace Verification Log Model
Records every liveness + anti-spoof verification attempt.

Captures full score details, the verification method used, and network metadata.
Distinct from auth_logs: verification_logs focus on the liveness/anti-spoof
pipeline specifically, while auth_logs record the end-to-end authentication result.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class VerificationLog(Base):
    """
    Immutable log of a single liveness/anti-spoof verification event.

    Append-only — rows are never mutated after insertion.

    Columns:
        id                Unique log entry identifier.
        user_id           Associated user if identity was established (nullable).
        liveness_score    Liveness detection score (0–100; higher = more live).
        anti_spoof_score  Anti-spoofing confidence (0–100; higher = more genuine).
        confidence_score  Overall face-match confidence (0.0–1.0).
        result            Verification outcome: "passed" | "failed" | "uncertain".
        method            Pipeline variant used, e.g. "mediapipe_v1", "challenge_v2".
        ip_address        Requester IP (IPv4 or IPv6).
        created_at        Event timestamp (server UTC).
    """

    __tablename__ = "verification_logs"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Verification log entry unique identifier",
    )

    # ── User Reference (nullable — liveness check may precede identity match) ─
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Associated user if identity was established; null for anonymous checks",
    )

    # ── Scores ────────────────────────────────────────────────────────────────
    liveness_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Liveness detection score (0–100; ≥ LIVENESS_THRESHOLD = live)",
    )
    anti_spoof_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Anti-spoof confidence score (0–100; higher = more genuine)",
    )
    confidence_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Face-match confidence against stored embedding (0.0–1.0)",
    )

    # ── Outcome ───────────────────────────────────────────────────────────────
    result: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="failed",
        comment="Verification result: passed | failed | uncertain",
    )
    method: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="Pipeline / model variant used for this check, e.g. 'mediapipe_v1'",
    )

    # ── Request Metadata ──────────────────────────────────────────────────────
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
        comment="Requester IPv4 or IPv6 address",
    )

    # ── Timestamp ─────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="Verification event timestamp (server UTC)",
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user: Mapped["User | None"] = relationship(  # noqa: F821
        "User",
        back_populates="verification_logs",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<VerificationLog id={self.id} user_id={self.user_id} "
            f"result={self.result} liveness={self.liveness_score}>"
        )
