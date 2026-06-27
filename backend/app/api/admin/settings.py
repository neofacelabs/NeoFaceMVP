from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import require_permissions

router = APIRouter(prefix="/settings", tags=["Admin — System Settings"])

# In-memory store for global settings variables
system_settings = {
    "smtp_server": "smtp.sendgrid.net",
    "smtp_port": 587,
    "smtp_sender": "no-reply@neoface.io",
    "maintenance_mode": False,
    "allow_self_registration": True,
    "mfa_policy": "optional",
    "default_face_threshold": 0.85,
    "liveness_strict_mode": True,
}


@router.get(
    "",
    summary="[Admin] Get global control center configuration variables",
)
async def get_system_settings(
    _=Depends(require_permissions(["infrastructure.manage"])),
) -> dict:
    return system_settings


@router.patch(
    "",
    summary="[Admin] Update global system-wide settings",
)
async def update_system_settings(
    payload: dict,
    _=Depends(require_permissions(["infrastructure.manage"])),
) -> dict:
    global system_settings
    for k, v in payload.items():
        if k in system_settings:
            # Type assertion matching original
            orig_type = type(system_settings[k])
            try:
                system_settings[k] = orig_type(v)
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid value type for '{k}'.")
    return system_settings
