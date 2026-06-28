"""
NeoFace Face Embedding Repository
Data access layer for FaceEmbedding model using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
import numpy as np

from google.cloud.firestore import AsyncClient

from app.models.face_embedding import FaceEmbedding


class EmbeddingRepository:
    """
    Repository for face embedding CRUD operations in Firestore.
    """

    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_by_id(self, embedding_id: uuid.UUID | str) -> FaceEmbedding | None:
        doc_ref = self.db.collection("face_embeddings").document(str(embedding_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        return FaceEmbedding(
            id=uuid.UUID(doc.id),
            user_id=uuid.UUID(data.get("user_id")),
            embedding_vector=data.get("embedding_vector"),
            embedding_version=data.get("embedding_version", "arcface_r100_v1"),
            embedding_dimension=data.get("embedding_dimension", 512),
            quality_score=data.get("quality_score"),
            source_image_path=data.get("source_image_path"),
            source_image_bytes=data.get("source_image_bytes"),
            created_at=data.get("created_at"),
        )
    async def get_by_user_id(self, user_id: uuid.UUID | str) -> list[FaceEmbedding]:
        """Fetch all embeddings for a specific user."""
        col = self.db.collection("face_embeddings")
        query = col.where("user_id", "==", str(user_id))
        docs = await query.get()
        embeddings = []
        for doc in docs:
            data = doc.to_dict()
            embeddings.append(FaceEmbedding(
                id=uuid.UUID(doc.id),
                user_id=uuid.UUID(data.get("user_id")),
                embedding_vector=data.get("embedding_vector"),
                embedding_version=data.get("embedding_version", "arcface_r100_v1"),
                embedding_dimension=data.get("embedding_dimension", 512),
                quality_score=data.get("quality_score"),
                source_image_path=data.get("source_image_path"),
                source_image_bytes=data.get("source_image_bytes"),
                created_at=data.get("created_at"),
            ))
        embeddings.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        return embeddings

    async def get_by_user(self, user_id: uuid.UUID | str) -> list[FaceEmbedding]:
        """Alias for get_by_user_id."""
        return await self.get_by_user_id(user_id)

    async def get_all_active(self) -> list[FaceEmbedding]:
        """Fetch all embeddings."""
        col = self.db.collection("face_embeddings")
        docs = await col.get()
        embeddings = []
        for doc in docs:
            data = doc.to_dict()
            embeddings.append(FaceEmbedding(
                id=uuid.UUID(doc.id),
                user_id=uuid.UUID(data.get("user_id")),
                embedding_vector=data.get("embedding_vector"),
                embedding_version=data.get("embedding_version", "arcface_r100_v1"),
                embedding_dimension=data.get("embedding_dimension", 512),
                quality_score=data.get("quality_score"),
                source_image_path=data.get("source_image_path"),
                source_image_bytes=data.get("source_image_bytes"),
                created_at=data.get("created_at"),
            ))
        return embeddings

    async def find_nearest_neighbors(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list[tuple[FaceEmbedding, float]]:
        """Perform 1:N search using cosine similarity in python."""
        all_active = await self.get_all_active()
        q_arr = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_arr)

        candidates = []
        for emb in all_active:
            emb_arr = np.array(emb.embedding_vector, dtype=np.float32)
            emb_norm = np.linalg.norm(emb_arr)
            if q_norm == 0.0 or emb_norm == 0.0:
                sim = 0.0
            else:
                sim = float(np.dot(q_arr, emb_arr) / (q_norm * emb_norm))
            candidates.append((emb, sim))

        # Sort by similarity descending
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[:limit]

    async def count_by_user(self, user_id: uuid.UUID | str) -> int:
        """Count how many embeddings a user has."""
        col = self.db.collection("face_embeddings").where("user_id", "==", str(user_id))
        res = await col.count().get()
        return res[0].value

    async def get_latest_by_user(self, user_id: uuid.UUID | str) -> FaceEmbedding | None:
        """Get the most recently created embedding for a user."""
        embeddings = await self.get_by_user_id(user_id)
        if not embeddings:
            return None
        return embeddings[0]

    # ── Write ─────────────────────────────────────────────────────────────────

    async def create(
        self,
        user_id: uuid.UUID | str,
        embedding_vector: list[float],
        quality_score: float | None = None,
        source_image_path: str | None = None,
        source_image_bytes: bytes | None = None,
        embedding_version: str = "arcface_r100_v1",
    ) -> FaceEmbedding:
        """Persist a new embedding record."""
        eid = uuid.uuid4()
        embedding = FaceEmbedding(
            id=eid,
            user_id=uuid.UUID(str(user_id)),
            embedding_vector=embedding_vector,
            embedding_version=embedding_version,
            embedding_dimension=len(embedding_vector),
            quality_score=quality_score,
            source_image_path=source_image_path,
            source_image_bytes=source_image_bytes,
            created_at=datetime.now(timezone.utc),
        )
        doc_ref = self.db.collection("face_embeddings").document(str(eid))
        data = embedding.to_dict()
        data.pop("id", None)
        # Store user_id and UUID as strings in Firestore for easy querying
        data["user_id"] = str(user_id)
        await doc_ref.set(data)
        return embedding

    async def delete_by_user(self, user_id: uuid.UUID | str) -> int:
        """Delete all embeddings for a user. Returns count deleted."""
        col = self.db.collection("face_embeddings").where("user_id", "==", str(user_id))
        docs = await col.get()
        deleted_count = 0
        for doc in docs:
            await doc.reference.delete()
            deleted_count += 1
        return deleted_count

    async def delete_by_id(self, embedding_id: uuid.UUID | str) -> bool:
        """Delete a single embedding record."""
        doc_ref = self.db.collection("face_embeddings").document(str(embedding_id))
        doc = await doc_ref.get()
        if doc.exists:
            await doc_ref.delete()
            return True
        return False
