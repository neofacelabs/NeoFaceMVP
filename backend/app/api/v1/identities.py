"""
NeoFace AaaS — Identities Router
GET    /api/v1/identities
GET    /api/v1/identities/{id}
POST   /api/v1/identities
DELETE /api/v1/identities/{id}
"""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.api_key_auth import OrgContext, get_org_context
from app.schemas.aaas import IdentityCreate, IdentityResponse, IdentityUpdate, PagedResponse
from app.services.identity_service import IdentityService

router = APIRouter(prefix="/identities", tags=["Identities"])


@router.get(
    "",
    response_model=PagedResponse[IdentityResponse],
    summary="List identities in your organization",
)
async def list_identities(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    application_id: uuid.UUID | None = Query(default=None),
    status: str | None = Query(default=None, description="Filter by status"),
    identity_type: str | None = Query(default=None, description="Filter by identity_type"),
    site_id: uuid.UUID | None = Query(default=None, description="Filter by site_id"),
    search: str | None = Query(default=None, description="Search by external_user_id"),
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> PagedResponse[IdentityResponse]:
    svc = IdentityService(db)
    identities, total = await svc.list(
        ctx.org_id,
        page=page,
        page_size=page_size,
        app_id=application_id,
        status_filter=status,
        identity_type=identity_type,
        site_id=site_id,
        search=search,
    )
    return PagedResponse(total=total, page=page, page_size=page_size, items=identities)


@router.get(
    "/{identity_id}",
    response_model=IdentityResponse,
    summary="Get a single identity",
)
async def get_identity(
    identity_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> IdentityResponse:
    svc = IdentityService(db)
    return await svc.get(identity_id, ctx.org_id)


@router.post(
    "",
    response_model=IdentityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new identity",
)
async def create_identity(
    schema: IdentityCreate,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> IdentityResponse:
    svc = IdentityService(db)
    return await svc.create(ctx.org_id, schema)


@router.delete(
    "/{identity_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an identity",
)
async def delete_identity(
    identity_id: uuid.UUID,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    svc = IdentityService(db)
    return await svc.delete(identity_id, ctx.org_id)


@router.patch(
    "/{identity_id}",
    response_model=IdentityResponse,
    summary="Update an identity's profile, site, status, or metadata",
)
async def update_identity(
    identity_id: uuid.UUID,
    schema: IdentityUpdate,
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> IdentityResponse:
    from app.models.identity import Identity
    from app.models.site import Site
    
    stmt = select(Identity).where(Identity.id == identity_id, Identity.organization_id == ctx.org_id)
    identity = (await db.execute(stmt)).scalar_one_or_none()
    if not identity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Identity not found")

    if schema.site_id is not None:
        # Check if site belongs to this organization
        site_stmt = select(Site).where(Site.id == schema.site_id, Site.organization_id == ctx.org_id)
        site = (await db.execute(site_stmt)).scalar_one_or_none()
        if not site:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found in organization")
        identity.site_id = schema.site_id

    for field, val in schema.model_dump(exclude_unset=True).items():
        if field == "site_id":
            continue
        if val is not None:
            setattr(identity, field, val)

    await db.flush()
    await db.refresh(identity)
    return IdentityResponse.model_validate(identity)

