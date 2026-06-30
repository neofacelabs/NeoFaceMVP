"""
NeoFace AaaS — Webhook Service using Firebase Firestore.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import secrets
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from google.cloud.firestore import AsyncClient

from app.models.webhook import WebhookDelivery, WebhookEndpoint
from app.schemas.aaas import WebhookCreate, WebhookDeliveryResponse, WebhookResponse

SUPPORTED_EVENTS = {
    "identity.enrolled",
    "identity.verified",
    "liveness.passed",
    "liveness.failed",
    "session.created",
    "session.failed",
    "api_key.created",
    "api_key.rotated",
}


def _generate_signing_secret() -> str:
    return secrets.token_hex(32)


def sign_payload(secret: str, payload: dict[str, Any]) -> str:
    body = json.dumps(payload, sort_keys=True, default=str).encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), body, hashlib.sha256)
    return f"sha256={sig.hexdigest()}"


class WebhookService:
    def __init__(self, db: AsyncClient) -> None:
        self.db = db

    async def create_endpoint(
        self, org_id: uuid.UUID | str, schema: WebhookCreate
    ) -> WebhookResponse:
        invalid = set(schema.events) - SUPPORTED_EVENTS
        if invalid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unsupported event types: {sorted(invalid)}. Supported: {sorted(SUPPORTED_EVENTS)}",
            )
        signing_secret = _generate_signing_secret()
        wid = uuid.uuid4()
        now = datetime.now(timezone.utc)
        endpoint = WebhookEndpoint(
            id=wid,
            organization_id=uuid.UUID(str(org_id)),
            application_id=uuid.UUID(str(schema.application_id)) if schema.application_id else None,
            url=str(schema.url),
            signing_secret=signing_secret,
            events=schema.events,
            status="active",
            created_at=now,
            updated_at=now,
        )
        doc_ref = self.db.collection("webhook_endpoints").document(str(wid))
        data = endpoint.to_dict()
        data.pop("id", None)
        data["organization_id"] = str(org_id)
        if schema.application_id:
            data["application_id"] = str(schema.application_id)
        await doc_ref.set(data)
        return WebhookResponse.model_validate(endpoint)

    async def list_endpoints(
        self, org_id: uuid.UUID | str, page: int = 1, page_size: int = 50
    ) -> tuple[list[WebhookResponse], int]:
        col = self.db.collection("webhook_endpoints")
        query = col.where("organization_id", "==", str(org_id)).where("status", "==", "active")
        docs = await query.get()

        endpoints = []
        for doc in docs:
            data = doc.to_dict()
            oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
            aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
            endpoints.append(WebhookResponse.model_validate(WebhookEndpoint(
                id=uuid.UUID(doc.id),
                organization_id=oid,
                application_id=aid,
                url=data.get("url"),
                signing_secret=data.get("signing_secret"),
                events=data.get("events", []),
                status=data.get("status", "active"),
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
            )))

        # Sort in memory
        endpoints.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        total = len(endpoints)

        # Paginate in memory
        offset = (page - 1) * page_size
        paginated_endpoints = endpoints[offset : offset + page_size]
        return paginated_endpoints, total

    async def get_endpoint(
        self, endpoint_id: uuid.UUID | str, org_id: uuid.UUID | str
    ) -> WebhookEndpoint:
        doc_ref = self.db.collection("webhook_endpoints").document(str(endpoint_id))
        doc = await doc_ref.get()
        if not doc.exists or doc.to_dict().get("organization_id") != str(org_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook endpoint not found")
        data = doc.to_dict()
        oid = uuid.UUID(data.get("organization_id")) if data.get("organization_id") else None
        aid = uuid.UUID(data.get("application_id")) if data.get("application_id") else None
        return WebhookEndpoint(
            id=uuid.UUID(doc.id),
            organization_id=oid,
            application_id=aid,
            url=data.get("url"),
            signing_secret=data.get("signing_secret"),
            events=data.get("events", []),
            status=data.get("status", "active"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )

    async def send_test(
        self, endpoint_id: uuid.UUID | str, org_id: uuid.UUID | str
    ) -> dict:
        endpoint = await self.get_endpoint(endpoint_id, org_id)
        payload = {
            "event": "webhook.test",
            "org_id": str(org_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": {"message": "Test webhook from NeoFace Labs"},
        }
        did = uuid.uuid4()
        delivery = WebhookDelivery(
            id=did,
            endpoint_id=endpoint.id,
            event_type="webhook.test",
            payload=payload,
            status="pending",
            created_at=datetime.now(timezone.utc),
        )
        doc_ref = self.db.collection("webhook_deliveries").document(str(did))
        data = delivery.to_dict()
        data.pop("id", None)
        data["endpoint_id"] = str(endpoint.id)
        await doc_ref.set(data)

        try:
            from app.tasks.webhook_tasks import deliver_webhook
            deliver_webhook.delay(str(delivery.id))
        except Exception:
            pass

        return {"queued": True, "delivery_id": str(delivery.id)}

    async def dispatch(
        self,
        org_id: uuid.UUID | str,
        event_type: str,
        payload: dict[str, Any],
    ) -> None:
        col = self.db.collection("webhook_endpoints")
        query = col.where("organization_id", "==", str(org_id)).where("status", "==", "active")
        docs = await query.get()

        for doc in docs:
            data = doc.to_dict()
            events = data.get("events", [])
            if event_type not in events:
                continue

            did = uuid.uuid4()
            delivery = WebhookDelivery(
                id=did,
                endpoint_id=uuid.UUID(doc.id),
                event_type=event_type,
                payload=payload,
                status="pending",
                created_at=datetime.now(timezone.utc),
            )
            doc_ref = self.db.collection("webhook_deliveries").document(str(did))
            d_data = delivery.to_dict()
            d_data.pop("id", None)
            d_data["endpoint_id"] = str(doc.id)
            await doc_ref.set(d_data)
            
            try:
                from app.tasks.webhook_tasks import deliver_webhook
                deliver_webhook.delay(str(delivery.id))
            except Exception:
                pass

    async def list_deliveries(
        self,
        endpoint_id: uuid.UUID | str,
        org_id: uuid.UUID | str,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[WebhookDeliveryResponse], int]:
        await self.get_endpoint(endpoint_id, org_id)
        col = self.db.collection("webhook_deliveries")
        query = col.where("endpoint_id", "==", str(endpoint_id))
        docs = await query.get()

        deliveries = []
        for doc in docs:
            data = doc.to_dict()
            deliveries.append(WebhookDeliveryResponse.model_validate(WebhookDelivery(
                id=uuid.UUID(doc.id),
                endpoint_id=uuid.UUID(data.get("endpoint_id")),
                event_type=data.get("event_type"),
                payload=data.get("payload"),
                status=data.get("status", "pending"),
                response_status=data.get("response_status"),
                response_body=data.get("response_body"),
                created_at=data.get("created_at"),
            )))
            
        # Sort in memory
        deliveries.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        total = len(deliveries)
        
        # Paginate in memory
        offset = (page - 1) * page_size
        paginated_deliveries = deliveries[offset : offset + page_size]
        return paginated_deliveries, total

    async def delete_endpoint(
        self, endpoint_id: uuid.UUID | str, org_id: uuid.UUID | str
    ) -> None:
        endpoint = await self.get_endpoint(endpoint_id, org_id)
        doc_ref = self.db.collection("webhook_endpoints").document(str(endpoint.id))
        await doc_ref.delete()
