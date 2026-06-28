"""
NeoFace AaaS — API Key Repository
Prefix-based lookup + CRUD for AaaSApiKey using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from google.cloud.firestore import AsyncClient

from app.models.api_key import AaaSApiKey


class ApiKeyRepository:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def create(
        self,
        org_id: uuid.UUID | str,
        name: str,
        key_prefix: str,
        hashed_secret: str,
        scopes: list[str],
        app_id: uuid.UUID | None = None,
    ) -> AaaSApiKey:
        kid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        key = AaaSApiKey(
            id=kid,
            organization_id=uuid.UUID(str(org_id)),
            application_id=uuid.UUID(str(app_id)) if app_id else None,
            name=name,
            key_prefix=key_prefix,
            hashed_secret=hashed_secret,
            scopes=scopes,
            status="active",
            created_at=now,
            last_used_at=None,
        )
        doc_ref = self.db.collection("api_keys").document(str(kid))
        data = key.to_dict()
        data.pop("id", None)
        data["organization_id"] = str(org_id)
        if app_id:
            data["application_id"] = str(app_id)
        await doc_ref.set(data)
        return key

    async def get_by_id(self, key_id: uuid.UUID | str) -> AaaSApiKey | None:
        doc_ref = self.db.collection("api_keys").document(str(key_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
        aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
        return AaaSApiKey(
            id=uuid.UUID(doc.id),
            organization_id=oid,
            application_id=aid,
            name=data.get("name"),
            key_prefix=data.get("key_prefix"),
            hashed_secret=data.get("hashed_secret"),
            scopes=data.get("scopes", []),
            status=data.get("status", "active"),
            created_at=data.get("created_at"),
            last_used_at=data.get("last_used_at"),
        )

    async def get_by_id_and_org(
        self, key_id: uuid.UUID | str, org_id: uuid.UUID | str
    ) -> AaaSApiKey | None:
        key = await self.get_by_id(key_id)
        if key and str(key.organization_id) == str(org_id):
            return key
        return None

    async def find_by_prefix(self, prefix: str) -> AaaSApiKey | None:
        col = self.db.collection("api_keys")
        query = col.where("key_prefix", "==", prefix).where("status", "==", "active").limit(1)
        docs = await query.get()
        if not docs:
            return None
        doc = docs[0]
        data = doc.to_dict()
        oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
        aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
        return AaaSApiKey(
            id=uuid.UUID(doc.id),
            organization_id=oid,
            application_id=aid,
            name=data.get("name"),
            key_prefix=data.get("key_prefix"),
            hashed_secret=data.get("hashed_secret"),
            scopes=data.get("scopes", []),
            status=data.get("status", "active"),
            created_at=data.get("created_at"),
            last_used_at=data.get("last_used_at"),
        )

    async def list_by_org(
        self,
        org_id: uuid.UUID | str,
        page: int = 1,
        page_size: int = 50,
        include_revoked: bool = False,
    ) -> tuple[list[AaaSApiKey], int]:
        col = self.db.collection("api_keys")
        query = col.where("organization_id", "==", str(org_id))
        if not include_revoked:
            query = query.where("status", "==", "active")

        count_res = await query.count().get()
        total = count_res[0].value

        offset = (page - 1) * page_size
        query = query.order_by("created_at", direction="DESCENDING").offset(offset).limit(page_size)
        docs = await query.get()

        keys = []
        for doc in docs:
            data = doc.to_dict()
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
            keys.append(AaaSApiKey(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                application_id=aid,
                name=data.get("name"),
                key_prefix=data.get("key_prefix"),
                hashed_secret=data.get("hashed_secret"),
                scopes=data.get("scopes", []),
                status=data.get("status", "active"),
                created_at=data.get("created_at"),
                last_used_at=data.get("last_used_at"),
            ))
        return keys, total

    async def update_status(self, key_id: uuid.UUID | str, status: str) -> AaaSApiKey | None:
        doc_ref = self.db.collection("api_keys").document(str(key_id))
        doc = await doc_ref.get()
        if doc.exists:
            await doc_ref.update({"status": status})
            return await self.get_by_id(key_id)
        return None

    async def touch_last_used(self, key_id: uuid.UUID | str) -> None:
        doc_ref = self.db.collection("api_keys").document(str(key_id))
        doc = await doc_ref.get()
        if doc.exists:
            await doc_ref.update({"last_used_at": datetime.now(timezone.utc)})
