"""
NeoFace Iris, Fingerprint and Merchant Repositories
Data access layer using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from google.cloud.firestore import AsyncClient

from app.models.iris_embedding import IrisEmbedding
from app.models.fingerprint_template import FingerprintTemplate
from app.models.merchant import Merchant


class IrisRepository:
    """Repository for iris enrollment operations and IrisCode retrieval."""

    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def create(
        self,
        user_id: uuid.UUID | str,
        iris_code: bytes,
        eye_side: str = "right",
        iris_mask: bytes | None = None,
        iris_radius_px: int | None = None,
        pupil_radius_px: int | None = None,
        quality_score: float | None = None,
        usable_bits_ratio: float | None = None,
        algorithm_version: str = "gabor_v1",
        source_image_path: str | None = None,
        source_image_bytes: bytes | None = None,
    ) -> IrisEmbedding:
        """Store a new iris enrollment record."""
        iid = uuid.uuid4()
        record = IrisEmbedding(
            id=iid,
            user_id=uuid.UUID(str(user_id)),
            iris_code=iris_code,
            iris_mask=iris_mask,
            eye_side=eye_side,
            iris_radius_px=iris_radius_px,
            pupil_radius_px=pupil_radius_px,
            quality_score=quality_score,
            usable_bits_ratio=usable_bits_ratio,
            algorithm_version=algorithm_version,
            source_image_path=source_image_path,
            source_image_bytes=source_image_bytes,
            created_at=datetime.now(timezone.utc),
        )
        doc_ref = self.db.collection("iris_embeddings").document(str(iid))
        data = record.to_dict()
        data.pop("id", None)
        data["user_id"] = str(user_id)
        await doc_ref.set(data)
        return record

    async def get_by_user(self, user_id: uuid.UUID | str) -> list[IrisEmbedding]:
        """Retrieve all iris enrollments for a user."""
        col = self.db.collection("iris_embeddings")
        query = col.where("user_id", "==", str(user_id))
        docs = await query.get()
        records = []
        for doc in docs:
            data = doc.to_dict()
            records.append(IrisEmbedding(
                id=uuid.UUID(doc.id),
                user_id=uuid.UUID(data.get("user_id")),
                iris_code=data.get("iris_code"),
                iris_mask=data.get("iris_mask"),
                eye_side=data.get("eye_side"),
                iris_radius_px=data.get("iris_radius_px"),
                pupil_radius_px=data.get("pupil_radius_px"),
                quality_score=data.get("quality_score"),
                usable_bits_ratio=data.get("usable_bits_ratio"),
                algorithm_version=data.get("algorithm_version"),
                source_image_path=data.get("source_image_path"),
                source_image_bytes=data.get("source_image_bytes"),
                created_at=data.get("created_at"),
            ))
        return records

    async def get_all(self) -> list[IrisEmbedding]:
        """Load all iris records for 1:N matching scan."""
        col = self.db.collection("iris_embeddings")
        docs = await col.get()
        records = []
        for doc in docs:
            data = doc.to_dict()
            records.append(IrisEmbedding(
                id=uuid.UUID(doc.id),
                user_id=uuid.UUID(data.get("user_id")),
                iris_code=data.get("iris_code"),
                iris_mask=data.get("iris_mask"),
                eye_side=data.get("eye_side"),
                iris_radius_px=data.get("iris_radius_px"),
                pupil_radius_px=data.get("pupil_radius_px"),
                quality_score=data.get("quality_score"),
                usable_bits_ratio=data.get("usable_bits_ratio"),
                algorithm_version=data.get("algorithm_version"),
                source_image_path=data.get("source_image_path"),
                source_image_bytes=data.get("source_image_bytes"),
                created_at=data.get("created_at"),
            ))
        return records

    async def count_by_user(self, user_id: uuid.UUID | str) -> int:
        col = self.db.collection("iris_embeddings").where("user_id", "==", str(user_id))
        res = await col.count().get()
        return res[0].value

    async def delete_by_user(self, user_id: uuid.UUID | str) -> int:
        col = self.db.collection("iris_embeddings").where("user_id", "==", str(user_id))
        docs = await col.get()
        deleted_count = 0
        for doc in docs:
            await doc.reference.delete()
            deleted_count += 1
        return deleted_count


class FingerprintRepository:
    """Repository for fingerprint template storage and retrieval."""

    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def create(
        self,
        user_id: uuid.UUID | str,
        template_data: bytes,
        finger_position: int = 2,
        finger_position_label: str | None = None,
        minutiae_count: int | None = None,
        quality_score: float | None = None,
        ridge_density: float | None = None,
        capture_device: str | None = None,
        capture_dpi: int | None = None,
        impression_type: str = "live_scan",
        algorithm_version: str = "minutiae_v1",
        source_image_bytes: bytes | None = None,
    ) -> FingerprintTemplate:
        fid = uuid.uuid4()
        record = FingerprintTemplate(
            id=fid,
            user_id=uuid.UUID(str(user_id)),
            template_data=template_data,
            finger_position=finger_position,
            finger_position_label=finger_position_label,
            minutiae_count=minutiae_count,
            quality_score=quality_score,
            ridge_density=ridge_density,
            capture_device=capture_device,
            capture_dpi=capture_dpi,
            impression_type=impression_type,
            algorithm_version=algorithm_version,
            source_image_bytes=source_image_bytes,
            created_at=datetime.now(timezone.utc),
        )
        doc_ref = self.db.collection("fingerprint_templates").document(str(fid))
        data = record.to_dict()
        data.pop("id", None)
        data["user_id"] = str(user_id)
        await doc_ref.set(data)
        return record

    async def get_by_user(self, user_id: uuid.UUID | str) -> list[FingerprintTemplate]:
        col = self.db.collection("fingerprint_templates")
        query = col.where("user_id", "==", str(user_id))
        docs = await query.get()
        records = []
        for doc in docs:
            data = doc.to_dict()
            records.append(FingerprintTemplate(
                id=uuid.UUID(doc.id),
                user_id=uuid.UUID(data.get("user_id")),
                template_data=data.get("template_data"),
                finger_position=data.get("finger_position"),
                finger_position_label=data.get("finger_position_label"),
                minutiae_count=data.get("minutiae_count"),
                quality_score=data.get("quality_score"),
                ridge_density=data.get("ridge_density"),
                capture_device=data.get("capture_device"),
                capture_dpi=data.get("capture_dpi"),
                impression_type=data.get("impression_type"),
                algorithm_version=data.get("algorithm_version"),
                source_image_bytes=data.get("source_image_bytes"),
                created_at=data.get("created_at"),
            ))
        return records

    async def get_all(self) -> list[FingerprintTemplate]:
        col = self.db.collection("fingerprint_templates")
        docs = await col.get()
        records = []
        for doc in docs:
            data = doc.to_dict()
            records.append(FingerprintTemplate(
                id=uuid.UUID(doc.id),
                user_id=uuid.UUID(data.get("user_id")),
                template_data=data.get("template_data"),
                finger_position=data.get("finger_position"),
                finger_position_label=data.get("finger_position_label"),
                minutiae_count=data.get("minutiae_count"),
                quality_score=data.get("quality_score"),
                ridge_density=data.get("ridge_density"),
                capture_device=data.get("capture_device"),
                capture_dpi=data.get("capture_dpi"),
                impression_type=data.get("impression_type"),
                algorithm_version=data.get("algorithm_version"),
                source_image_bytes=data.get("source_image_bytes"),
                created_at=data.get("created_at"),
            ))
        return records

    async def count_by_user(self, user_id: uuid.UUID | str) -> int:
        col = self.db.collection("fingerprint_templates").where("user_id", "==", str(user_id))
        res = await col.count().get()
        return res[0].value

    async def delete_by_user(self, user_id: uuid.UUID | str) -> int:
        col = self.db.collection("fingerprint_templates").where("user_id", "==", str(user_id))
        docs = await col.get()
        deleted_count = 0
        for doc in docs:
            await doc.reference.delete()
            deleted_count += 1
        return deleted_count


class MerchantRepository:
    """Repository for merchant CRUD."""

    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def create(self, business_name: str, business_email: str, **kwargs) -> Merchant:
        mid = uuid.uuid4()
        merchant = Merchant(
            id=mid,
            business_name=business_name,
            business_email=business_email,
            created_at=datetime.now(timezone.utc),
            **kwargs
        )
        doc_ref = self.db.collection("merchants").document(str(mid))
        data = merchant.to_dict()
        data.pop("id", None)
        await doc_ref.set(data)
        return merchant

    async def get_by_id(self, merchant_id: uuid.UUID | str) -> Merchant | None:
        doc_ref = self.db.collection("merchants").document(str(merchant_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        return Merchant(
            id=uuid.UUID(doc.id),
            business_name=data.get("business_name"),
            business_email=data.get("business_email"),
            created_at=data.get("created_at"),
            # Merge any other attributes
            **{k: v for k, v in data.items() if k not in ("business_name", "business_email", "created_at")}
        )

    async def get_by_email(self, email: str) -> Merchant | None:
        col = self.db.collection("merchants")
        query = col.where("business_email", "==", email).limit(1)
        docs = await query.get()
        if not docs:
            return None
        doc = docs[0]
        data = doc.to_dict()
        return Merchant(
            id=uuid.UUID(doc.id),
            business_name=data.get("business_name"),
            business_email=data.get("business_email"),
            created_at=data.get("created_at"),
            **{k: v for k, v in data.items() if k not in ("business_name", "business_email", "created_at")}
        )

    async def get_all(self, page: int = 1, page_size: int = 50) -> tuple[list[Merchant], int]:
        col = self.db.collection("merchants")
        
        # Count total
        count_res = await col.count().get()
        total = count_res[0].value

        # Paginated query
        offset = (page - 1) * page_size
        query = col.order_by("created_at", direction="DESCENDING").offset(offset).limit(page_size)
        docs = await query.get()

        merchants = []
        for doc in docs:
            data = doc.to_dict()
            merchants.append(Merchant(
                id=uuid.UUID(doc.id),
                business_name=data.get("business_name"),
                business_email=data.get("business_email"),
                created_at=data.get("created_at"),
                **{k: v for k, v in data.items() if k not in ("business_name", "business_email", "created_at")}
            ))
        return merchants, total
