"""
NeoFace User Repository
Data access layer for User model operations using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from google.cloud.firestore import AsyncClient

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserRepository:
    """
    Encapsulates all database operations for the User model in Firestore.
    """

    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_by_id(self, user_id: uuid.UUID | str) -> User | None:
        """Fetch user by primary key."""
        doc_ref = self.db.collection("users").document(str(user_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        # Restore UUID
        uid = uuid.UUID(doc.id)
        # Restore timestamps
        created_at = data.get("created_at")
        updated_at = data.get("updated_at")
        return User(
            id=uid,
            name=data.get("name"),
            email=data.get("email"),
            phone=data.get("phone"),
            hashed_password=data.get("hashed_password"),
            role=data.get("role", "user"),
            is_active=data.get("is_active", True),
            is_enrolled=data.get("is_enrolled", False),
            is_iris_enrolled=data.get("is_iris_enrolled", False),
            is_fingerprint_enrolled=data.get("is_fingerprint_enrolled", False),
            created_at=created_at,
            updated_at=updated_at,
        )

    async def get_by_email(self, email: str) -> User | None:
        """Fetch user by email (case-insensitive)."""
        users_ref = self.db.collection("users")
        query = users_ref.where("email", "==", email.lower()).limit(1)
        docs = await query.get()
        if not docs:
            return None
        doc = docs[0]
        data = doc.to_dict()
        uid = uuid.UUID(doc.id)
        return User(
            id=uid,
            name=data.get("name"),
            email=data.get("email"),
            phone=data.get("phone"),
            hashed_password=data.get("hashed_password"),
            role=data.get("role", "user"),
            is_active=data.get("is_active", True),
            is_enrolled=data.get("is_enrolled", False),
            is_iris_enrolled=data.get("is_iris_enrolled", False),
            is_fingerprint_enrolled=data.get("is_fingerprint_enrolled", False),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    async def get_all(
        self,
        page: int = 1,
        page_size: int = 20,
        active_only: bool = False,
    ) -> tuple[list[User], int]:
        """
        Paginated user list.
        Returns (users, total_count).
        """
        col_ref = self.db.collection("users")
        
        # Build query
        query = col_ref
        if active_only:
            query = query.where("is_active", "==", True)

        # Count total
        count_res = await query.count().get()
        total = count_res[0].value

        # Paginate (Firestore pagination: offset + limit)
        offset = (page - 1) * page_size
        query = query.order_by("created_at", direction="DESCENDING")
        
        # Note: offset() query in Firestore works, but for production, start_after is preferred.
        # Since offset() is supported on AsyncQuery, we will use it for compatibility.
        query = query.offset(offset).limit(page_size)
        docs = await query.get()

        users = []
        for doc in docs:
            data = doc.to_dict()
            users.append(User(
                id=uuid.UUID(doc.id),
                name=data.get("name"),
                email=data.get("email"),
                phone=data.get("phone"),
                hashed_password=data.get("hashed_password"),
                role=data.get("role", "user"),
                is_active=data.get("is_active", True),
                is_enrolled=data.get("is_enrolled", False),
                is_iris_enrolled=data.get("is_iris_enrolled", False),
                is_fingerprint_enrolled=data.get("is_fingerprint_enrolled", False),
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
            ))

        return users, total

    async def exists_by_email(self, email: str) -> bool:
        """Check if an email is already registered."""
        users_ref = self.db.collection("users")
        query = users_ref.where("email", "==", email.lower()).limit(1)
        docs = await query.get()
        return len(docs) > 0

    # ── Write ─────────────────────────────────────────────────────────────────

    async def create(self, schema: UserCreate, hashed_password: str, role: str = "user") -> User:
        """Create a new user record."""
        uid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        user = User(
            id=uid,
            name=schema.name,
            email=schema.email.lower(),
            phone=schema.phone,
            hashed_password=hashed_password,
            role=role,
            is_active=True,
            is_enrolled=False,
            is_iris_enrolled=False,
            is_fingerprint_enrolled=False,
            created_at=now,
            updated_at=now,
        )
        
        doc_ref = self.db.collection("users").document(str(uid))
        data = user.to_dict()
        data.pop("id", None)
        await doc_ref.set(data)
        return user

    async def create_biometric_user(
        self,
        name: str,
        email: str,
        phone: str | None = None,
        user_id: uuid.UUID | None = None,
    ) -> User:
        """Create a biometric-only user (no password required)."""
        uid = user_id or uuid.uuid4()
        now = datetime.now(timezone.utc)
        user = User(
            id=uid,
            name=name,
            email=email.lower(),
            phone=phone,
            hashed_password=None,
            role="user",
            is_active=True,
            is_enrolled=False,
            is_iris_enrolled=False,
            is_fingerprint_enrolled=False,
            created_at=now,
            updated_at=now,
        )
        
        doc_ref = self.db.collection("users").document(str(uid))
        data = user.to_dict()
        data.pop("id", None)
        await doc_ref.set(data)
        return user

    async def update(self, user_id: uuid.UUID | str, schema: UserUpdate) -> User | None:
        """Partial update of user fields."""
        updates = schema.model_dump(exclude_none=True)
        if not updates:
            return await self.get_by_id(user_id)

        updates["updated_at"] = datetime.now(timezone.utc)
        doc_ref = self.db.collection("users").document(str(user_id))
        await doc_ref.update(updates)
        return await self.get_by_id(user_id)

    async def mark_enrolled(self, user_id: uuid.UUID | str) -> None:
        """Set is_enrolled=True after successful face enrollment."""
        doc_ref = self.db.collection("users").document(str(user_id))
        await doc_ref.update({
            "is_enrolled": True,
            "updated_at": datetime.now(timezone.utc),
        })

    async def deactivate(self, user_id: uuid.UUID | str) -> None:
        """Soft-delete a user by setting is_active=False."""
        doc_ref = self.db.collection("users").document(str(user_id))
        await doc_ref.update({
            "is_active": False,
            "updated_at": datetime.now(timezone.utc),
        })

    # ── Analytics ─────────────────────────────────────────────────────────────

    async def count_total(self) -> int:
        col = self.db.collection("users")
        res = await col.count().get()
        return res[0].value

    async def count_enrolled(self) -> int:
        col = self.db.collection("users").where("is_enrolled", "==", True)
        res = await col.count().get()
        return res[0].value

    async def count_active(self) -> int:
        col = self.db.collection("users").where("is_active", "==", True)
        res = await col.count().get()
        return res[0].value
