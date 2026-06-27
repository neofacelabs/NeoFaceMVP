import uuid
import csv
import io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.api_key_auth import OrgContext, get_org_context
from app.models.identity import Identity
from app.models.device import Device
from app.models.auth_session import AuthenticationSession

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get(
    "/templates",
    summary="Get list of available report templates",
)
async def get_report_templates(
    ctx: OrgContext = Depends(get_org_context),
) -> dict:
    return {
        "templates": [
            {
                "id": "auth-activity-summary",
                "name": "Authentication Activity Summary",
                "description": "Daily statistics for biometric verifications within your organization.",
                "supported_formats": ["csv"],
            },
            {
                "id": "identities-list",
                "name": "Identities Directory",
                "description": "List of all enrolled identities with type and site affiliations.",
                "supported_formats": ["csv"],
            },
            {
                "id": "devices-list",
                "name": "Hardware Device Inventory",
                "description": "Inventory list of all edge camera nodes and fingerprint readers.",
                "supported_formats": ["csv"],
            }
        ]
    }


@router.get(
    "/export",
    summary="Export report as CSV",
)
async def export_report(
    template_id: str = Query(...),
    ctx: OrgContext = Depends(get_org_context),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    # Generate CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    if template_id == "auth-activity-summary":
        writer.writerow(["Session ID", "Identity ID", "Status", "Auth Method", "IP Address", "Timestamp"])
        stmt = select(AuthenticationSession).where(AuthenticationSession.organization_id == ctx.org_id).order_by(AuthenticationSession.created_at.desc()).limit(200)
        sessions = (await db.execute(stmt)).scalars().all()
        for s in sessions:
            writer.writerow([
                str(s.id),
                str(s.identity_id) if s.identity_id else "",
                s.status,
                s.auth_method or "face",
                s.ip_address or "",
                s.created_at.isoformat() if s.created_at else "",
            ])
            
    elif template_id == "identities-list":
        writer.writerow(["Identity ID", "External User ID", "Type", "Status", "Site ID", "Created At"])
        stmt = select(Identity).where(Identity.organization_id == ctx.org_id).order_by(Identity.created_at.desc())
        idents = (await db.execute(stmt)).scalars().all()
        for i in idents:
            writer.writerow([
                str(i.id),
                i.external_user_id,
                i.identity_type,
                i.status,
                str(i.site_id) if i.site_id else "",
                i.created_at.isoformat() if i.created_at else "",
            ])
            
    elif template_id == "devices-list":
        writer.writerow(["Device ID", "Name", "Type", "Status", "IP Address", "Firmware", "Site ID"])
        stmt = select(Device).where(Device.organization_id == ctx.org_id).order_by(Device.created_at.desc())
        devs = (await db.execute(stmt)).scalars().all()
        for d in devs:
            writer.writerow([
                str(d.id),
                d.name,
                d.type,
                d.status,
                d.ip_address or "",
                d.firmware_version or "",
                str(d.site_id) if d.site_id else "",
            ])
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report template not found")

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=report_{template_id}.csv"},
    )
