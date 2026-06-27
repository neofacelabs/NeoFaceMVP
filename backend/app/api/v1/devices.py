import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.api_key_auth import OrgContext, get_org_context
from app.models.device import Device
from app.models.site import Site
from app.models.application import Application

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get(
    "",
    summary="List all registered hardware devices in your organization",
)
async def list_devices(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    site_id: uuid.UUID | None = Query(default=None),
    type_filter: str | None = Query(default=None, alias="type"),
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Device).where(Device.organization_id == ctx.org_id)
    if site_id:
        stmt = stmt.where(Device.site_id == site_id)
    if type_filter:
        stmt = stmt.where(Device.type == type_filter)
    if status_filter:
        stmt = stmt.where(Device.status == status_filter)
    if search:
        stmt = stmt.where(Device.name.ilike(f"%{search}%") | Device.ip_address.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = stmt.order_by(Device.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    devices = (await db.execute(stmt)).scalars().all()

    items = []
    for d in devices:
        items.append({
            "id": str(d.id),
            "name": d.name,
            "type": d.type,
            "status": d.status,
            "ip_address": d.ip_address,
            "firmware_version": d.firmware_version,
            "health_score": d.health_score,
            "battery_level": d.battery_level,
            "last_heartbeat": d.last_heartbeat.isoformat() if d.last_heartbeat else None,
            "site_id": str(d.site_id) if d.site_id else None,
            "application_id": str(d.application_id) if d.application_id else None,
            "created_at": d.created_at.isoformat(),
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items
    }


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new device",
)
async def create_device(
    payload: dict,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    site_id = payload.get("site_id")
    app_id = payload.get("application_id")
    
    if site_id:
        site_id = uuid.UUID(site_id)
        site = (await db.execute(select(Site).where(Site.id == site_id, Site.organization_id == ctx.org_id))).scalar_one_or_none()
        if not site:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
    if app_id:
        app_id = uuid.UUID(app_id)
        app = (await db.execute(select(Application).where(Application.id == app_id, Application.organization_id == ctx.org_id))).scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    d = Device(
        organization_id=ctx.org_id,
        site_id=site_id,
        application_id=app_id,
        name=payload["name"],
        type=payload["type"],
        status=payload.get("status", "online"),
        ip_address=payload.get("ip_address"),
        firmware_version=payload.get("firmware_version", "1.0.0"),
        health_score=payload.get("health_score", 100),
        battery_level=payload.get("battery_level", 100),
        last_heartbeat=datetime.now(timezone.utc),
    )
    db.add(d)
    await db.flush()
    await db.refresh(d)
    
    return {
        "id": str(d.id),
        "name": d.name,
        "type": d.type,
        "status": d.status,
        "ip_address": d.ip_address,
        "firmware_version": d.firmware_version,
        "health_score": d.health_score,
        "battery_level": d.battery_level,
        "site_id": str(d.site_id) if d.site_id else None,
        "application_id": str(d.application_id) if d.application_id else None,
    }


@router.get(
    "/{device_id}",
    summary="Retrieve details for a single device",
)
async def get_device(
    device_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Device).where(Device.id == device_id, Device.organization_id == ctx.org_id)
    d = (await db.execute(stmt)).scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
        
    return {
        "id": str(d.id),
        "name": d.name,
        "type": d.type,
        "status": d.status,
        "ip_address": d.ip_address,
        "firmware_version": d.firmware_version,
        "health_score": d.health_score,
        "battery_level": d.battery_level,
        "last_heartbeat": d.last_heartbeat.isoformat() if d.last_heartbeat else None,
        "site_id": str(d.site_id) if d.site_id else None,
        "application_id": str(d.application_id) if d.application_id else None,
        "created_at": d.created_at.isoformat(),
    }


@router.patch(
    "/{device_id}",
    summary="Update device configurations",
)
async def update_device(
    device_id: uuid.UUID,
    payload: dict,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Device).where(Device.id == device_id, Device.organization_id == ctx.org_id)
    d = (await db.execute(stmt)).scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    if "site_id" in payload:
        if payload["site_id"] is not None:
            s_id = uuid.UUID(payload["site_id"])
            site = (await db.execute(select(Site).where(Site.id == s_id, Site.organization_id == ctx.org_id))).scalar_one_or_none()
            if not site:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            d.site_id = s_id
        else:
            d.site_id = None
            
    if "application_id" in payload:
        if payload["application_id"] is not None:
            a_id = uuid.UUID(payload["application_id"])
            app = (await db.execute(select(Application).where(Application.id == a_id, Application.organization_id == ctx.org_id))).scalar_one_or_none()
            if not app:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
            d.application_id = a_id
        else:
            d.application_id = None

    if "name" in payload:
        d.name = payload["name"]
    if "type" in payload:
        d.type = payload["type"]
    if "status" in payload:
        d.status = payload["status"]

    await db.flush()
    await db.refresh(d)
    
    return {
        "id": str(d.id),
        "name": d.name,
        "type": d.type,
        "status": d.status,
        "ip_address": d.ip_address,
        "firmware_version": d.firmware_version,
        "health_score": d.health_score,
        "site_id": str(d.site_id) if d.site_id else None,
        "application_id": str(d.application_id) if d.application_id else None,
    }


@router.post(
    "/{device_id}/reboot",
    summary="Trigger hardware reboot cycle",
)
async def reboot_device(
    device_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Device).where(Device.id == device_id, Device.organization_id == ctx.org_id)
    d = (await db.execute(stmt)).scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
        
    d.status = "offline"
    await db.flush()
    # Simulate async reboot back to online in a real scenario
    return {"rebooting": True, "device_id": str(device_id)}


@router.delete(
    "/{device_id}",
    summary="Deregister device",
)
async def delete_device(
    device_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Device).where(Device.id == device_id, Device.organization_id == ctx.org_id)
    d = (await db.execute(stmt)).scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
        
    await db.delete(d)
    await db.flush()
    return {"deleted": True, "device_id": str(device_id)}
