"""
NeoFace Iris Embedding Model
Stores binary IrisCodes derived from Gabor-filtered iris images.
Each user can have up to 2 enrolled iris samples (left eye, right eye).
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, LargeBinary, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class IrisEmbedding(Base):
    """
    IrisEmbedding table — stores the binary IrisCode from each enrolled iris.

    Design:
    - iris_code: 256-byte binary IrisCode from 2D Gabor wavelet decomposition.
    - iris_mask: 256-byte binary mask indicating unreliable bits (eyelash/reflection occlusions).
    - eye_side: left | right — both eyes can be enrolled for 2-factor iris.
    - hamming_threshold: per-record stored threshold for this user's enrollment quality.

    Storage note:
    - LargeBinary(256) maps to PostgreSQL BYTEA, fast for XOR operations.
    """

    __tablename__ = "iris_embeddings"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="IrisEmbedding record unique identifier",
    )

    # ── Foreign Key ───────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Owner user reference",
    )

    # ── IrisCode Data ─────────────────────────────────────────────────────────
    iris_code: Mapped[bytes] = mapped_column(
        LargeBinary(length=256),
        nullable=False,
        comment="256-byte binary IrisCode from 2D Gabor phase extraction",
    )
    iris_mask: Mapped[bytes | None] = mapped_column(
        LargeBinary(length=256),
        nullable=True,
        comment="256-byte occlusion mask (1=reliable, 0=occluded by eyelash/glare)",
    )

    # ── Eye Metadata ──────────────────────────────────────────────────────────
    eye_side: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
        default="right",
        comment="left | right",
    )
    iris_radius_px: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Detected iris radius in pixels (quality indicator)",
    )
    pupil_radius_px: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Detected pupil radius in pixels",
    )
    quality_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Enrollment image quality score (0–100)",
    )
    usable_bits_ratio: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Fraction of non-occluded bits in the IrisCode (0.0–1.0)",
    )

    # ── Version ───────────────────────────────────────────────────────────────
    algorithm_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="gabor_v1",
        comment="IrisCode algorithm version tag for future re-enrollment",
    )
    source_image_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Path to the source iris image (local or S3)",
    )
    source_image_bytes: Mapped[bytes | None] = mapped_column(
        LargeBinary,
        nullable=True,
        comment="Raw source enrollment image bytes (JPEG or PNG)",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Enrollment timestamp",
    )

    # ── Relationship ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="iris_embeddings",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<IrisEmbedding id={self.id} user_id={self.user_id} "
            f"eye={self.eye_side} quality={self.quality_score}>"
        )
