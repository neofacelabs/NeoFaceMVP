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
    from datetime import datetime, timezone
    from app.repositories.identity_repository import IdentityRepository
    
    repo = IdentityRepository(db)
    identity = await repo.get_by_id_and_org(identity_id, ctx.org_id)
    if not identity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Identity not found")

    doc_ref = db.collection("identities").document(str(identity_id))
    updates = {
        "updated_at": datetime.now(timezone.utc)
    }

    if schema.site_id is not None:
        updates["site_id"] = str(schema.site_id)
        identity.site_id = schema.site_id

    for field, val in schema.model_dump(exclude_unset=True).items():
        if field == "site_id":
            continue
        if val is not None:
            updates[field] = val
            setattr(identity, field, val)

    await doc_ref.update(updates)
    return IdentityResponse.model_validate(identity)

