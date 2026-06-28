"""
NeoFace Auth Log Repository
Data access layer for authentication event logs using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from google.cloud.firestore import AsyncClient

from app.models.auth_log import AuthLog


class AuthLogRepository:
    """Repository for authentication log operations in Firestore."""

    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    # ── Write ─────────────────────────────────────────────────────────────────

    async def create(
        self,
        authentication_result: bool,
        user_id: uuid.UUID | None = None,
        confidence_score: float | None = None,
        liveness_score: float | None = None,
        failure_reason: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> AuthLog:
        """Append a new authentication event to the audit trail."""
        lid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        log = AuthLog(
            id=lid,
            user_id=uuid.UUID(str(user_id)) if user_id else None,
            confidence_score=confidence_score,
            liveness_score=liveness_score,
            authentication_result=authentication_result,
            failure_reason=failure_reason,
            ip_address=ip_address,
            user_agent=user_agent,
            timestamp=now,
        )
        doc_ref = self.db.collection("auth_logs").document(str(lid))
        data = log.to_dict()
        data.pop("id", None)
        if user_id:
            data["user_id"] = str(user_id)
        await doc_ref.set(data)
        return log

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_recent(
        self,
        page: int = 1,
        page_size: int = 50,
        user_id: uuid.UUID | None = None,
    ) -> tuple[list[AuthLog], int]:
        """
        Paginated recent logs, optionally filtered by user.
        Returns (logs, total_count).
        """
        col = self.db.collection("auth_logs")
        query = col
        if user_id:
            query = query.where("user_id", "==", str(user_id))

        count_res = await query.count().get()
        total = count_res[0].value

        offset = (page - 1) * page_size
        query = query.order_by("timestamp", direction="DESCENDING").offset(offset).limit(page_size)
        docs = await query.get()

        logs = []
        for doc in docs:
            data = doc.to_dict()
            uid = uuid.UUID(data.get("user_id")) if data.get("user_id") else None
            logs.append(AuthLog(
                id=uuid.UUID(doc.id),
                user_id=uid,
                confidence_score=data.get("confidence_score"),
                liveness_score=data.get("liveness_score"),
                authentication_result=data.get("authentication_result", False),
                failure_reason=data.get("failure_reason"),
                ip_address=data.get("ip_address"),
                user_agent=data.get("user_agent"),
                timestamp=data.get("timestamp"),
            ))
        return logs, total

    # ── Analytics ─────────────────────────────────────────────────────────────

    async def count_total(self) -> int:
        col = self.db.collection("auth_logs")
        res = await col.count().get()
        return res[0].value

    async def count_successful(self) -> int:
        col = self.db.collection("auth_logs").where("authentication_result", "==", True)
        res = await col.count().get()
        return res[0].value

    async def get_success_rate(self) -> float:
        """Returns success percentage (0.0–100.0)."""
        total = await self.count_total()
        if total == 0:
            return 0.0
        successful = await self.count_successful()
        return round((successful / total) * 100, 2)

    async def get_daily_stats(self, days: int = 7) -> list[dict]:
        """
        Returns daily enrollment/verification counts for the last N days.
        Used by the dashboard analytics chart.
        """
        since = datetime.now(timezone.utc) - timedelta(days=days)
        col = self.db.collection("auth_logs")
        query = col.where("timestamp", ">=", since)
        docs = await query.get()

        stats = {}
        for i in range(days):
            d = (datetime.now(timezone.utc) - timedelta(days=i)).date()
            stats[str(d)] = {"date": str(d), "total": 0, "successful": 0}

        for doc in docs:
            data = doc.to_dict()
            ts = data.get("timestamp")
            if not ts:
                continue
            if isinstance(ts, str):
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            else:
                dt = ts
            date_str = str(dt.date())
            if date_str in stats:
                stats[date_str]["total"] += 1
                if data.get("authentication_result") is True:
                    stats[date_str]["successful"] += 1

        sorted_stats = [stats[k] for k in sorted(stats.keys())]
        return sorted_stats

    async def delete_older_than(self, days: int = 90) -> int:
        """Cleanup logs older than N days."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        col = self.db.collection("auth_logs").where("timestamp", "<", cutoff)
        docs = await col.get()
        deleted_count = 0
        for doc in docs:
            await doc.reference.delete()
            deleted_count += 1
        return deleted_count
