"""
NeoFace AaaS — Analytics Service using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta

from google.cloud.firestore import AsyncClient

from app.repositories.usage_repository import UsageRepository
from app.repositories.session_repository import SessionRepository
from app.repositories.identity_repository import IdentityRepository
from app.schemas.aaas import AnalyticsOverview


class AnalyticsService:
    def __init__(self, db: AsyncClient) -> None:
        self.usage_repo = UsageRepository(db)
        self.session_repo = SessionRepository(db)
        self.identity_repo = IdentityRepository(db)

    async def get_overview(
        self, org_id: uuid.UUID, days: int = 30
    ) -> AnalyticsOverview:
        usage = await self.usage_repo.get_overview(org_id, days=days)
        avg_latency = await self.session_repo.get_avg_latency_by_org(org_id)

        # Daily active identities
        dai = await self._count_distinct_active_identities(org_id, days=1)
        mai = await self._count_distinct_active_identities(org_id, days=30)

        return AnalyticsOverview(
            org_id=org_id,
            period_days=days,
            total_requests=usage["total_requests"],
            success_rate=usage["success_rate"],
            avg_latency_ms=avg_latency,
            daily_active_identities=dai,
            monthly_active_identities=mai,
            as_of=datetime.now(timezone.utc),
        )

    async def _count_distinct_active_identities(
        self, org_id: uuid.UUID | str, days: int
    ) -> int:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        col = self.session_repo.db.collection("auth_sessions")
        query = (col.where("organization_id", "==", str(org_id))
                 .where("created_at", ">=", since))
        docs = await query.get()
        active_ids = set()
        for doc in docs:
            data = doc.to_dict()
            ident_id = data.get("identity_id")
            if ident_id:
                active_ids.add(str(ident_id))
        return len(active_ids)

    async def get_daily_usage(
        self, org_id: uuid.UUID | str, days: int = 30, app_id: uuid.UUID | None = None
    ) -> list[dict]:
        return await self.usage_repo.get_daily_stats(org_id, days=days, app_id=app_id)

    async def get_by_application(
        self, org_id: uuid.UUID | str, days: int = 30
    ) -> list[dict]:
        return await self.usage_repo.get_by_application(org_id, days=days)

    async def get_authentication_stats(
        self, org_id: uuid.UUID | str, days: int = 30
    ) -> dict:
        """Stats breakdown by event_type and status for the authentication panel."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        col = self.session_repo.db.collection("auth_sessions")
        query = (col.where("organization_id", "==", str(org_id))
                 .where("created_at", ">=", since))
        docs = await query.get()
        
        breakdown: dict = {}
        for doc in docs:
            data = doc.to_dict()
            et = data.get("event_type")
            status = data.get("status")
            if not et or not status:
                continue
            if et not in breakdown:
                breakdown[et] = {"total": 0, "success": 0, "failure": 0}
            breakdown[et]["total"] += 1
            if status == "success":
                breakdown[et]["success"] += 1
            else:
                breakdown[et]["failure"] += 1
        return {"period_days": days, "by_event_type": breakdown}
