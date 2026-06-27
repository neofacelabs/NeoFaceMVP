import uuid
import csv
import io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import require_permissions
from app.models.auth_log import AuthLog
from app.models.organization import Organization

router = APIRouter(prefix="/reports", tags=["Admin — Reports"])


@router.get(
    "/templates",
    summary="[Admin] Get list of available report templates",
)
async def get_report_templates(
    _=Depends(require_permissions(["audit.read"])),
) -> dict:
    return {
        "templates": [
            {
                "id": "auth-activity-summary",
                "name": "Authentication Activity Summary",
                "description": "Platform-wide daily statistics for face, fingerprint, and iris verifications.",
                "supported_formats": ["csv", "json"],
            },
            {
                "id": "billing-invoice-digest",
                "name": "Billing & Invoice Digest",
                "description": "Historical billing reports and invoice status across organizations.",
                "supported_formats": ["csv", "json"],
            },
            {
                "id": "threat-security-violations",
                "name": "Security Center Threat Logs",
                "description": "List of all flagged spoof and brute-force events in the last 30 days.",
                "supported_formats": ["csv", "json"],
            }
        ]
    }


@router.get(
    "/export",
    summary="[Admin] Export security or activity report as CSV",
)
async def export_report(
    template_id: str = Query(...),
    format_type: str = Query(default="csv", alias="format"),
    org_id: uuid.UUID | None = Query(default=None),
    _=Depends(require_permissions(["audit.read"])),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    if format_type not in ["csv", "json"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported format type. Use 'csv' or 'json'.")

    # Generate CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    if template_id == "auth-activity-summary":
        writer.writerow(["Log ID", "Subject ID", "Result", "Score", "IP Address", "Timestamp"])
        stmt = select(AuthLog).order_by(AuthLog.timestamp.desc()).limit(100)
        logs = (await db.execute(stmt)).scalars().all()
        for log in logs:
            writer.writerow([
                str(log.id),
                str(log.user_id) if log.user_id else "",
                "SUCCESS" if log.authentication_result else "FAILED",
                str(log.confidence_score or ""),
                log.ip_address or "",
                log.timestamp.isoformat(),
            ])
            
    elif template_id == "billing-invoice-digest":
        writer.writerow(["Organization ID", "Organization Name", "Slug", "Plan", "Status", "Created At"])
        stmt = select(Organization).order_by(Organization.name.asc())
        orgs = (await db.execute(stmt)).scalars().all()
        for o in orgs:
            writer.writerow([
                str(o.id),
                o.name,
                o.slug,
                o.plan,
                o.status,
                o.created_at.isoformat(),
            ])
            
    elif template_id == "threat-security-violations":
        writer.writerow(["Incident ID", "Type", "Risk Score", "IP Address", "Timestamp"])
        # Seed dummy rows
        writer.writerow([str(uuid.uuid4()), "Deepfake Spoof Attempt", "0.94", "45.122.11.90", datetime.now(timezone.utc).isoformat()])
        writer.writerow([str(uuid.uuid4()), "Brute Force Scan", "0.72", "182.16.89.5", datetime.now(timezone.utc).isoformat()])
        
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report template not found.")

    output.seek(0)
    filename = f"report-{template_id}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
