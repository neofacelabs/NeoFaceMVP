import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.api_key_auth import OrgContext, get_org_context
from app.models.site import Site
from app.schemas.aaas import SiteCreate, SiteUpdate, SiteResponse, PagedResponse

router = APIRouter(prefix="/sites", tags=["Sites"])


@router.get(
    "",
    response_model=PagedResponse[SiteResponse],
    summary="List all physical sites in your organization",
)
async def list_sites(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> PagedResponse[SiteResponse]:
    stmt = select(Site).where(Site.organization_id == ctx.org_id)
    if status:
        stmt = stmt.where(Site.status == status)
    if search:
        stmt = stmt.where(Site.name.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = stmt.order_by(Site.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    sites = (await db.execute(stmt)).scalars().all()

    items = [SiteResponse.model_validate(s) for s in sites]
    return PagedResponse(total=total, page=page, page_size=page_size, items=items)


@router.post(
    "",
    response_model=SiteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new physical site",
)
async def create_site(
    schema: SiteCreate,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> SiteResponse:
    s = Site(
        organization_id=ctx.org_id,
        name=schema.name,
        description=schema.description,
        status="active",
    )
    db.add(s)
    await db.flush()
    await db.refresh(s)
    return SiteResponse.model_validate(s)


@router.get(
    "/{site_id}",
    response_model=SiteResponse,
    summary="Retrieve details for a single site",
)
async def get_site(
    site_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> SiteResponse:
    stmt = select(Site).where(Site.id == site_id, Site.organization_id == ctx.org_id)
    s = (await db.execute(stmt)).scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return SiteResponse.model_validate(s)


@router.patch(
    "/{site_id}",
    response_model=SiteResponse,
    summary="Update an existing site",
)
async def update_site(
    site_id: uuid.UUID,
    schema: SiteUpdate,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> SiteResponse:
    stmt = select(Site).where(Site.id == site_id, Site.organization_id == ctx.org_id)
    s = (await db.execute(stmt)).scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    for field, val in schema.model_dump(exclude_unset=True).items():
        setattr(s, field, val)

    await db.flush()
    await db.refresh(s)
    return SiteResponse.model_validate(s)


@router.delete(
    "/{site_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a physical site",
)
async def delete_site(
    site_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Site).where(Site.id == site_id, Site.organization_id == ctx.org_id)
    s = (await db.execute(stmt)).scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    await db.delete(s)
    await db.flush()
    return {"deleted": True, "site_id": str(site_id)}
