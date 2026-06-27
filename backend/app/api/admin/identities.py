import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import require_permissions
from app.models.identity import Identity
from app.models.face_embedding import FaceEmbedding
from app.repositories.identity_repository import IdentityRepository
from app.schemas.aaas import IdentityResponse, PagedResponse

router = APIRouter(prefix="/identities", tags=["Admin — Identities"])


@router.get(
    "",
    response_model=PagedResponse[IdentityResponse],
    summary="[Admin] List all identities across all organizations",
)
async def list_identities(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    org_id: uuid.UUID | None = Query(default=None),
    app_id: uuid.UUID | None = Query(default=None),
    enrollment_status: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    identity_type: str | None = Query(default=None),
    search: str | None = Query(default=None),
    _=Depends(require_permissions(["identities.read"])),
    db: AsyncSession = Depends(get_db),
) -> PagedResponse[IdentityResponse]:
    repo = IdentityRepository(db)
    identities, total = await repo.list_all(
        page=page,
        page_size=page_size,
        org_id=org_id,
        app_id=app_id,
        enrollment_status=enrollment_status,
        status=status_filter,
        identity_type=identity_type,
        search=search,
    )
    items = [IdentityResponse.model_validate(i) for i in identities]
    return PagedResponse(total=total, page=page, page_size=page_size, items=items)


@router.get(
    "/{identity_id}",
    response_model=IdentityResponse,
    summary="[Admin] Retrieve an identity by ID",
)
async def get_identity(
    identity_id: uuid.UUID,
    _=Depends(require_permissions(["identities.read"])),
    db: AsyncSession = Depends(get_db),
) -> IdentityResponse:
    identity = (await db.execute(select(Identity).where(Identity.id == identity_id))).scalar_one_or_none()
    if not identity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Identity not found")
    return IdentityResponse.model_validate(identity)


@router.patch(
    "/{identity_id}",
    response_model=IdentityResponse,
    summary="[Admin] Update identity status (suspend, archive, restore)",
)
async def update_identity(
    identity_id: uuid.UUID,
    payload: dict,
    _=Depends(require_permissions(["identities.write"])),
    db: AsyncSession = Depends(get_db),
) -> IdentityResponse:
    identity = (await db.execute(select(Identity).where(Identity.id == identity_id))).scalar_one_or_none()
    if not identity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Identity not found")

    if "status" in payload:
        identity.status = payload["status"]
    if "identity_type" in payload:
        identity.identity_type = payload["identity_type"]
    if "site" in payload:
        identity.site = payload["site"]
    if "metadata_fields" in payload:
        identity.metadata_fields = payload["metadata_fields"]

    await db.flush()
    await db.refresh(identity)
    return IdentityResponse.model_validate(identity)


@router.post(
    "/{identity_id}/reset-biometrics",
    response_model=IdentityResponse,
    summary="[Admin] Reset biometrics for an identity (removes face embedding)",
)
async def reset_biometrics(
    identity_id: uuid.UUID,
    _=Depends(require_permissions(["identities.write"])),
    db: AsyncSession = Depends(get_db),
) -> IdentityResponse:
    identity = (await db.execute(select(Identity).where(Identity.id == identity_id))).scalar_one_or_none()
    if not identity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Identity not found")

    if identity.face_embedding_id:
        emb = (await db.execute(select(FaceEmbedding).where(FaceEmbedding.id == identity.face_embedding_id))).scalar_one_or_none()
        if emb:
            await db.delete(emb)
        identity.face_embedding_id = None
        identity.enrollment_status = "pending"
        identity.is_fingerprint_enrolled = False
        identity.is_iris_enrolled = False
        
    await db.flush()
    await db.refresh(identity)
    return IdentityResponse.model_validate(identity)


@router.delete(
    "/{identity_id}",
    status_code=status.HTTP_200_OK,
    summary="[Admin] Purge an identity",
)
async def delete_identity(
    identity_id: uuid.UUID,
    _=Depends(require_permissions(["identities.write"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    repo = IdentityRepository(db)
    deleted = await repo.delete(identity_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Identity not found")
    return {"deleted": True, "identity_id": str(identity_id)}
