"""
NeoFace AaaS — Usage Record Model
Pre-aggregated daily metrics per org/app/endpoint.
Upserted by the request middleware — avoids counting individual rows at query time.

Unique constraint on (org_id, app_id, endpoint, date) allows idempotent UPSERT.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UsageRecord(Base):
    """
    Daily aggregation bucket.

    Populated via INSERT ... ON CONFLICT DO UPDATE (UPSERT) in the
    session recording pipeline. Never read individual API call rows.
    """

    __tablename__ = "usage_records"
    __table_args__ = (
        UniqueConstraint(
            "organization_id", "application_id", "endpoint", "bucket_date",
            name="uq_usage_org_app_endpoint_date",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    endpoint: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="API endpoint path, e.g. '/api/v1/identities'",
    )
    bucket_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
        comment="UTC date of the aggregation bucket",
    )
    request_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    success_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failure_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    avg_latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    def __repr__(self) -> str:
        return (
            f"<UsageRecord org={self.organization_id} "
            f"endpoint={self.endpoint} date={self.bucket_date} "
            f"requests={self.request_count}>"
        )
