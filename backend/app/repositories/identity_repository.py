"""
NeoFace AaaS — Identity Repository using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from google.cloud.firestore import AsyncClient

from app.models.identity import Identity


class IdentityRepository:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def create(
        self,
        org_id: uuid.UUID | str,
        app_id: uuid.UUID | str,
        external_user_id: str,
        identity_type: str = "member",
        site_id: uuid.UUID | None = None,
        status: str = "active",
        metadata_fields: dict | None = None,
    ) -> Identity:
        iid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        identity = Identity(
            id=iid,
            organization_id=uuid.UUID(str(org_id)),
            application_id=uuid.UUID(str(app_id)),
            external_user_id=external_user_id,
            enrollment_status="pending",
            identity_type=identity_type,
            site_id=uuid.UUID(str(site_id)) if site_id else None,
            status=status,
            metadata_fields=metadata_fields or {},
            created_at=now,
            updated_at=now,
        )
        doc_ref = self.db.collection("identities").document(str(iid))
        data = identity.to_dict()
        data.pop("id", None)
        data["organization_id"] = str(org_id)
        data["application_id"] = str(app_id)
        if site_id:
            data["site_id"] = str(site_id)
        await doc_ref.set(data)
        return identity

    async def get_by_id(self, identity_id: uuid.UUID | str) -> Identity | None:
        doc_ref = self.db.collection("identities").document(str(identity_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
        aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
        sid = uuid.UUID(data.get("site_id")) if data.get("site_id") else None
        feid = uuid.UUID(data.get("face_embedding_id")) if data.get("face_embedding_id") else None
        return Identity(
            id=uuid.UUID(doc.id),
            organization_id=oid,
            application_id=aid,
            external_user_id=data.get("external_user_id"),
            enrollment_status=data.get("enrollment_status", "pending"),
            identity_type=data.get("identity_type", "member"),
            site_id=sid,
            status=data.get("status", "active"),
            metadata_fields=data.get("metadata_fields", {}),
            face_embedding_id=feid,
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    async def get_by_id_and_org(
        self, identity_id: uuid.UUID | str, org_id: uuid.UUID | str
    ) -> Identity | None:
        identity = await self.get_by_id(identity_id)
        if identity and str(identity.organization_id) == str(org_id):
            return identity
        return None

    async def get_by_external_id(
        self, org_id: uuid.UUID | str, app_id: uuid.UUID | str, external_user_id: str
    ) -> Identity | None:
        col = self.db.collection("identities")
        query = (col.where("organization_id", "==", str(org_id))
                 .where("application_id", "==", str(app_id))
                 .where("external_user_id", "==", external_user_id)
                 .limit(1))
        docs = await query.get()
        if not docs:
            return None
        doc = docs[0]
        data = doc.to_dict()
        oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
        aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
        sid = uuid.UUID(data.get("site_id")) if data.get("site_id") else None
        feid = uuid.UUID(data.get("face_embedding_id")) if data.get("face_embedding_id") else None
        return Identity(
            id=uuid.UUID(doc.id),
            organization_id=oid,
            application_id=aid,
            external_user_id=data.get("external_user_id"),
            enrollment_status=data.get("enrollment_status", "pending"),
            identity_type=data.get("identity_type", "member"),
            site_id=sid,
            status=data.get("status", "active"),
            metadata_fields=data.get("metadata_fields", {}),
            face_embedding_id=feid,
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    async def list_by_org(
        self,
        org_id: uuid.UUID | str,
        page: int = 1,
        page_size: int = 50,
        app_id: uuid.UUID | None = None,
        enrollment_status: str | None = None,
        status: str | None = None,
        identity_type: str | None = None,
        site_id: uuid.UUID | None = None,
        search: str | None = None,
    ) -> tuple[list[Identity], int]:
        col = self.db.collection("identities")
        query = col.where("organization_id", "==", str(org_id))
        
        if app_id:
            query = query.where("application_id", "==", str(app_id))
        if enrollment_status:
            query = query.where("enrollment_status", "==", enrollment_status)
        if status:
            query = query.where("status", "==", status)
        if identity_type:
            query = query.where("identity_type", "==", identity_type)
        if site_id:
            query = query.where("site_id", "==", str(site_id))

        docs = await query.get()
        identities = []
        for doc in docs:
            data = doc.to_dict()
            ext_id = data.get("external_user_id", "")
            if search and search.lower() not in ext_id.lower():
                continue
            
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
            sid = uuid.UUID(data.get("site_id")) if data.get("site_id") else None
            feid = uuid.UUID(data.get("face_embedding_id")) if data.get("face_embedding_id") else None
            
            identities.append(Identity(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                application_id=aid,
                external_user_id=ext_id,
                enrollment_status=data.get("enrollment_status", "pending"),
                identity_type=data.get("identity_type", "member"),
                site_id=sid,
                status=data.get("status", "active"),
                metadata_fields=data.get("metadata_fields", {}),
                face_embedding_id=feid,
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
            ))

        # Sort in memory since we filtered or need ordering
        identities.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        total = len(identities)
        
        # Paginate in memory
        offset = (page - 1) * page_size
        return identities[offset:offset+page_size], total

    async def list_all(
        self,
        page: int = 1,
        page_size: int = 50,
        org_id: uuid.UUID | None = None,
        app_id: uuid.UUID | None = None,
        enrollment_status: str | None = None,
        status: str | None = None,
        identity_type: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Identity], int]:
        col = self.db.collection("identities")
        query = col
        
        if org_id:
            query = query.where("organization_id", "==", str(org_id))
        if app_id:
            query = query.where("application_id", "==", str(app_id))
        if enrollment_status:
            query = query.where("enrollment_status", "==", enrollment_status)
        if status:
            query = query.where("status", "==", status)
        if identity_type:
            query = query.where("identity_type", "==", identity_type)

        docs = await query.get()
        identities = []
        for doc in docs:
            data = doc.to_dict()
            ext_id = data.get("external_user_id", "")
            if search and search.lower() not in ext_id.lower():
                continue
            
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
            sid = uuid.UUID(data.get("site_id")) if data.get("site_id") else None
            feid = uuid.UUID(data.get("face_embedding_id")) if data.get("face_embedding_id") else None
            
            identities.append(Identity(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                application_id=aid,
                external_user_id=ext_id,
                enrollment_status=data.get("enrollment_status", "pending"),
                identity_type=data.get("identity_type", "member"),
                site_id=sid,
                status=data.get("status", "active"),
                metadata_fields=data.get("metadata_fields", {}),
                face_embedding_id=feid,
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
            ))

        identities.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        total = len(identities)
        offset = (page - 1) * page_size
        return identities[offset:offset+page_size], total

    async def update_status(
        self,
        identity_id: uuid.UUID | str,
        status: str,
        face_embedding_id: uuid.UUID | None = None,
    ) -> Identity | None:
        doc_ref = self.db.collection("identities").document(str(identity_id))
        doc = await doc_ref.get()
        if doc.exists:
            updates = {
                "enrollment_status": status,
                "updated_at": datetime.now(timezone.utc),
            }
            if face_embedding_id is not None:
                updates["face_embedding_id"] = str(face_embedding_id)
            await doc_ref.update(updates)
            return await self.get_by_id(identity_id)
        return None

    async def delete(self, identity_id: uuid.UUID | str) -> bool:
        doc_ref = self.db.collection("identities").document(str(identity_id))
        doc = await doc_ref.get()
        if doc.exists:
            await doc_ref.delete()
            return True
        return False

    async def count_total(self) -> int:
        col = self.db.collection("identities")
        res = await col.count().get()
        return res[0].value

    async def count_by_org(self, org_id: uuid.UUID | str) -> int:
        col = self.db.collection("identities").where("organization_id", "==", str(org_id))
        res = await col.count().get()
        return res[0].value
