import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.api_key_auth import OrgContext, get_org_context
from app.models.access_zone import AccessZone
from app.schemas.aaas import AccessZoneCreate, AccessZoneUpdate, AccessZoneResponse, PagedResponse

router = APIRouter(prefix="/access-zones", tags=["Access Zones"])


@router.get(
    "",
    response_model=PagedResponse[AccessZoneResponse],
    summary="List all access zones in your organization",
)
async def list_access_zones(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    site_id: uuid.UUID | None = Query(default=None),
    search: str | None = Query(default=None),
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> PagedResponse[AccessZoneResponse]:
    stmt = select(AccessZone).where(AccessZone.organization_id == ctx.org_id)
    if site_id:
        stmt = stmt.where(AccessZone.site_id == site_id)
    if search:
        stmt = stmt.where(AccessZone.name.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = stmt.order_by(AccessZone.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    zones = (await db.execute(stmt)).scalars().all()

    items = []
    for z in zones:
        # Convert list of uuids or strings to list of uuids for validation
        allowed_ids = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.allowed_identities or [])]
        allowed_projs = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.allowed_projects or [])]
        assigned_devs = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.assigned_devices or [])]
        
        items.append(AccessZoneResponse(
            id=z.id,
            organization_id=z.organization_id,
            site_id=z.site_id,
            name=z.name,
            description=z.description,
            allowed_identities=allowed_ids,
            allowed_projects=allowed_projs,
            allowed_schedule=z.allowed_schedule or {},
            assigned_devices=assigned_devs,
            security_policies=z.security_policies or {},
            created_at=z.created_at,
            updated_at=z.updated_at,
        ))

    return PagedResponse(total=total, page=page, page_size=page_size, items=items)


@router.post(
    "",
    response_model=AccessZoneResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new access zone",
)
async def create_access_zone(
    schema: AccessZoneCreate,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> AccessZoneResponse:
    # Convert uuids in lists to strings for JSON DB serialization
    allowed_ids = [str(x) for x in (schema.allowed_identities or [])]
    allowed_projs = [str(x) for x in (schema.allowed_projects or [])]
    assigned_devs = [str(x) for x in (schema.assigned_devices or [])]

    z = AccessZone(
        organization_id=ctx.org_id,
        site_id=schema.site_id,
        name=schema.name,
        description=schema.description,
        allowed_identities=allowed_ids,
        allowed_projects=allowed_projs,
        allowed_schedule=schema.allowed_schedule or {},
        assigned_devices=assigned_devs,
        security_policies=schema.security_policies or {},
    )
    db.add(z)
    await db.flush()
    await db.refresh(z)
    
    resp_ids = [uuid.UUID(x) for x in allowed_ids]
    resp_projs = [uuid.UUID(x) for x in allowed_projs]
    resp_devs = [uuid.UUID(x) for x in assigned_devs]

    return AccessZoneResponse(
        id=z.id,
        organization_id=z.organization_id,
        site_id=z.site_id,
        name=z.name,
        description=z.description,
        allowed_identities=resp_ids,
        allowed_projects=resp_projs,
        allowed_schedule=z.allowed_schedule,
        assigned_devices=resp_devs,
        security_policies=z.security_policies,
        created_at=z.created_at,
        updated_at=z.updated_at,
    )


@router.get(
    "/{zone_id}",
    response_model=AccessZoneResponse,
    summary="Retrieve details for a single access zone",
)
async def get_access_zone(
    zone_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> AccessZoneResponse:
    stmt = select(AccessZone).where(AccessZone.id == zone_id, AccessZone.organization_id == ctx.org_id)
    z = (await db.execute(stmt)).scalar_one_or_none()
    if not z:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access zone not found")
        
    allowed_ids = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.allowed_identities or [])]
    allowed_projs = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.allowed_projects or [])]
    assigned_devs = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.assigned_devices or [])]

    return AccessZoneResponse(
        id=z.id,
        organization_id=z.organization_id,
        site_id=z.site_id,
        name=z.name,
        description=z.description,
        allowed_identities=allowed_ids,
        allowed_projects=allowed_projs,
        allowed_schedule=z.allowed_schedule or {},
        assigned_devices=assigned_devs,
        security_policies=z.security_policies or {},
        created_at=z.created_at,
        updated_at=z.updated_at,
    )


@router.patch(
    "/{zone_id}",
    response_model=AccessZoneResponse,
    summary="Update an existing access zone",
)
async def update_access_zone(
    zone_id: uuid.UUID,
    schema: AccessZoneUpdate,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> AccessZoneResponse:
    stmt = select(AccessZone).where(AccessZone.id == zone_id, AccessZone.organization_id == ctx.org_id)
    z = (await db.execute(stmt)).scalar_one_or_none()
    if not z:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access zone not found")

    for field, val in schema.model_dump(exclude_unset=True).items():
        if field in ("allowed_identities", "allowed_projects", "assigned_devices") and val is not None:
            setattr(z, field, [str(x) for x in val])
        else:
            setattr(z, field, val)

    await db.flush()
    await db.refresh(z)
    
    allowed_ids = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.allowed_identities or [])]
    allowed_projs = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.allowed_projects or [])]
    assigned_devs = [uuid.UUID(x) if isinstance(x, str) else x for x in (z.assigned_devices or [])]

    return AccessZoneResponse(
        id=z.id,
        organization_id=z.organization_id,
        site_id=z.site_id,
        name=z.name,
        description=z.description,
        allowed_identities=allowed_ids,
        allowed_projects=allowed_projs,
        allowed_schedule=z.allowed_schedule or {},
        assigned_devices=assigned_devs,
        security_policies=z.security_policies or {},
        created_at=z.created_at,
        updated_at=z.updated_at,
    )


@router.delete(
    "/{zone_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an access zone",
)
async def delete_access_zone(
    zone_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(AccessZone).where(AccessZone.id == zone_id, AccessZone.organization_id == ctx.org_id)
    z = (await db.execute(stmt)).scalar_one_or_none()
    if not z:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Access zone not found")
    await db.delete(z)
    await db.flush()
    return {"deleted": True, "zone_id": str(zone_id)}
