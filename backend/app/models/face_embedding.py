"""
NeoFace Face Embedding Model
Stores the 512-dimensional ArcFace embedding vector for each enrolled user.
Supports multiple embeddings per user (e.g., different angles / lighting).
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, LargeBinary, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FaceEmbedding(Base):
    """
    Stores ArcFace 512-dimensional embedding vectors.

    Design notes:
    - ARRAY(Float) is PostgreSQL-native and supports vector operations.
    - For production at scale, consider pgvector extension for ANN search.
    - embedding_version tracks the ArcFace model version for future reprocessing.
    """

    __tablename__ = "face_embeddings"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Embedding record unique identifier",
    )

    # ── Foreign Key ───────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Owner user reference",
    )

    # ── Embedding Data ────────────────────────────────────────────────────────
    embedding_vector: Mapped[list[float]] = mapped_column(
        ARRAY(Float),
        nullable=False,
        comment="512-dimensional ArcFace face embedding (L2-normalized)",
    )
    embedding_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="arcface_r100_v1",
        comment="Model version tag — used for re-enrollment on model upgrade",
    )
    embedding_dimension: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=512,
        comment="Vector dimension (should always be 512 for ArcFace R100)",
    )

    # ── Quality Metadata ──────────────────────────────────────────────────────
    quality_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Face image quality score at enrollment (0-100)",
    )
    source_image_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Path to source enrollment image (local or S3 key)",
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
        comment="Embedding creation timestamp",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="face_embeddings",
    )

    def __repr__(self) -> str:
        return (
            f"<FaceEmbedding id={self.id} user_id={self.user_id} "
            f"version={self.embedding_version}>"
        )
