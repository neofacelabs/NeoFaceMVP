import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import require_permissions
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter(prefix="/audit-logs", tags=["Admin — Audit Logs"])


@router.get(
    "",
    summary="[Admin] Query platform immutable audit logs",
)
async def query_audit_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    search: str | None = Query(default=None),
    _=Depends(require_permissions(["audit.read"])),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(AuditLog)
    if search:
        stmt = stmt.where(AuditLog.action.ilike(f"%{search}%") | AuditLog.ip_address.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = stmt.order_by(AuditLog.timestamp.desc()).offset((page - 1) * page_size).limit(page_size)
    logs = (await db.execute(stmt)).scalars().all()

    items = []
    for log in logs:
        # Resolve actor name
        actor_name = "System"
        actor_email = "system@neoface.io"
        if log.actor_id:
            user = (await db.execute(select(User).where(User.id == log.actor_id))).scalar_one_or_none()
            if user:
                actor_name = user.name
                actor_email = user.email

        items.append({
            "id": str(log.id),
            "actor_name": actor_name,
            "actor_email": actor_email,
            "action": log.action,
            "ip_address": log.ip_address or "127.0.0.1",
            "timestamp": log.timestamp.isoformat(),
            "details": log.details or {},
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items
    }
