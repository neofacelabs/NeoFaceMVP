"""
NeoFace Trust Engine — Database Models
All tables for the Trust Engine modules:
  - liveness_logs
  - emotion_logs
  - headpose_logs
  - deepfake_logs
  - behavior_profiles
  - behavior_events
  - device_trust_logs
  - risk_scores
  - continuous_sessions
  - challenge_logs
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ─────────────────────────────────────────────────────────────────────────────
# BEHAVIOR PROFILES
# ─────────────────────────────────────────────────────────────────────────────

class BehaviorProfile(Base):
    """
    Per-user behavioral biometric baseline profile.
    Updated incrementally as more events are collected.
    """

    __tablename__ = "behavior_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, unique=True, index=True,
    )

    # Mouse baseline
    avg_mouse_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_mouse_curvature: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_hesitation_rate: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Keyboard baseline
    avg_typing_speed_wpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_dwell_time_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_flight_time_ms: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Touch baseline
    avg_swipe_velocity: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_touch_pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_gesture_rhythm: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Profile metadata
    total_events: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    profile_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    is_baseline_established: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    # Model data (serialized IsolationForest/XGBoost state)
    model_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now(),
    )

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], lazy="noload")  # noqa: F821
    events: Mapped[list["BehaviorEvent"]] = relationship(
        "BehaviorEvent", back_populates="profile", cascade="all, delete-orphan", lazy="noload",
    )

    def __repr__(self) -> str:
        return f"<BehaviorProfile user_id={self.user_id} events={self.total_events} baseline={self.is_baseline_established}>"


# ─────────────────────────────────────────────────────────────────────────────
# BEHAVIOR EVENTS
# ─────────────────────────────────────────────────────────────────────────────

class BehaviorEvent(Base):
    """
    Individual behavioral data point captured from client-side SDKs.
    Used to build and update the user's BehaviorProfile.
    """

    __tablename__ = "behavior_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("behavior_profiles.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(30), nullable=False,
        comment="mouse | keyboard | touch",
    )

    # Raw event payload (normalized metrics)
    metrics: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Anomaly flag
    is_anomalous: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    anomaly_score: Mapped[float | None] = mapped_column(Float, nullable=True, comment="IsolationForest anomaly score")

    session_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True,
    )

    profile: Mapped["BehaviorProfile"] = relationship("BehaviorProfile", back_populates="events", lazy="noload")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], lazy="noload")  # noqa: F821

    def __repr__(self) -> str:
        return f"<BehaviorEvent id={self.id} type={self.event_type} anomalous={self.is_anomalous}>"


# ─────────────────────────────────────────────────────────────────────────────
# DEVICE TRUST LOGS
# ─────────────────────────────────────────────────────────────────────────────

class DeviceTrustLog(Base):
    """Records device integrity assessment results."""

    __tablename__ = "device_trust_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )

    device_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    device_platform: Mapped[str | None] = mapped_column(String(20), nullable=True, comment="android | ios | web")

    # Trust score
    device_trust_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Device flags
    is_rooted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_emulator: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_jailbroken: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_virtual_camera: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_headless_browser: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_automation_detected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_usb_debugging: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    # Raw signals
    signals: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True,
    )

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], lazy="noload")  # noqa: F821

    def __repr__(self) -> str:
        return f"<DeviceTrustLog id={self.id} score={self.device_trust_score} platform={self.device_platform}>"


# ─────────────────────────────────────────────────────────────────────────────
# RISK SCORES
# ─────────────────────────────────────────────────────────────────────────────

class RiskScore(Base):
    """
    NeoFace Trust Score — composite risk assessment for each transaction/session.
    Range: 0–100. 90+ = approve, 70–89 = step-up, <70 = reject.
    """

    __tablename__ = "risk_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )
    session_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True, index=True,
    )

    # Component scores (all 0–100)
    face_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    liveness_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    deepfake_score: Mapped[float | None] = mapped_column(Float, nullable=True, comment="Inverted: 100 = no deepfake")
    behavior_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    device_trust_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_trust_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    fingerprint_trust_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Final composite
    final_trust_score: Mapped[float] = mapped_column(Float, nullable=False)
    decision: Mapped[str] = mapped_column(
        String(20), nullable=False,
        comment="approve | step_up | reject",
    )

    # Weights used for this calculation
    weights_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    device_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True,
    )

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], lazy="noload")  # noqa: F821

    def __repr__(self) -> str:
        return f"<RiskScore id={self.id} score={self.final_trust_score} decision={self.decision}>"


# ─────────────────────────────────────────────────────────────────────────────
# CONTINUOUS SESSIONS
# ─────────────────────────────────────────────────────────────────────────────

class ContinuousSession(Base):
    """
    Tracks an ongoing continuous authentication session.
    Checks are performed every 30 seconds after initial login.
    """

    __tablename__ = "continuous_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    session_token: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)

    # Session lifecycle
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active",
        comment="active | suspended | terminated | reauth_required",
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    terminated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    termination_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Current trust level
    current_trust_score: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    reauth_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    check_interval_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=30, server_default="30")

    # Device + context
    device_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(),
    )

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], lazy="noload")  # noqa: F821

    def __repr__(self) -> str:
        return f"<ContinuousSession id={self.id} user={self.user_id} status={self.status} score={self.current_trust_score}>"


# ─────────────────────────────────────────────────────────────────────────────
# CHALLENGE LOGS
# ─────────────────────────────────────────────────────────────────────────────

class ChallengeLog(Base):
    """
    Records every challenge-response AI interaction.
    Enforces no-consecutive-repeat rule via history tracking.
    """

    __tablename__ = "challenge_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )
    session_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)

    # Challenge definition
    challenge_type: Mapped[str] = mapped_column(
        String(200), nullable=False,
        comment="e.g. blink_twice, turn_left_smile, open_mouth_blink",
    )
    challenge_steps: Mapped[list | None] = mapped_column(JSONB, nullable=True, comment="Ordered list of actions")

    # Outcome
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_passed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    completion_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    failure_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Anti-replay
    challenge_nonce: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True,
    )

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], lazy="noload")  # noqa: F821

    def __repr__(self) -> str:
        return f"<ChallengeLog id={self.id} type={self.challenge_type} passed={self.is_passed}>"
