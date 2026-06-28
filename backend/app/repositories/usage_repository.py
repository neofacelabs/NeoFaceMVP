"""
NeoFace AaaS — Usage Repository using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone

from google.cloud.firestore import AsyncClient

from app.models.usage_record import UsageRecord


class UsageRepository:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def upsert_increment(
        self,
        org_id: uuid.UUID | str,
        endpoint: str,
        success: bool,
        latency_ms: float,
        app_id: uuid.UUID | None = None,
    ) -> None:
        """
        Upsert a usage record for the current UTC day.
        """
        today = datetime.now(timezone.utc).date()
        doc_id = f"{org_id}_{app_id or 'none'}_{endpoint.replace('/', '_')}_{today}"
        doc_ref = self.db.collection("usage_records").document(doc_id)
        
        doc = await doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            assert data is not None
            req_count = data.get("request_count", 0)
            suc_count = data.get("success_count", 0)
            fail_count = data.get("failure_count", 0)
            avg_lat = data.get("avg_latency_ms", 0.0)
            
            new_req = req_count + 1
            new_suc = suc_count + (1 if success else 0)
            new_fail = fail_count + (0 if success else 1)
            new_lat = ((avg_lat * req_count) + latency_ms) / new_req
            
            await doc_ref.update({
                "request_count": new_req,
                "success_count": new_suc,
                "failure_count": new_fail,
                "avg_latency_ms": new_lat,
            })
        else:
            await doc_ref.set({
                "organization_id": str(org_id),
                "application_id": str(app_id) if app_id else None,
                "endpoint": endpoint,
                "bucket_date": str(today),
                "request_count": 1,
                "success_count": 1 if success else 0,
                "failure_count": 0 if success else 1,
                "avg_latency_ms": latency_ms,
            })

    async def get_daily_stats(
        self,
        org_id: uuid.UUID | str,
        days: int = 30,
        app_id: uuid.UUID | None = None,
    ) -> list[dict]:
        since = datetime.now(timezone.utc).date() - timedelta(days=days)
        col = self.db.collection("usage_records")
        query = col.where("organization_id", "==", str(org_id))
        if app_id:
            query = query.where("application_id", "==", str(app_id))
            
        docs = await query.get()
        
        stats = {}
        for doc in docs:
            data = doc.to_dict()
            bdate_str = data.get("bucket_date")
            if not bdate_str:
                continue
            bdate = date.fromisoformat(bdate_str)
            if bdate < since:
                continue
                
            bdate_key = str(bdate)
            if bdate_key not in stats:
                stats[bdate_key] = {
                    "date": bdate_key,
                    "request_count": 0,
                    "success_count": 0,
                    "failure_count": 0,
                    "latencies": [],
                }
            stats[bdate_key]["request_count"] += data.get("request_count", 0)
            stats[bdate_key]["success_count"] += data.get("success_count", 0)
            stats[bdate_key]["failure_count"] += data.get("failure_count", 0)
            stats[bdate_key]["latencies"].append(data.get("avg_latency_ms", 0.0))

        results = []
        for k, v in stats.items():
            avg_lat = sum(v["latencies"]) / len(v["latencies"]) if v["latencies"] else 0.0
            results.append({
                "date": v["date"],
                "request_count": v["request_count"],
                "success_count": v["success_count"],
                "failure_count": v["failure_count"],
                "avg_latency_ms": round(avg_lat, 2),
            })
            
        results.sort(key=lambda x: x["date"])
        return results

    async def get_overview(self, org_id: uuid.UUID | str, days: int = 30) -> dict:
        since = datetime.now(timezone.utc).date() - timedelta(days=days)
        col = self.db.collection("usage_records").where("organization_id", "==", str(org_id))
        docs = await col.get()
        
        total = 0
        success = 0
        latencies = []
        for doc in docs:
            data = doc.to_dict()
            bdate_str = data.get("bucket_date")
            if not bdate_str:
                continue
            bdate = date.fromisoformat(bdate_str)
            if bdate < since:
                continue
            total += data.get("request_count", 0)
            success += data.get("success_count", 0)
            latencies.append(data.get("avg_latency_ms", 0.0))
            
        avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0.0
        return {
            "total_requests": total,
            "success_rate": round((success / total * 100), 2) if total > 0 else 0.0,
            "avg_latency_ms": avg_latency,
        }

    async def get_by_application(self, org_id: uuid.UUID | str, days: int = 30) -> list[dict]:
        since = datetime.now(timezone.utc).date() - timedelta(days=days)
        col = self.db.collection("usage_records").where("organization_id", "==", str(org_id))
        docs = await col.get()
        
        apps = {}
        for doc in docs:
            data = doc.to_dict()
            bdate_str = data.get("bucket_date")
            if not bdate_str:
                continue
            bdate = date.fromisoformat(bdate_str)
            if bdate < since:
                continue
            aid = data.get("application_id")
            if not aid:
                continue
            if aid not in apps:
                apps[aid] = {"request_count": 0, "success_count": 0}
            apps[aid]["request_count"] += data.get("request_count", 0)
            apps[aid]["success_count"] += data.get("success_count", 0)
            
        results = []
        for aid, v in apps.items():
            reqs = v["request_count"]
            results.append({
                "application_id": aid,
                "request_count": reqs,
                "success_rate": round((v["success_count"] / reqs * 100), 2) if reqs > 0 else 0.0,
            })
            
        results.sort(key=lambda x: x["request_count"], reverse=True)
        return results

    async def get_api_calls_today(self) -> int:
        today = str(datetime.now(timezone.utc).date())
        col = self.db.collection("usage_records").where("bucket_date", "==", today)
        docs = await col.get()
        total = 0
        for doc in docs:
            total += doc.to_dict().get("request_count", 0)
        return total
