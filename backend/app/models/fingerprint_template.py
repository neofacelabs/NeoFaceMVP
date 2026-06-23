"""
NeoFace Fingerprint Template Model
Stores ISO/IEC 19794-2 compliant minutiae templates.
Each user can enroll up to 10 fingerprints (multiple fingers).
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, LargeBinary, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FingerprintTemplate(Base):
    """
    FingerprintTemplate table — stores minutiae-based fingerprint templates.

    Design:
    - template_data: ISO/IEC 19794-2 binary minutiae template (up to 1KB per finger).
    - finger_position: follows ISO/IEC 19794-2 finger position codes (0–10).
    - Each user may enroll multiple fingers for redundancy and convenience.

    Storage note:
    - LargeBinary(2048) = max 2KB per template to support extended ISO format.
    - Raw fingerprint images are NEVER stored — only feature templates.
    """

    __tablename__ = "fingerprint_templates"

    # ── Finger position codes (ISO/IEC 19794-2) ───────────────────────────────
    FINGER_POSITIONS = {
        0: "unknown",
        1: "right_thumb",
        2: "right_index",
        3: "right_middle",
        4: "right_ring",
        5: "right_little",
        6: "left_thumb",
        7: "left_index",
        8: "left_middle",
        9: "left_ring",
        10: "left_little",
    }

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Fingerprint template record unique identifier",
    )

    # ── Foreign Key ───────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Owner user reference",
    )

    # ── Template Data ─────────────────────────────────────────────────────────
    template_data: Mapped[bytes] = mapped_column(
        LargeBinary(length=2048),
        nullable=False,
        comment="Binary minutiae template in ISO/IEC 19794-2 format",
    )

    # ── Finger Metadata ───────────────────────────────────────────────────────
    finger_position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=2,
        comment="ISO 19794-2 finger position code (1=right_thumb, 2=right_index, ...)",
    )
    finger_position_label: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
        comment="Human-readable finger position (e.g. right_index)",
    )
    minutiae_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Number of minutiae points extracted",
    )
    quality_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="NIST fingerprint quality score (0–100, NFIQ2)",
    )
    ridge_density: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Ridge density metric (ridges per mm) — enrollment quality indicator",
    )

    # ── Capture Metadata ──────────────────────────────────────────────────────
    capture_device: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="Scanner model / hardware SDK used (e.g. Futronic FS80H)",
    )
    capture_dpi: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Image resolution at capture in DPI (typically 500 or 1000)",
    )
    impression_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="live_scan",
        comment="live_scan | rolled | latent",
    )
    source_image_bytes: Mapped[bytes | None] = mapped_column(
        LargeBinary,
        nullable=True,
        comment="Raw source fingerprint image bytes",
    )

    # ── Version ───────────────────────────────────────────────────────────────
    algorithm_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="minutiae_v1",
        comment="Minutiae extraction algorithm version tag",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Enrollment timestamp",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="fingerprint_templates",
        lazy="select",
    )

    def __repr__(self) -> str:
        pos = self.FINGER_POSITIONS.get(self.finger_position, "unknown")
        return (
            f"<FingerprintTemplate id={self.id} user_id={self.user_id} "
            f"finger={pos} quality={self.quality_score}>"
        )
