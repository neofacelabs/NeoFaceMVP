"""
NeoFace AaaS — Organization Repository using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from google.cloud.firestore import AsyncClient

from app.models.application import Application
from app.models.identity import Identity
from app.models.auth_session import AuthenticationSession
from app.models.organization import Organization
from app.models.org_membership import OrgMembership
from app.schemas.aaas import OrganizationCreate, OrganizationUpdate, ApplicationCreate, ApplicationUpdate


class OrganizationRepository:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    # ── Organization CRUD ─────────────────────────────────────────────────────

    async def create(self, schema: OrganizationCreate) -> Organization:
        oid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        org = Organization(
            id=oid,
            name=schema.name,
            slug=schema.slug,
            plan=schema.plan,
            status="active",
            created_at=now,
            updated_at=now,
        )
        doc_ref = self.db.collection("organizations").document(str(oid))
        data = org.to_dict()
        data.pop("id", None)
        await doc_ref.set(data)
        return org

    async def get_by_id(self, org_id: uuid.UUID | str) -> Organization | None:
        doc_ref = self.db.collection("organizations").document(str(org_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        return Organization(
            id=uuid.UUID(doc.id),
            name=data.get("name"),
            slug=data.get("slug"),
            plan=data.get("plan"),
            status=data.get("status", "active"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    async def get_by_slug(self, slug: str) -> Organization | None:
        col = self.db.collection("organizations")
        query = col.where("slug", "==", slug).limit(1)
        docs = await query.get()
        if not docs:
            return None
        doc = docs[0]
        data = doc.to_dict()
        return Organization(
            id=uuid.UUID(doc.id),
            name=data.get("name"),
            slug=data.get("slug"),
            plan=data.get("plan"),
            status=data.get("status", "active"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    async def get_default(self) -> Organization | None:
        """Return the seeded default organization (slug='neoface-default')."""
        return await self.get_by_slug("neoface-default")

    async def update(
        self, org_id: uuid.UUID | str, schema: OrganizationUpdate
    ) -> Organization | None:
        doc_ref = self.db.collection("organizations").document(str(org_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = schema.model_dump(exclude_none=True)
        data["updated_at"] = datetime.now(timezone.utc)
        await doc_ref.update(data)
        return await self.get_by_id(org_id)

    async def list_all(
        self,
        page: int = 1,
        page_size: int = 50,
        status: str | None = None,
    ) -> tuple[list[Organization], int]:
        col = self.db.collection("organizations")
        query = col
        if status:
            query = query.where("status", "==", status)

        count_res = await query.count().get()
        total = count_res[0].value

        offset = (page - 1) * page_size
        query = query.order_by("created_at", direction="DESCENDING").offset(offset).limit(page_size)
        docs = await query.get()

        orgs = []
        for doc in docs:
            data = doc.to_dict()
            orgs.append(Organization(
                id=uuid.UUID(doc.id),
                name=data.get("name"),
                slug=data.get("slug"),
                plan=data.get("plan"),
                status=data.get("status", "active"),
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
            ))
        return orgs, total

    async def count_all(self) -> int:
        col = self.db.collection("organizations")
        res = await col.count().get()
        return res[0].value

    # ── Per-org stats ─────────────────────────────────────────────────────────

    async def count_applications(self, org_id: uuid.UUID | str) -> int:
        col = self.db.collection("applications").where("organization_id", "==", str(org_id))
        res = await col.count().get()
        return res[0].value

    async def count_identities(self, org_id: uuid.UUID | str) -> int:
        col = self.db.collection("identities").where("organization_id", "==", str(org_id))
        res = await col.count().get()
        return res[0].value

    # ── Application CRUD ──────────────────────────────────────────────────────

    async def create_application(
        self, org_id: uuid.UUID | str, schema: ApplicationCreate
    ) -> Application:
        aid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        app = Application(
            id=aid,
            organization_id=uuid.UUID(str(org_id)),
            site_id=uuid.UUID(str(schema.site_id)) if schema.site_id else None,
            name=schema.name,
            environment=schema.environment,
            description=schema.description,
            allowed_origins=schema.allowed_origins or [],
            allowed_domains=schema.allowed_domains or [],
            webhook_url=schema.webhook_url,
            rate_limit=schema.rate_limit,
            created_at=now,
            updated_at=now,
        )
        doc_ref = self.db.collection("applications").document(str(aid))
        data = app.to_dict()
        data.pop("id", None)
        data["organization_id"] = str(org_id)
        if schema.site_id:
            data["site_id"] = str(schema.site_id)
        await doc_ref.set(data)
        return app

    async def update_application(
        self, app_id: uuid.UUID | str, org_id: uuid.UUID | str, schema: ApplicationUpdate
    ) -> Application | None:
        doc_ref = self.db.collection("applications").document(str(app_id))
        doc = await doc_ref.get()
        if not doc.exists or doc.to_dict().get("organization_id") != str(org_id):
            return None
        data = schema.model_dump(exclude_unset=True)
        data["updated_at"] = datetime.now(timezone.utc)
        if "site_id" in data and data["site_id"]:
            data["site_id"] = str(data["site_id"])
        await doc_ref.update(data)
        return await self.get_application(app_id)

    async def delete_application(
        self, app_id: uuid.UUID | str, org_id: uuid.UUID | str
    ) -> bool:
        doc_ref = self.db.collection("applications").document(str(app_id))
        doc = await doc_ref.get()
        if doc.exists and doc.to_dict().get("organization_id") == str(org_id):
            await doc_ref.delete()
            return True
        return False

    async def get_application(self, app_id: uuid.UUID | str) -> Application | None:
        doc_ref = self.db.collection("applications").document(str(app_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
        sid = uuid.UUID(data.get("site_id")) if data.get("site_id") else None
        return Application(
            id=uuid.UUID(doc.id),
            organization_id=oid,
            site_id=sid,
            name=data.get("name"),
            environment=data.get("environment"),
            status=data.get("status", "active"),
            description=data.get("description"),
            allowed_origins=data.get("allowed_origins", []),
            allowed_domains=data.get("allowed_domains", []),
            webhook_url=data.get("webhook_url"),
            rate_limit=data.get("rate_limit"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    async def list_applications(
        self, org_id: uuid.UUID | str, page: int = 1, page_size: int = 50
    ) -> tuple[list[Application], int]:
        col = self.db.collection("applications").where("organization_id", "==", str(org_id))
        
        count_res = await col.count().get()
        total = count_res[0].value
        offset = (page - 1) * page_size
        query = col.offset(offset).limit(page_size)
        docs = await query.get()
        apps = []
        for doc in docs:
            data = doc.to_dict()
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            sid = uuid.UUID(data.get("site_id")) if data.get("site_id") else None
            apps.append(Application(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                site_id=sid,
                name=data.get("name"),
                environment=data.get("environment"),
                status=data.get("status", "active"),
                description=data.get("description"),
                allowed_origins=data.get("allowed_origins", []),
                allowed_domains=data.get("allowed_domains", []),
                webhook_url=data.get("webhook_url"),
                rate_limit=data.get("rate_limit"),
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
            ))
        return apps, total

    async def count_applications_total(self) -> int:
        col = self.db.collection("applications")
        res = await col.count().get()
        return res[0].value

    # ── Membership ────────────────────────────────────────────────────────────

    async def add_member(
        self, org_id: uuid.UUID | str, user_id: uuid.UUID | str, role: str = "member"
    ) -> Any:
        mid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        
        # Save directly to Firestore as dict
        data = {
            "organization_id": str(org_id),
            "user_id": str(user_id),
            "role": role,
            "created_at": now,
        }
        doc_ref = self.db.collection("org_memberships").document(str(mid))
        await doc_ref.set(data)
        
        # Return a simple mock object that has the same attributes
        class MockOrgMembership:
            def __init__(self, id, organization_id, user_id, role, created_at):
                self.id = id
                self.organization_id = organization_id
                self.user_id = user_id
                self.role = role
                self.created_at = created_at
                
            def to_dict(self):
                return {
                    "id": str(self.id),
                    "organization_id": str(self.organization_id),
                    "user_id": str(self.user_id),
                    "role": self.role,
                    "created_at": self.created_at,
                }
        
        return MockOrgMembership(mid, uuid.UUID(str(org_id)), uuid.UUID(str(user_id)), role, now)

    async def get_user_org(self, user_id: uuid.UUID | str) -> Organization | None:
        """Return the primary org for a user."""
        col = self.db.collection("org_memberships").where("user_id", "==", str(user_id))
        query = col.limit(1)
        docs = await query.get()
        if not docs:
            return None
        org_id = docs[0].to_dict().get("organization_id")
        if not org_id:
            return None
        return await self.get_by_id(org_id)
