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
    from app.repositories.organization_repository import OrganizationRepository
    repo = OrganizationRepository(db)
    
    apps, total = await repo.list_applications(ctx.org_id, page=page, page_size=page_size)
    
    # Map from domain models to ApplicationResponse
    items = []
    for a in apps:
        items.append(ApplicationResponse(
            id=a.id,
            organization_id=a.organization_id,
            site_id=a.site_id,
            name=a.name,
            environment=a.environment,
            status=a.status,
            description=a.description,
            allowed_origins=a.allowed_origins,
            allowed_domains=a.allowed_domains,
            webhook_url=a.webhook_url,
            rate_limit=a.rate_limit,
            created_at=a.created_at,
            updated_at=a.updated_at,
        ))
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
