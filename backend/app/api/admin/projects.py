import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import require_permissions
from app.models.application import Application
from app.models.organization import Organization
from app.schemas.aaas import (
    ApplicationResponse,
    ApplicationCreate,
    ApplicationUpdate,
    PagedResponse,
)

router = APIRouter(prefix="/projects", tags=["Admin — Projects"])


@router.get(
    "",
    response_model=PagedResponse[ApplicationResponse],
    summary="[Admin] List all projects across all organizations",
)
async def list_projects(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    org_id: uuid.UUID | None = Query(default=None),
    environment: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
    _=Depends(require_permissions(["projects.read"])),
    db: AsyncSession = Depends(get_db),
) -> PagedResponse[ApplicationResponse]:
    stmt = select(Application)
    if org_id:
        stmt = stmt.where(Application.organization_id == org_id)
    if environment:
        stmt = stmt.where(Application.environment == environment)
    if status_filter:
        stmt = stmt.where(Application.status == status_filter)
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
    summary="[Admin] Create a new project in any organization",
)
async def create_project(
    org_id: uuid.UUID,
    schema: ApplicationCreate,
    _=Depends(require_permissions(["projects.write"])),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    # Check if organization exists
    org = (await db.execute(select(Organization).where(Organization.id == org_id))).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    app = Application(
        organization_id=org_id,
        name=schema.name,
        environment=schema.environment,
        status="active",
        description=schema.description,
        allowed_origins=schema.allowed_origins or [],
        allowed_domains=schema.allowed_domains or [],
        webhook_url=schema.webhook_url,
        rate_limit=schema.rate_limit,
    )
    db.add(app)
    await db.flush()
    await db.refresh(app)
    return ApplicationResponse.model_validate(app)


@router.get(
    "/{project_id}",
    response_model=ApplicationResponse,
    summary="[Admin] Retrieve a project by ID",
)
async def get_project(
    project_id: uuid.UUID,
    _=Depends(require_permissions(["projects.read"])),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    app = (await db.execute(select(Application).where(Application.id == project_id))).scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ApplicationResponse.model_validate(app)


@router.patch(
    "/{project_id}",
    response_model=ApplicationResponse,
    summary="[Admin] Suspend, archive, or edit a project",
)
async def update_project(
    project_id: uuid.UUID,
    schema: ApplicationUpdate,
    _=Depends(require_permissions(["projects.write"])),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    app = (await db.execute(select(Application).where(Application.id == project_id))).scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    for field, val in schema.model_dump(exclude_unset=True).items():
        setattr(app, field, val)

    await db.flush()
    await db.refresh(app)
    return ApplicationResponse.model_validate(app)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_200_OK,
    summary="[Admin] Delete a project",
)
async def delete_project(
    project_id: uuid.UUID,
    _=Depends(require_permissions(["projects.write"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    app = (await db.execute(select(Application).where(Application.id == project_id))).scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    await db.delete(app)
    await db.flush()
    return {"deleted": True, "project_id": str(project_id)}
