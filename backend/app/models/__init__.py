"""
Models package — import ALL models here so SQLAlchemy metadata is fully
populated before create_all() or Alembic env.py runs.

Import order matters: User must be imported before models that reference it
via foreign keys, so SQLAlchemy can resolve the relationships correctly.
"""

from app.models.user import User
from app.models.face_embedding import FaceEmbedding
from app.models.iris_embedding import IrisEmbedding
from app.models.fingerprint_template import FingerprintTemplate
from app.models.auth_log import AuthLog
from app.models.enrollment_log import EnrollmentLog
from app.models.verification_log import VerificationLog
from app.models.audit_log import AuditLog
from app.models.merchant import Merchant
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction, TransactionBiometricDetail
from app.models.biometric_credential import BiometricCredential

# ── Trust Engine Models (NeoFace Trust Engine v2) ─────────────────────────────
from app.models.trust_engine import (
    LivenessLog,
    EmotionLog,
    HeadPoseLog,
    DeepfakeLog,
    BehaviorProfile,
    BehaviorEvent,
    DeviceTrustLog,
    RiskScore,
    ContinuousSession,
    ChallengeLog,
)

# ── AaaS Multi-Tenant Models ──────────────────────────────────────────────────
from app.models.organization import Organization
from app.models.application import Application
from app.models.org_membership import OrgMembership
from app.models.api_key import AaaSApiKey
from app.models.identity import Identity
from app.models.auth_session import AuthenticationSession
from app.models.usage_record import UsageRecord
from app.models.audit_event import AuditEvent
from app.models.webhook import WebhookEndpoint, WebhookDelivery
from app.models.model_version import ModelVersion
from app.models.waitlist_entry import WaitlistEntry

__all__ = [
    # Core
    "User",
    "FaceEmbedding",
    "IrisEmbedding",
    "FingerprintTemplate",
    "AuthLog",
    "EnrollmentLog",
    "VerificationLog",
    "AuditLog",
    "Merchant",
    "BankAccount",
    "Transaction",
    "TransactionBiometricDetail",
    "BiometricCredential",
    # Trust Engine
    "LivenessLog",
    "EmotionLog",
    "HeadPoseLog",
    "DeepfakeLog",
    "BehaviorProfile",
    "BehaviorEvent",
    "DeviceTrustLog",
    "RiskScore",
    "ContinuousSession",
    "ChallengeLog",
    # AaaS Multi-Tenant
    "Organization",
    "Application",
    "OrgMembership",
    "AaaSApiKey",
    "Identity",
    "AuthenticationSession",
    "UsageRecord",
    "AuditEvent",
    "WebhookEndpoint",
    "WebhookDelivery",
    "ModelVersion",
    "WaitlistEntry",
]
