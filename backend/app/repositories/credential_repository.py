"""
NeoFace WebAuthn Credential Repository
CRUD operations for biometric_credentials table using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from google.cloud.firestore import AsyncClient

from app.models.biometric_credential import BiometricCredential


class CredentialRepository:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def create(
        self,
        user_id: uuid.UUID | str,
        credential_id: bytes,
        public_key: bytes,
        sign_count: int,
        aaguid: str | None,
        device_name: str,
        device_metadata: dict | None = None,
    ) -> BiometricCredential:
        cid = uuid.uuid4()
        cred = BiometricCredential(
            id=cid,
            user_id=uuid.UUID(str(user_id)),
            credential_id=credential_id,
            public_key=public_key,
            sign_count=sign_count,
            aaguid=aaguid,
            device_name=device_name,
            device_metadata=device_metadata or {},
            is_active=True,
            enrolled_at=datetime.now(timezone.utc),
            last_used_at=datetime.now(timezone.utc),
        )
        doc_ref = self.db.collection("biometric_credentials").document(str(cid))
        data = cred.to_dict()
        data.pop("id", None)
        data["user_id"] = str(user_id)
        await doc_ref.set(data)
        return cred

    async def get_by_credential_id(self, credential_id: bytes) -> BiometricCredential | None:
        col = self.db.collection("biometric_credentials")
        query = col.where("credential_id", "==", credential_id).where("is_active", "==", True).limit(1)
        docs = await query.get()
        if not docs:
            return None
        doc = docs[0]
        data = doc.to_dict()
        return BiometricCredential(
            id=uuid.UUID(doc.id),
            user_id=uuid.UUID(data.get("user_id")),
            credential_id=data.get("credential_id"),
            public_key=data.get("public_key"),
            sign_count=data.get("sign_count"),
            aaguid=data.get("aaguid"),
            device_name=data.get("device_name"),
            device_metadata=data.get("device_metadata"),
            is_active=data.get("is_active", True),
            enrolled_at=data.get("enrolled_at"),
            last_used_at=data.get("last_used_at"),
            fingerprint_payments_enabled=data.get("fingerprint_payments_enabled", False),
        )
    async def list_by_user(self, user_id: uuid.UUID | str) -> list[BiometricCredential]:
        col = self.db.collection("biometric_credentials")
        query = col.where("user_id", "==", str(user_id))
        docs = await query.get()
        credentials = []
        for doc in docs:
            data = doc.to_dict()
            credentials.append(BiometricCredential(
                id=uuid.UUID(doc.id),
                user_id=uuid.UUID(data.get("user_id")),
                credential_id=data.get("credential_id"),
                public_key=data.get("public_key"),
                sign_count=data.get("sign_count"),
                aaguid=data.get("aaguid"),
                device_name=data.get("device_name"),
                device_metadata=data.get("device_metadata"),
                is_active=data.get("is_active", True),
                enrolled_at=data.get("enrolled_at"),
                last_used_at=data.get("last_used_at"),
                fingerprint_payments_enabled=data.get("fingerprint_payments_enabled", False),
            ))
        return credentials

    async def update_sign_count(self, credential_id: bytes, new_count: int) -> None:
        col = self.db.collection("biometric_credentials")
        query = col.where("credential_id", "==", credential_id).limit(1)
        docs = await query.get()
        if docs:
            await docs[0].reference.update({
                "sign_count": new_count,
                "last_used_at": datetime.now(timezone.utc),
            })

    async def update_device_name(self, cred_id: uuid.UUID | str, user_id: uuid.UUID | str, name: str) -> bool:
        doc_ref = self.db.collection("biometric_credentials").document(str(cred_id))
        doc = await doc_ref.get()
        if doc.exists and doc.to_dict().get("user_id") == str(user_id):
            await doc_ref.update({"device_name": name})
            return True
        return False

    async def revoke(self, cred_id: uuid.UUID | str, user_id: uuid.UUID | str) -> bool:
        doc_ref = self.db.collection("biometric_credentials").document(str(cred_id))
        doc = await doc_ref.get()
        if doc.exists and doc.to_dict().get("user_id") == str(user_id):
            await doc_ref.update({"is_active": False})
            return True
        return False

    async def set_payment_enabled(self, cred_id: uuid.UUID | str, user_id: uuid.UUID | str, enabled: bool) -> bool:
        doc_ref = self.db.collection("biometric_credentials").document(str(cred_id))
        doc = await doc_ref.get()
        if doc.exists and doc.to_dict().get("user_id") == str(user_id):
            await doc_ref.update({"fingerprint_payments_enabled": enabled})
            return True
        return False

    async def count_active(self, user_id: uuid.UUID | str) -> int:
        col = self.db.collection("biometric_credentials").where("user_id", "==", str(user_id)).where("is_active", "==", True)
        res = await col.count().get()
        return res[0].value
