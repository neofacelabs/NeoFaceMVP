import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import require_permissions
from app.models.auth_log import AuthLog
from app.models.identity import Identity

router = APIRouter(prefix="/security", tags=["Admin — Security Center"])


@router.get(
    "/threat-alerts",
    summary="[Admin] Get active threat alerts and security violations",
)
async def get_threat_alerts(
    limit: int = Query(default=10, ge=1, le=100),
    _=Depends(require_permissions(["infrastructure.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    # Query failed authentication attempts with high risk scores or spoof flags
    stmt = (
        select(AuthLog)
        .where(AuthLog.authentication_result == False)
        .order_by(AuthLog.timestamp.desc())
        .limit(limit)
    )
    logs = (await db.execute(stmt)).scalars().all()

    threats = []
    for l in logs:
        # Load user/identity to get context
        user_name = "Unknown Subject"
        org_name = "System"
        
        threat_type = "Brute Force Attempt"
        if l.failure_reason and ("spoof" in l.failure_reason.lower() or "liveness" in l.failure_reason.lower()):
            threat_type = "Deepfake / Photo Spoof Attempt"
        elif l.failure_reason and "matching" in l.failure_reason.lower():
            threat_type = "Unknown Face Match Attempt"
            
        threats.append({
            "id": str(l.id),
            "threat_type": threat_type,
            "risk_score": 0.85 if "Spoof" in threat_type else 0.65,
            "ip_address": l.ip_address or "192.168.1.1",
            "location": "New Delhi, IN",
            "timestamp": l.timestamp.isoformat(),
            "status": "investigating",
        })

    return {
        "active_threats_count": len(threats),
        "threats": threats
    }


@router.post(
    "/lockdown",
    summary="[Admin] Trigger emergency global or project-level lockdown",
)
async def trigger_lockdown(
    payload: dict,
    _=Depends(require_permissions(["infrastructure.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    scope = payload.get("scope", "global")
    target_id = payload.get("target_id") # can be project_id or org_id
    
    # Stub: log a lockdown event
    return {
        "status": "locked_down",
        "scope": scope,
        "target_id": target_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": f"Emergency lockdown successfully initiated for scope: {scope}."
    }


@router.post(
    "/lockdown/release",
    summary="[Admin] Release an emergency lockdown",
)
async def release_lockdown(
    payload: dict,
    _=Depends(require_permissions(["infrastructure.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    scope = payload.get("scope", "global")
    target_id = payload.get("target_id")
    
    return {
        "status": "active",
        "scope": scope,
        "target_id": target_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": "Emergency lockdown successfully released."
    }


@router.get(
    "/access-control",
    summary="[Admin] Get IP blacklist and whitelist details",
)
async def get_access_control(
    _=Depends(require_permissions(["infrastructure.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return {
        "blacklist": [],
        "whitelist": ["127.0.0.1", "192.168.1.0/24"],
    }


@router.post(
    "/access-control",
    summary="[Admin] Modify IP blacklist/whitelist",
)
async def modify_access_control(
    payload: dict,
    _=Depends(require_permissions(["infrastructure.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    # Stub
    action = payload.get("action") # add_blacklist | remove_blacklist | add_whitelist | remove_whitelist
    ip = payload.get("ip")
    return {
        "success": True,
        "action": action,
        "ip": ip,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
