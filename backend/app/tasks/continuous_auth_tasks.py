"""
NeoFace Trust Engine — Continuous Authentication Background Tasks
Runs every 30 seconds to sweep active sessions and apply score decay using Firebase Firestore.
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone, timedelta

from celery.utils.log import get_task_logger

from app.tasks.celery_app import celery_app
from app.services.continuous_auth_service import (
    ContinuousAuthService,
    REAUTH_THRESHOLD,
    SUSPEND_THRESHOLD,
)

logger = get_task_logger(__name__)

_cont_auth_svc = ContinuousAuthService()


@celery_app.task(
    name="app.tasks.continuous_auth_tasks.sweep_continuous_sessions",
    bind=True,
    max_retries=2,
    default_retry_delay=10,
)
def sweep_continuous_sessions(self) -> dict:
    """
    Sweep all active continuous authentication sessions.
    Apply score decay for sessions that have missed their check window.
    """
    try:
        result = asyncio.run(_sweep_sessions_async())
        return result
    except Exception as exc:
        logger.error("sweep_continuous_sessions: error", exc_info=True)
        raise self.retry(exc=exc)


async def _sweep_sessions_async() -> dict:
    """Async implementation of session sweep."""
    from app.core.database import _get_firestore_client
    from app.models.trust_engine import ContinuousSession

    updated_count = 0
    suspended_count = 0
    now = datetime.now(timezone.utc)
    db = _get_firestore_client()

    # Load active sessions
    col = db.collection("continuous_sessions")
    # Fetch where status is active or reauth_required
    docs = await col.get()
    
    sessions = []
    for doc in docs:
        data = doc.to_dict()
        status = data.get("status")
        if status in ("active", "reauth_required"):
            sessions.append({
                "id": doc.id,
                "doc_ref": doc.reference,
                "user_id": data.get("user_id"),
                "session_token": data.get("session_token"),
                "status": status,
                "current_trust_score": data.get("current_trust_score", 100.0),
                "check_interval_seconds": data.get("check_interval_seconds", 30),
                "last_verified_at": data.get("last_verified_at"),
            })

    for session in sessions:
        # Format verified timestamp
        lv = session["last_verified_at"]
        if isinstance(lv, str):
            lv_dt = datetime.fromisoformat(lv.replace("Z", "+00:00"))
        else:
            lv_dt = lv

        session_dict = {
            "current_trust_score": session["current_trust_score"],
            "last_verified_at": lv_dt.isoformat() if lv_dt else None,
            "check_interval_seconds": session["check_interval_seconds"],
        }

        # Check if overdue
        if not ContinuousAuthService.should_check_now(session_dict):
            continue

        interval = session["check_interval_seconds"] or 30
        since = now - timedelta(seconds=2 * interval)
        
        # Query recent behavior events in Firestore
        events_col = db.collection("behavior_events")
        typing_docs = await (events_col
                             .where("user_id", "==", str(session["user_id"]))
                             .where("event_type", "==", "keyboard")
                             .where("created_at", ">=", since)
                             .get())
        active_user_typing = len(typing_docs) > 0

        # Apply decay
        decayed = ContinuousAuthService.apply_score_decay(session_dict, active_user_typing=active_user_typing)
        new_score = decayed["current_trust_score"]

        if new_score == session["current_trust_score"]:
            continue

        updates = {
            "current_trust_score": new_score,
            "updated_at": now,
        }
        updated_count += 1

        # Status transitions from decay
        new_status = session["status"]
        if new_score < SUSPEND_THRESHOLD and session["status"] == "active":
            new_status = "suspended"
            updates["status"] = "suspended"
            suspended_count += 1
            logger.info(
                "continuous_auth.sweep: session suspended (decay)",
                session_id=session["id"],
                score=new_score,
            )
        elif new_score < REAUTH_THRESHOLD and session["status"] == "active":
            new_status = "reauth_required"
            updates["status"] = "reauth_required"
            logger.info(
                "continuous_auth.sweep: reauth required (decay)",
                session_id=session["id"],
                score=new_score,
            )

        # Save to Firestore doc
        await session["doc_ref"].update(updates)

    return {
        "sessions_checked": len(sessions),
        "sessions_updated": updated_count,
        "sessions_suspended": suspended_count,
        "swept_at": now.isoformat(),
    }
