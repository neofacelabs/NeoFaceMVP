"""
NeoFace AaaS — Model Version Registry
Tracks deployed ML model versions with accuracy metrics.
Seeded at startup from config; updated by eval pipeline when available.

status: active | shadow | archived
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ModelVersion(Base):
    """
    ML model version with performance metrics.

    model_name: face_recognition | liveness | anti_spoof | deepfake | emotion
    accuracy:   top-1 accuracy on internal eval set (0.0–1.0)
    far:        False Acceptance Rate (0.0–1.0)
    frr:        False Rejection Rate (0.0–1.0)
    latency_ms: median inference latency in milliseconds
    """

    __tablename__ = "model_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="e.g. face_recognition, liveness, anti_spoof, deepfake",
    )
    version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Semver or date-based version string, e.g. '2.1.0'",
    )
    accuracy: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Top-1 accuracy on internal eval set",
    )
    far: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="False Acceptance Rate",
    )
    frr: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="False Rejection Rate",
    )
    latency_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Median inference latency in milliseconds",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
        server_default="active",
        comment="active | shadow | archived",
    )
    deployed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="When this version was promoted to active",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    def __repr__(self) -> str:
        return (
            f"<ModelVersion model={self.model_name} "
            f"v={self.version} status={self.status}>"
        )
