"""
NeoFace Enrollment Log Model
Records every face enrollment attempt — both successful and failed.

Each row captures the images submitted, how many passed quality checks,
the average quality score, and the final enrollment status.
Used for operational monitoring, debugging, and compliance auditing.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class EnrollmentLog(Base):
    """
    Immutable log of a single enrollment session.

    One row is written per enrollment attempt regardless of outcome.
    Records are append-only — never mutated after insertion.

    Columns:
        id                  Unique log entry identifier.
        user_id             The user being enrolled (FK → users.id).
        images_submitted    Total images received in the enrollment request.
        images_accepted     Images that passed quality and detection checks.
        avg_quality_score   Mean quality score across accepted images (0–100).
        status              Final outcome: "success" | "partial" | "failed".
        error_message       Human-readable reason when status != "success".
        created_at          Timestamp of the enrollment attempt (server UTC).
    """

    __tablename__ = "enrollment_logs"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Enrollment log entry unique identifier",
    )

    # ── Foreign Key ───────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="User being enrolled",
    )

    # ── Submission Statistics ─────────────────────────────────────────────────
    images_submitted: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of images received in this enrollment request",
    )
    images_accepted: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Images that passed face detection and quality checks",
    )
    avg_quality_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Mean quality score for accepted images (0–100); null if none accepted",
    )

    # ── Outcome ───────────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="failed",
        comment="Enrollment outcome: success | partial | failed",
    )
    error_message: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Failure details when status != 'success'",
    )

    # ── Timestamp ─────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="Enrollment attempt timestamp (server UTC)",
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="enrollment_logs",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<EnrollmentLog id={self.id} user_id={self.user_id} "
            f"status={self.status} submitted={self.images_submitted}>"
        )
