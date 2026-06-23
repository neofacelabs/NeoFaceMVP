"""
NeoFace AaaS — Webhook Models
WebhookEndpoint: customer-registered URL that receives event notifications.
WebhookDelivery:  delivery attempt log with retry state.

Signing: HMAC-SHA256 with a per-endpoint secret.
Retries: up to 3 attempts via Celery with exponential backoff.
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class WebhookEndpoint(Base):
    """
    Customer-registered webhook endpoint.

    events (JSONB): list of subscribed event types, e.g.
        ["identity.enrolled", "liveness.failed", "session.created"]
    status: active | paused | disabled
    """

    __tablename__ = "webhook_endpoints"

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
    url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Destination URL for POST delivery",
    )
    signing_secret: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="HMAC-SHA256 signing secret (stored encrypted at rest)",
    )
    events: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default="'[]'::jsonb",
        comment="Subscribed event types",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
        server_default="active",
        comment="active | paused | disabled",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    organization: Mapped["Organization"] = relationship(  # noqa: F821
        "Organization",
        back_populates="webhook_endpoints",
        lazy="select",
    )
    deliveries: Mapped[list["WebhookDelivery"]] = relationship(
        "WebhookDelivery",
        back_populates="endpoint",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<WebhookEndpoint id={self.id} url={self.url[:40]} status={self.status}>"


class WebhookDelivery(Base):
    """
    Individual delivery attempt for a webhook event.
    One event may generate multiple deliveries if retries are needed.

    status: pending | success | failed | retrying
    """

    __tablename__ = "webhook_deliveries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    endpoint_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("webhook_endpoints.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        comment="Full event payload sent to the endpoint",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="pending",
        server_default="pending",
        comment="pending | success | failed | retrying",
    )
    http_status: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="HTTP response status code from the destination",
    )
    attempts: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
        comment="Number of delivery attempts made so far",
    )
    next_retry_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    endpoint: Mapped["WebhookEndpoint"] = relationship(
        "WebhookEndpoint",
        back_populates="deliveries",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<WebhookDelivery id={self.id} "
            f"event={self.event_type} status={self.status} attempts={self.attempts}>"
        )
