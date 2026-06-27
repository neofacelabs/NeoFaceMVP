import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import require_permissions

router = APIRouter(prefix="/notifications", tags=["Admin — System Notifications & Broadcasts"])

# For broadcasts, let's keep an in-memory database of active announcements since they are read-heavy and dynamic.
broadcasts = [
    {
        "id": "notice-1",
        "title": "Scheduled DB Maintenance",
        "message": "We will perform database maintenance on Saturday, July 4th between 02:00 and 04:00 UTC.",
        "target": "all_organizations",
        "severity": "warning",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": "admin@neoface.io",
    }
]


@router.get(
    "/broadcasts",
    summary="[Admin] Get list of system-wide notifications and banners",
)
async def get_broadcasts(
    _=Depends(require_permissions(["infrastructure.manage"])),
) -> dict:
    return {
        "broadcasts": broadcasts
    }


@router.post(
    "/broadcasts",
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Send a platform banner/announcement",
)
async def create_broadcast(
    payload: dict,
    _=Depends(require_permissions(["infrastructure.manage"])),
) -> dict:
    title = payload.get("title")
    message = payload.get("message")
    severity = payload.get("severity", "info")
    target = payload.get("target", "all_organizations")

    if not title or not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title and message are required.")

    new_notice = {
        "id": f"notice-{uuid.uuid4()}",
        "title": title,
        "message": message,
        "target": target,
        "severity": severity,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": "admin@neoface.io",
    }
    broadcasts.insert(0, new_notice)
    return new_notice


@router.delete(
    "/broadcasts/{id}",
    summary="[Admin] Remove an active system announcement",
)
async def delete_broadcast(
    id: str,
    _=Depends(require_permissions(["infrastructure.manage"])),
) -> dict:
    global broadcasts
    original_len = len(broadcasts)
    broadcasts = [b for b in broadcasts if b["id"] != id]
    if len(broadcasts) == original_len:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found.")
    return {"deleted": True, "id": id}
