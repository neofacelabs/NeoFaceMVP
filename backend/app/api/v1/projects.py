"""
NeoFace AaaS — Projects (Applications) Router
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{id}
PATCH  /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.api_key_auth import OrgContext, get_org_context, require_scope
from app.schemas.aaas import ApplicationCreate, ApplicationUpdate, ApplicationResponse, PagedResponse
from app.repositories.organization_repository import OrganizationRepository

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get(
    "",
    response_model=PagedResponse[ApplicationResponse],
    summary="List projects for your organization",
)
async def list_projects(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    site_id: uuid.UUID | None = Query(default=None),
    search: str | None = Query(default=None),
    ctx: OrgContext = Depends(require_scope("project:read")),
    db: AsyncSession = Depends(get_db),
) -> PagedResponse[ApplicationResponse]:
    from sqlalchemy import select, func
    from app.models.application import Application
    
    stmt = select(Application).where(Application.organization_id == ctx.org_id)
    if site_id:
        stmt = stmt.where(Application.site_id == site_id)
    if search:
        stmt = stmt.where(Application.name.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = stmt.order_by(Application.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    apps = (await db.execute(stmt)).scalars().all()
    
    items = [ApplicationResponse.model_validate(a) for a in apps]
    return PagedResponse(total=total, page=page, page_size=page_size, items=items)


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
)
async def create_project(
    schema: ApplicationCreate,
    ctx: OrgContext = Depends(require_scope("project:write")),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    repo = OrganizationRepository(db)
    return await repo.create_application(ctx.org_id, schema)


@router.get(
    "/{project_id}",
    response_model=ApplicationResponse,
    summary="Retrieve a project by ID",
)
async def get_project(
    project_id: uuid.UUID,
    ctx: OrgContext = Depends(require_scope("project:read")),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    repo = OrganizationRepository(db)
    app = await repo.get_application(project_id)
    if not app or app.organization_id != ctx.org_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return app


@router.patch(
    "/{project_id}",
    response_model=ApplicationResponse,
    summary="Update a project",
)
async def update_project(
    project_id: uuid.UUID,
    schema: ApplicationUpdate,
    ctx: OrgContext = Depends(require_scope("project:write")),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    repo = OrganizationRepository(db)
    app = await repo.update_application(project_id, ctx.org_id, schema)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or unauthorized",
        )
    return app


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project",
)
async def delete_project(
    project_id: uuid.UUID,
    ctx: OrgContext = Depends(require_scope("project:write")),
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = OrganizationRepository(db)
    success = await repo.delete_application(project_id, ctx.org_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or unauthorized",
        )
