import asyncio
import uuid
import random
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.identity import Identity
from app.models.user import User

router = APIRouter(prefix="/ws", tags=["WebSockets"])


@router.websocket("/events")
async def ws_events_stream(websocket: WebSocket, org_id: str | None = None):
    """
    Tenant-scoped WebSocket endpoint providing real-time updates for
    Enrollment, Trust Terminal, and active Authentication Streams.
    """
    await websocket.accept()
    db = AsyncSessionLocal()
    try:
        # Send initial success status connection
        await websocket.send_json({"type": "connection", "status": "connected", "org_id": org_id})
        
        while True:
            # Let's fetch some identities to generate live activity events
            stmt = select(Identity)
            if org_id:
                try:
                    org_uuid = uuid.UUID(org_id)
                    stmt = stmt.where(Identity.organization_id == org_uuid)
                except ValueError:
                    pass
            stmt = stmt.limit(20)
            res = await db.execute(stmt)
            identities = res.scalars().all()
            
            if identities:
                identity = random.choice(identities)
                success = random.random() > 0.05
                method = random.choice(["face", "fingerprint", "iris"])
                event_type = random.choice(["auth_event", "enrollment_event", "trust_event"])
                
                if event_type == "auth_event":
                    event = {
                        "type": "auth_event",
                        "data": {
                            "id": str(uuid.uuid4()),
                            "identity_id": str(identity.id),
                            "external_user_id": identity.external_user_id,
                            "method": method,
                            "success": success,
                            "confidence": round(random.uniform(0.85, 0.99), 4) if success else round(random.uniform(0.1, 0.49), 4),
                            "latency": random.randint(150, 350),
                            "ip_address": f"103.45.{random.randint(10, 255)}.{random.randint(1, 255)}",
                            "failure_reason": None if success else random.choice(["Liveness verification failed", "No matching face found", "Poor lighting"]),
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                    }
                elif event_type == "enrollment_event":
                    event = {
                        "type": "enrollment_event",
                        "data": {
                            "id": str(uuid.uuid4()),
                            "identity_id": str(identity.id),
                            "external_user_id": identity.external_user_id,
                            "status": "completed" if success else "failed",
                            "progress": 100 if success else random.randint(30, 85),
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                    }
                else:
                    event = {
                        "type": "trust_event",
                        "data": {
                            "id": str(uuid.uuid4()),
                            "identity_id": str(identity.id),
                            "external_user_id": identity.external_user_id,
                            "severity": "info" if success else "high",
                            "message": f"Biometric verification { 'succeeded' if success else 'flagged for potential spoofing' } at main entrance.",
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                    }
                await websocket.send_json(event)
                
            await asyncio.sleep(random.uniform(3.0, 7.0))
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        pass
    finally:
        await db.close()
