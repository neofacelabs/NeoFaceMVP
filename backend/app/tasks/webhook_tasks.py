"""
NeoFace AaaS — Celery Webhook Delivery Task
Delivers webhook payloads to customer endpoints with exponential backoff.
"""

from __future__ import annotations

import asyncio
from celery import Celery
from app.core.config import settings

# ── Celery app ────────────────────────────────────────────────────────────────
celery_app = Celery(
    "neoface_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=30,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=480,
)
def deliver_webhook(self, delivery_id: str) -> dict:
    """
    Deliver a single webhook payload to the registered endpoint.
    Runs the async implementation using asyncio.run.
    """
    return asyncio.run(self._deliver_webhook_async(delivery_id))


async def _deliver_webhook_async(self, delivery_id: str) -> dict:
    import httpx
    from app.core.database import _get_firestore_client
    
    db = _get_firestore_client()
    
    # 1. Fetch delivery document
    delivery_ref = db.collection("webhook_deliveries").document(delivery_id)
    delivery_doc = await delivery_ref.get()
    if not delivery_doc.exists:
        return {"error": "delivery not found"}
    delivery_data = delivery_doc.to_dict()
    
    # 2. Fetch endpoint document
    endpoint_id = delivery_data.get("endpoint_id")
    endpoint_ref = db.collection("webhook_endpoints").document(str(endpoint_id))
    endpoint_doc = await endpoint_ref.get()
    if not endpoint_doc.exists:
        await delivery_ref.update({"status": "failed"})
        return {"error": "endpoint not found"}
        
    endpoint_data = endpoint_doc.to_dict()
    if endpoint_data.get("status") != "active":
        await delivery_ref.update({"status": "failed"})
        return {"error": "endpoint inactive"}
        
    # Build payload with signature
    from app.services.webhook_service import sign_payload
    signing_secret = endpoint_data.get("signing_secret", "")
    payload = delivery_data.get("payload", {})
    event_type = delivery_data.get("event_type", "")
    
    signature = sign_payload(signing_secret, payload)
    
    attempts = delivery_data.get("attempts", 0) + 1
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                endpoint_data.get("url"),
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-NeoFace-Signature": signature,
                    "X-NeoFace-Event": event_type,
                    "User-Agent": "NeoFace-Webhooks/1.0",
                }
            )
            
        http_status = resp.status_code
        status = "success" if resp.status_code < 400 else "failed"
        
        await delivery_ref.update({
            "attempts": attempts,
            "http_status": http_status,
            "status": status,
        })
        
        if status == "failed":
            raise Exception(f"HTTP {http_status}")
            
    except Exception as exc:
        status = "retrying" if self.request.retries < self.max_retries else "failed"
        await delivery_ref.update({
            "attempts": attempts,
            "status": status,
        })
        
        # Exponential backoff countdown
        countdown = 30 * (2 ** self.request.retries)
        raise self.retry(exc=exc, countdown=countdown)
        
    return {"status": status, "http_status": http_status}


# Monkeypatch the class to have _deliver_webhook_async
celery_app.Task._deliver_webhook_async = _deliver_webhook_async
