"""
NeoFace AaaS — Audit Event Repository using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from google.cloud.firestore import AsyncClient

from app.models.audit_event import AuditEvent


class AuditEventRepository:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def emit(
        self,
        org_id: uuid.UUID | str,
        event_type: str,
        app_id: uuid.UUID | None = None,
        actor_id: uuid.UUID | None = None,
        entity_type: str | None = None,
        entity_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        ip_address: str | None = None,
    ) -> AuditEvent:
        eid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        event = AuditEvent(
            id=eid,
            organization_id=uuid.UUID(str(org_id)),
            application_id=uuid.UUID(str(app_id)) if app_id else None,
            actor_id=uuid.UUID(str(actor_id)) if actor_id else None,
            event_type=event_type,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata_=metadata or {},
            ip_address=ip_address,
            created_at=now,
        )
        doc_ref = self.db.collection("audit_events").document(str(eid))
        data = event.to_dict()
        data.pop("id", None)
        data["organization_id"] = str(org_id)
        if app_id:
            data["application_id"] = str(app_id)
        if actor_id:
            data["actor_id"] = str(actor_id)
        await doc_ref.set(data)
        return event

    async def list_by_org(
        self,
        org_id: uuid.UUID | str,
        page: int = 1,
        page_size: int = 50,
        app_id: uuid.UUID | None = None,
        event_type: str | None = None,
        actor_id: uuid.UUID | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
    ) -> tuple[list[AuditEvent], int]:
        col = self.db.collection("audit_events")
        query = col.where("organization_id", "==", str(org_id))
        
        if app_id:
            query = query.where("application_id", "==", str(app_id))
        if event_type:
            query = query.where("event_type", "==", event_type)
        if actor_id:
            query = query.where("actor_id", "==", str(actor_id))
        if from_date:
            query = query.where("created_at", ">=", from_date)
        if to_date:
            query = query.where("created_at", "<=", to_date)

        count_res = await query.count().get()
        total = count_res[0].value

        offset = (page - 1) * page_size
        query = query.order_by("created_at", direction="DESCENDING").offset(offset).limit(page_size)
        docs = await query.get()

        events = []
        for doc in docs:
            data = doc.to_dict()
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
            acid = uuid.UUID(data.get("actor_id")) if data.get("actor_id") else None
            events.append(AuditEvent(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                application_id=aid,
                actor_id=acid,
                event_type=data.get("event_type"),
                entity_type=data.get("entity_type"),
                entity_id=data.get("entity_id"),
                metadata_=data.get("metadata_"),
                ip_address=data.get("ip_address"),
                created_at=data.get("created_at"),
            ))
        return events, total

    async def list_all_for_export(
        self,
        org_id: uuid.UUID | str,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
    ) -> list[AuditEvent]:
        col = self.db.collection("audit_events")
        query = col.where("organization_id", "==", str(org_id))
        if from_date:
            query = query.where("created_at", ">=", from_date)
        if to_date:
            query = query.where("created_at", "<=", to_date)
        
        query = query.order_by("created_at", direction="ASCENDING")
        docs = await query.get()
        events = []
        for doc in docs:
            data = doc.to_dict()
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
            acid = uuid.UUID(data.get("actor_id")) if data.get("actor_id") else None
            events.append(AuditEvent(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                application_id=aid,
                actor_id=acid,
                event_type=data.get("event_type"),
                entity_type=data.get("entity_type"),
                entity_id=data.get("entity_id"),
                metadata_=data.get("metadata_"),
                ip_address=data.get("ip_address"),
                created_at=data.get("created_at"),
            ))
        return events
