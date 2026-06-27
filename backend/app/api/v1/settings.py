import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.api_key_auth import OrgContext, get_org_context
from app.models.organization import Organization

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get(
    "",
    summary="Get settings and configuration parameters for your organization",
)
async def get_org_settings(
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Organization).where(Organization.id == ctx.org_id)
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    return {
        "id": str(org.id),
        "name": org.name,
        "slug": org.slug,
        "plan": org.plan,
        "status": org.status,
        "created_at": org.created_at.isoformat() if org.created_at else None,
        "mfa_policy": "optional",
        "default_match_threshold": 0.85,
        "liveness_strictness": "high",
        "emergency_lockdown": False
    }


@router.patch(
    "",
    summary="Update organization configuration settings",
)
async def update_org_settings(
    payload: dict,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Organization).where(Organization.id == ctx.org_id)
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    if "name" in payload:
        org.name = payload["name"]

    await db.flush()
    await db.refresh(org)

    return {
        "id": str(org.id),
        "name": org.name,
        "slug": org.slug,
        "plan": org.plan,
        "status": org.status,
        "mfa_policy": payload.get("mfa_policy", "optional"),
        "default_match_threshold": payload.get("default_match_threshold", 0.85),
        "liveness_strictness": payload.get("liveness_strictness", "high"),
        "emergency_lockdown": payload.get("emergency_lockdown", False)
    }
