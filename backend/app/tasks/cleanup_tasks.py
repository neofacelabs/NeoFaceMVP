"""
NeoFace Trust Engine — Cleanup Background Tasks using Firebase Firestore.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

from celery.utils.log import get_task_logger

from app.tasks.celery_app import celery_app

logger = get_task_logger(__name__)

# Retention periods
_CHALLENGE_LOG_RETENTION_DAYS    = 30
_DEVICE_LOG_RETENTION_DAYS       = 90
_BEHAVIOR_EVENT_RETENTION_DAYS   = 180
_TERMINATED_SESSION_RETENTION_DAYS = 30


@celery_app.task(
    name="app.tasks.cleanup_tasks.cleanup_expired_challenges",
    bind=True,
    max_retries=2,
)
def cleanup_expired_challenges(self) -> dict:
    """Remove expired (unfulfilled) challenge log entries."""
    try:
        return asyncio.run(_cleanup_challenges_async())
    except Exception as exc:
        logger.error("cleanup_expired_challenges: error", exc_info=True)
        raise self.retry(exc=exc)


async def _cleanup_challenges_async() -> dict:
    from app.core.database import _get_firestore_client

    cutoff = datetime.now(timezone.utc) - timedelta(days=_CHALLENGE_LOG_RETENTION_DAYS)
    db = _get_firestore_client()

    col = db.collection("challenge_logs").where("created_at", "<", cutoff)
    docs = await col.get()
    
    deleted = 0
    for doc in docs:
        await doc.reference.delete()
        deleted += 1

    logger.info("cleanup.challenges: purged old records (count=%d, cutoff=%s)", deleted, cutoff.isoformat())
    return {"deleted_challenge_logs": deleted}


@celery_app.task(
    name="app.tasks.cleanup_tasks.archive_old_audit_logs",
    bind=True,
    max_retries=1,
)
def archive_old_audit_logs(self) -> dict:
    """
    Prune old Trust Engine log records beyond retention windows.
    """
    try:
        return asyncio.run(_archive_logs_async())
    except Exception as exc:
        logger.error("archive_old_audit_logs: error", exc_info=True)
        raise self.retry(exc=exc)


async def _archive_logs_async() -> dict:
    from app.core.database import _get_firestore_client

    now = datetime.now(timezone.utc)
    totals: dict[str, int] = {}
    db = _get_firestore_client()

    # Device trust logs
    cutoff = now - timedelta(days=_DEVICE_LOG_RETENTION_DAYS)
    docs = await db.collection("device_trust_logs").where("created_at", "<", cutoff).get()
    deleted = 0
    for doc in docs:
        await doc.reference.delete()
        deleted += 1
    totals["device_trust_logs"] = deleted

    # Behavior events
    cutoff = now - timedelta(days=_BEHAVIOR_EVENT_RETENTION_DAYS)
    docs = await db.collection("behavior_events").where("created_at", "<", cutoff).get()
    deleted = 0
    for doc in docs:
        await doc.reference.delete()
        deleted += 1
    totals["behavior_events"] = deleted

    # Terminated continuous sessions
    cutoff = now - timedelta(days=_TERMINATED_SESSION_RETENTION_DAYS)
    docs = await (db.collection("continuous_sessions")
                  .where("status", "==", "terminated")
                  .where("terminated_at", "<", cutoff)
                  .get())
    deleted = 0
    for doc in docs:
        await doc.reference.delete()
        deleted += 1
    totals["continuous_sessions"] = deleted

    logger.info("cleanup.archive: completed (totals=%s)", str(totals))
    return totals


@celery_app.task(
    name="app.tasks.cleanup_tasks.cleanup_terminated_sessions",
    bind=True,
)
def cleanup_terminated_sessions(self) -> dict:
    """Remove old terminated sessions."""
    try:
        return asyncio.run(_cleanup_sessions_async())
    except Exception as exc:
        raise self.retry(exc=exc)


async def _cleanup_sessions_async() -> dict:
    from app.core.database import _get_firestore_client

    cutoff = datetime.now(timezone.utc) - timedelta(days=_TERMINATED_SESSION_RETENTION_DAYS)
    db = _get_firestore_client()

    docs = await (db.collection("continuous_sessions")
                  .where("status", "==", "terminated")
                  .where("terminated_at", "<", cutoff)
                  .get())
    deleted = 0
    for doc in docs:
        await doc.reference.delete()
        deleted += 1

    return {"deleted_sessions": deleted}
