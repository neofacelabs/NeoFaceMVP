"""
NeoFace AaaS — Session Repository using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from google.cloud.firestore import AsyncClient

from app.models.auth_session import AuthenticationSession


class SessionRepository:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def create(
        self,
        org_id: uuid.UUID | str,
        app_id: uuid.UUID | str,
        event_type: str,
        status: str,
        identity_id: uuid.UUID | None = None,
        confidence_score: float | None = None,
        risk_score: float | None = None,
        ip_address: str | None = None,
        device_fingerprint: str | None = None,
        latency_ms: int | None = None,
    ) -> AuthenticationSession:
        sid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        session = AuthenticationSession(
            id=sid,
            organization_id=uuid.UUID(str(org_id)),
            application_id=uuid.UUID(str(app_id)),
            identity_id=uuid.UUID(str(identity_id)) if identity_id else None,
            event_type=event_type,
            status=status,
            confidence_score=confidence_score,
            risk_score=risk_score,
            ip_address=ip_address,
            device_fingerprint=device_fingerprint,
            latency_ms=latency_ms,
            created_at=now,
        )
        doc_ref = self.db.collection("auth_sessions").document(str(sid))
        data = session.to_dict()
        data.pop("id", None)
        data["organization_id"] = str(org_id)
        data["application_id"] = str(app_id)
        if identity_id:
            data["identity_id"] = str(identity_id)
        await doc_ref.set(data)
        return session

    async def get_by_id(self, session_id: uuid.UUID | str) -> AuthenticationSession | None:
        doc_ref = self.db.collection("auth_sessions").document(str(session_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
        aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
        iid = uuid.UUID(data.get("identity_id")) if data.get("identity_id") else None
        return AuthenticationSession(
            id=uuid.UUID(doc.id),
            organization_id=oid,
            application_id=aid,
            identity_id=iid,
            event_type=data.get("event_type"),
            status=data.get("status"),
            confidence_score=data.get("confidence_score"),
            risk_score=data.get("risk_score"),
            ip_address=data.get("ip_address"),
            device_fingerprint=data.get("device_fingerprint"),
            latency_ms=data.get("latency_ms"),
            created_at=data.get("created_at"),
        )

    async def list_by_org(
        self,
        org_id: uuid.UUID | str,
        page: int = 1,
        page_size: int = 50,
        app_id: uuid.UUID | None = None,
        event_type: str | None = None,
        status: str | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
    ) -> tuple[list[AuthenticationSession], int]:
        col = self.db.collection("auth_sessions")
        query = col.where("organization_id", "==", str(org_id))
        if app_id:
            query = query.where("application_id", "==", str(app_id))
        if event_type:
            query = query.where("event_type", "==", event_type)
        if status:
            query = query.where("status", "==", status)
        if from_date:
            query = query.where("created_at", ">=", from_date)
        if to_date:
            query = query.where("created_at", "<=", to_date)

        count_res = await query.count().get()
        total = count_res[0].value

        offset = (page - 1) * page_size
        query = query.order_by("created_at", direction="DESCENDING").offset(offset).limit(page_size)
        docs = await query.get()

        sessions = []
        for doc in docs:
            data = doc.to_dict()
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
            iid = uuid.UUID(data.get("identity_id")) if data.get("identity_id") else None
            sessions.append(AuthenticationSession(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                application_id=aid,
                identity_id=iid,
                event_type=data.get("event_type"),
                status=data.get("status"),
                confidence_score=data.get("confidence_score"),
                risk_score=data.get("risk_score"),
                ip_address=data.get("ip_address"),
                device_fingerprint=data.get("device_fingerprint"),
                latency_ms=data.get("latency_ms"),
                created_at=data.get("created_at"),
            ))
        return sessions, total

    async def count_total(self) -> int:
        col = self.db.collection("auth_sessions")
        res = await col.count().get()
        return res[0].value

    async def count_by_org(self, org_id: uuid.UUID | str) -> int:
        col = self.db.collection("auth_sessions").where("organization_id", "==", str(org_id))
        res = await col.count().get()
        return res[0].value

    async def get_success_rate_by_org(self, org_id: uuid.UUID | str) -> float:
        col = self.db.collection("auth_sessions").where("organization_id", "==", str(org_id))
        
        total_res = await col.count().get()
        total = total_res[0].value
        if total == 0:
            return 0.0

        success_res = await col.where("status", "==", "success").count().get()
        success = success_res[0].value
        return round((success / total) * 100, 2)

    async def get_avg_latency_by_org(self, org_id: uuid.UUID | str) -> float:
        col = self.db.collection("auth_sessions").where("organization_id", "==", str(org_id))
        # Firestore does not support AVG aggregation natively on the client directly,
        # so we fetch records that have latency_ms and average in python.
        # Since this is local, we limit to last 500 records to be efficient.
        query = col.order_by("created_at", direction="DESCENDING").limit(500)
        docs = await query.get()
        latencies = []
        for doc in docs:
            data = doc.to_dict()
            lat = data.get("latency_ms")
            if lat is not None:
                latencies.append(lat)
        if not latencies:
            return 0.0
        return round(float(sum(latencies) / len(latencies)), 2)

    async def list_all(
        self,
        page: int = 1,
        page_size: int = 50,
        event_type: str | None = None,
        status: str | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
    ) -> tuple[list[AuthenticationSession], int]:
        col = self.db.collection("auth_sessions")
        query = col
        if event_type:
            query = query.where("event_type", "==", event_type)
        if status:
            query = query.where("status", "==", status)
        if from_date:
            query = query.where("created_at", ">=", from_date)
        if to_date:
            query = query.where("created_at", "<=", to_date)

        count_res = await query.count().get()
        total = count_res[0].value

        offset = (page - 1) * page_size
        query = query.order_by("created_at", direction="DESCENDING").offset(offset).limit(page_size)
        docs = await query.get()

        sessions = []
        for doc in docs:
            data = doc.to_dict()
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
            iid = uuid.UUID(data.get("identity_id")) if data.get("identity_id") else None
            sessions.append(AuthenticationSession(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                application_id=aid,
                identity_id=iid,
                event_type=data.get("event_type"),
                status=data.get("status"),
                confidence_score=data.get("confidence_score"),
                risk_score=data.get("risk_score"),
                ip_address=data.get("ip_address"),
                device_fingerprint=data.get("device_fingerprint"),
                latency_ms=data.get("latency_ms"),
                created_at=data.get("created_at"),
            ))
        return sessions, total
