"""
NeoFace AaaS — Model Registry Service using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from google.cloud.firestore import AsyncClient

from app.models.model_version import ModelVersion
from app.schemas.aaas import ModelVersionResponse

_SEED_MODELS = [
    {
        "model_name": "face_recognition",
        "version": "2.1.0",
        "accuracy": 0.9973,
        "far": 0.00042,
        "frr": 0.0021,
        "latency_ms": 38,
        "status": "active",
    },
    {
        "model_name": "liveness",
        "version": "1.4.2",
        "accuracy": 0.9891,
        "far": 0.0081,
        "frr": 0.0104,
        "latency_ms": 24,
        "status": "active",
    },
    {
        "model_name": "anti_spoof",
        "version": "1.2.1",
        "accuracy": 0.9812,
        "far": 0.0094,
        "frr": 0.0193,
        "latency_ms": 18,
        "status": "active",
    },
    {
        "model_name": "deepfake",
        "version": "1.1.0",
        "accuracy": 0.9654,
        "far": 0.0219,
        "frr": 0.0127,
        "latency_ms": 56,
        "status": "active",
    },
    {
        "model_name": "emotion",
        "version": "1.0.3",
        "accuracy": 0.8921,
        "far": None,
        "frr": None,
        "latency_ms": 14,
        "status": "active",
    },
]


class ModelRegistryService:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def seed_if_empty(self) -> None:
        """Seed initial model versions if the collection is empty."""
        col = self.db.collection("model_versions")
        res = await col.limit(1).get()
        if len(res) > 0:
            return

        for model_data in _SEED_MODELS:
            mid = uuid.uuid4()
            mv = ModelVersion(
                id=mid,
                deployed_at=datetime.now(timezone.utc),
                **model_data
            )
            data = mv.to_dict()
            data.pop("id", None)
            await col.document(str(mid)).set(data)

    async def list_all(self) -> list[ModelVersionResponse]:
        col = self.db.collection("model_versions")
        docs = await col.get()
        versions = []
        for doc in docs:
            data = doc.to_dict()
            versions.append(ModelVersion(
                id=uuid.UUID(doc.id),
                model_name=data.get("model_name"),
                version=data.get("version"),
                accuracy=data.get("accuracy"),
                far=data.get("far"),
                frr=data.get("frr"),
                latency_ms=data.get("latency_ms"),
                status=data.get("status", "active"),
                deployed_at=data.get("deployed_at"),
            ))
        # Sort by model_name asc, deployed_at desc
        versions.sort(key=lambda x: (x.model_name or "", x.deployed_at or datetime.min), reverse=True)
        # But name should be asc, so we need custom sorting:
        versions.sort(key=lambda x: (x.model_name or ""))
        return [ModelVersionResponse.model_validate(v) for v in versions]

    async def get_by_id(self, model_id) -> ModelVersionResponse | None:
        doc_ref = self.db.collection("model_versions").document(str(model_id))
        doc = await doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        assert data is not None
        v = ModelVersion(
            id=uuid.UUID(doc.id),
            model_name=data.get("model_name"),
            version=data.get("version"),
            accuracy=data.get("accuracy"),
            far=data.get("far"),
            frr=data.get("frr"),
            latency_ms=data.get("latency_ms"),
            status=data.get("status", "active"),
            deployed_at=data.get("deployed_at"),
        )
        return ModelVersionResponse.model_validate(v)
