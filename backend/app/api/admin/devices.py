import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import require_permissions
from app.models.device import Device
from app.models.organization import Organization
from app.models.application import Application

router = APIRouter(prefix="/devices", tags=["Admin — Devices"])


@router.get(
    "",
    summary="[Admin] List all registered hardware devices",
)
async def list_devices(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    type_filter: str | None = Query(default=None, alias="type"),
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
    _=Depends(require_permissions(["devices.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Device)
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
            "organization_id": str(d.organization_id) if d.organization_id else None,
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
    summary="[Admin] Register a new device",
)
async def create_device(
    payload: dict,
    _=Depends(require_permissions(["devices.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    # Validate org/app if provided
    org_id = payload.get("organization_id")
    app_id = payload.get("application_id")
    
    if org_id:
        org_id = uuid.UUID(org_id)
        org = (await db.execute(select(Organization).where(Organization.id == org_id))).scalar_one_or_none()
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
            
    if app_id:
        app_id = uuid.UUID(app_id)
        app = (await db.execute(select(Application).where(Application.id == app_id))).scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    d = Device(
        name=payload["name"],
        type=payload["type"],
        status=payload.get("status", "online"),
        ip_address=payload.get("ip_address"),
        firmware_version=payload.get("firmware_version", "1.0.0"),
        health_score=payload.get("health_score", 100),
        battery_level=payload.get("battery_level"),
        last_heartbeat=datetime.now(timezone.utc),
        organization_id=org_id,
        application_id=app_id,
    )
    db.add(d)
    await db.flush()
    await db.refresh(d)
    return {"id": str(d.id), "name": d.name, "created_at": d.created_at.isoformat()}


@router.get(
    "/{device_id}",
    summary="[Admin] Retrieve device details",
)
async def get_device(
    device_id: uuid.UUID,
    _=Depends(require_permissions(["devices.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    d = (await db.execute(select(Device).where(Device.id == device_id))).scalar_one_or_none()
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
        "organization_id": str(d.organization_id) if d.organization_id else None,
        "application_id": str(d.application_id) if d.application_id else None,
    }


@router.patch(
    "/{device_id}",
    summary="[Admin] Update device settings or assignments",
)
async def update_device(
    device_id: uuid.UUID,
    payload: dict,
    _=Depends(require_permissions(["devices.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    d = (await db.execute(select(Device).where(Device.id == device_id))).scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    for field in ["name", "type", "status", "ip_address", "firmware_version", "health_score", "battery_level"]:
        if field in payload:
            setattr(d, field, payload[field])
            
    if "organization_id" in payload:
        org_val = payload["organization_id"]
        d.organization_id = uuid.UUID(org_val) if org_val else None
    if "application_id" in payload:
        app_val = payload["application_id"]
        d.application_id = uuid.UUID(app_val) if app_val else None

    await db.flush()
    return {"updated": True, "id": str(d.id)}


@router.delete(
    "/{device_id}",
    summary="[Admin] Delete a device registration",
)
async def delete_device(
    device_id: uuid.UUID,
    _=Depends(require_permissions(["devices.manage"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    d = (await db.execute(select(Device).where(Device.id == device_id))).scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    await db.delete(d)
    await db.flush()
    return {"deleted": True, "device_id": str(device_id)}
