"""
NeoFace Dashboard API using Firebase Firestore.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from typing import Any

from fastapi import APIRouter, Depends, Query, HTTPException
from google.cloud.firestore import AsyncClient

from app.core.database import check_db_health, get_db
from app.core.security import get_current_user_token, TokenData, require_admin
from app.repositories.auth_log_repository import AuthLogRepository
from app.repositories.user_repository import UserRepository
from app.repositories.session_repository import SessionRepository
from app.repositories.usage_repository import UsageRepository
from app.schemas.verification import AuthLogListResponse, AuthLogResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


async def get_dashboard_context(
    token: TokenData = Depends(get_current_user_token),
    db: AsyncClient = Depends(get_db),
) -> dict:
    """
    Dependency that resolves whether the dashboard caller is admin
    or customer, and gets their org_id context.
    """
    if token.role == "admin":
        return {"is_admin": True, "org_id": None}
    
    from app.repositories.organization_repository import OrganizationRepository
    org_repo = OrganizationRepository(db)
    org = await org_repo.get_user_org(token.user_uuid)
    if not org:
        default_org = await org_repo.get_default()
        if not default_org:
            raise HTTPException(
                status_code=403,
                detail="No organization membership found",
            )
        org_id = default_org.id
    else:
        org_id = org.id
        
    return {"is_admin": False, "org_id": org_id}


@router.get(
    "/users",
    summary="User statistics",
)
async def get_user_stats(
    ctx: dict = Depends(get_dashboard_context),
    db: AsyncClient = Depends(get_db),
) -> dict:
    """
    Returns:
    - total_users: All registered users/identities
    - enrolled_users: Users with face embeddings
    - active_users: Non-deactivated users
    - enrollment_rate: % of users who are enrolled
    """
    is_admin = ctx["is_admin"]
    orgs_count = 0
    apps_count = 0
    if is_admin:
        user_repo = UserRepository(db)
        total = await user_repo.count_total()
        enrolled = await user_repo.count_enrolled()
        active = await user_repo.count_active()
        
        orgs_count = len(await db.collection("organizations").get())
        apps_count = len(await db.collection("applications").get())
    else:
        org_id = ctx["org_id"]
        col = db.collection("identities")
        total = len(await col.where("organization_id", "==", str(org_id)).get())
        enrolled = len(await col.where("organization_id", "==", str(org_id)).where("status", "==", "enrolled").get())
        active = len(await col.where("organization_id", "==", str(org_id)).where("status", "in", ["pending", "enrolled"]).get())

    result = {
        "total_users": total,
        "enrolled_users": enrolled,
        "active_users": active,
        "enrollment_rate": round((enrolled / total * 100) if total > 0 else 0.0, 2),
        "as_of": datetime.now(timezone.utc).isoformat(),
    }
    if is_admin:
        result["orgs_count"] = orgs_count
        result["apps_count"] = apps_count
    return result


@router.get(
    "/verifications",
    summary="Verification statistics",
)
async def get_verification_stats(
    ctx: dict = Depends(get_dashboard_context),
    db: AsyncClient = Depends(get_db),
) -> dict:
    is_admin = ctx["is_admin"]
    if is_admin:
        log_repo = AuthLogRepository(db)
        total = await log_repo.count_total()
        successful = await log_repo.count_successful()
    else:
        org_id = ctx["org_id"]
        col = db.collection("auth_sessions")
        total = len(await col.where("organization_id", "==", str(org_id)).get())
        successful = len(await col.where("organization_id", "==", str(org_id)).where("status", "==", "success").get())

    return {
        "total_verifications": total,
        "successful_verifications": successful,
        "failed_verifications": total - successful,
        "success_rate": round((successful / total * 100) if total > 0 else 0.0, 2),
        "as_of": datetime.now(timezone.utc).isoformat(),
    }


@router.get(
    "/success-rate",
    summary="Authentication success rate",
)
async def get_success_rate(
    ctx: dict = Depends(get_dashboard_context),
    db: AsyncClient = Depends(get_db),
) -> dict:
    is_admin = ctx["is_admin"]
    if is_admin:
        log_repo = AuthLogRepository(db)
        rate = await log_repo.get_success_rate()
    else:
        session_repo = SessionRepository(db)
        rate = await session_repo.get_success_rate_by_org(ctx["org_id"])

    return {
        "success_rate": rate,
        "unit": "percent",
        "as_of": datetime.now(timezone.utc).isoformat(),
    }


@router.get(
    "/logs",
    response_model=AuthLogListResponse,
    summary="Recent authentication logs",
)
async def get_recent_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    ctx: dict = Depends(get_dashboard_context),
    db: AsyncClient = Depends(get_db),
) -> AuthLogListResponse:
    is_admin = ctx["is_admin"]
    if is_admin:
        log_repo = AuthLogRepository(db)
        logs, total = await log_repo.get_recent(page=page, page_size=page_size)
        resp_logs = [AuthLogResponse.model_validate(log) for log in logs]
    else:
        session_repo = SessionRepository(db)
        sessions, total = await session_repo.list_by_org(ctx["org_id"], page=page, page_size=page_size)
        resp_logs = [
            AuthLogResponse(
                id=s.id,
                user_id=s.identity_id,
                confidence_score=s.confidence_score,
                liveness_score=100.0 - (s.risk_score or 0.0),
                authentication_result=s.status == "success",
                failure_reason="Liveness failed" if s.status == "failure" else None,
                ip_address=s.ip_address,
                timestamp=s.created_at,
            )
            for s in sessions
        ]

    return AuthLogListResponse(
        total=total,
        page=page,
        page_size=page_size,
        logs=resp_logs,
    )


@router.get(
    "/analytics",
    summary="Time-series analytics (enrollments/verifications per day)",
)
async def get_analytics(
    days: int = Query(default=7, ge=1, le=90, description="Number of days to include"),
    ctx: dict = Depends(get_dashboard_context),
    db: AsyncClient = Depends(get_db),
) -> dict:
    is_admin = ctx["is_admin"]
    if is_admin:
        log_repo = AuthLogRepository(db)
        daily_stats = await log_repo.get_daily_stats(days=days)
    else:
        usage_repo = UsageRepository(db)
        stats = await usage_repo.get_daily_stats(ctx["org_id"], days=days)
        daily_stats = [
            {
                "date": s["date"],
                "total": s["request_count"],
                "successful": s["success_count"],
            }
            for s in stats
        ]

    return {
        "period_days": days,
        "daily_stats": daily_stats,
        "as_of": datetime.now(timezone.utc).isoformat(),
    }


@router.get(
    "/payments/overview",
    summary="Payment transaction overview",
)
async def get_payment_overview(
    ctx: dict = Depends(get_dashboard_context),
    db: AsyncClient = Depends(get_db),
) -> dict:
    is_admin = ctx["is_admin"]
    if is_admin:
        docs = await db.collection("auth_sessions").get()
        total = len(docs)
        authorized = sum(1 for doc in docs if doc.to_dict().get("status") == "success")
        volume = 0.0
        auth_rate = round((authorized / total * 100) if total > 0 else 100.0, 2)
        
        modality_breakdown = {}
        for doc in docs:
            et = doc.to_dict().get("event_type")
            modality_breakdown[et] = modality_breakdown.get(et, 0) + 1
            
        latencies = [doc.to_dict().get("latency_ms") for doc in docs if doc.to_dict().get("latency_ms") is not None]
        avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0.0
        
        since_24h = datetime.now(timezone.utc) - timedelta(hours=24)
        threats = 0
        for doc in docs:
            data = doc.to_dict()
            if data.get("status") == "failure":
                created_at = data.get("created_at")
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                if created_at and created_at >= since_24h:
                    threats += 1
    else:
        session_repo = SessionRepository(db)
        org_id = ctx["org_id"]
        total = await session_repo.count_by_org(org_id)
        
        docs = await db.collection("auth_sessions").where("organization_id", "==", str(org_id)).get()
        successful = sum(1 for doc in docs if doc.to_dict().get("status") == "success")
        auth_rate = await session_repo.get_success_rate_by_org(org_id)
        
        modalities = {}
        for et in ["enrollment", "verification", "liveness", "authentication"]:
            modalities[et] = sum(1 for doc in docs if doc.to_dict().get("event_type") == et)
            
        authorized = successful
        volume = 0.0
        modality_breakdown = modalities
        
        avg_latency = await session_repo.get_avg_latency_by_org(org_id)
        
        since_24h = datetime.now(timezone.utc) - timedelta(hours=24)
        threats = 0
        for doc in docs:
            data = doc.to_dict()
            if data.get("status") == "failure":
                created_at = data.get("created_at")
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                if created_at and created_at >= since_24h:
                    threats += 1

    # Calculate service SLA dynamically
    sla_data = {}
    grouped = {}
    for doc in (docs if not is_admin else await db.collection("auth_sessions").get()):
        data = doc.to_dict()
        et = data.get("event_type")
        if et not in grouped:
            grouped[et] = []
        grouped[et].append(data)
    
    for et, logs in grouped.items():
        total_cnt = len(logs)
        success_cnt = sum(1 for l in logs if l.get("status") == "success")
        latencies = [l.get("latency_ms") for l in logs if l.get("latency_ms") is not None]
        avg_lat = round(sum(latencies) / len(latencies), 2) if latencies else 0.0
        success_rate = round((success_cnt / total_cnt * 100) if total_cnt > 0 else 100.0, 2)
        
        status_val = "operational"
        if total_cnt > 0:
            if success_rate < 80.0:
                status_val = "outage"
            elif success_rate < 95.0:
                status_val = "degraded"
        sla_data[et] = {
            "avg_latency": f"{int(avg_lat)}ms" if avg_lat > 0 else "N/A",
            "success_rate": f"{success_rate}%",
            "status": status_val
        }
        
    defaults = {
        "enrollment": {"avg_latency": "48ms", "success_rate": "100.0%", "status": "operational"},
        "verification": {"avg_latency": "61ms", "success_rate": "100.0%", "status": "operational"},
        "liveness": {"avg_latency": "112ms", "success_rate": "100.0%", "status": "operational"},
        "authentication": {"avg_latency": "22ms", "success_rate": "100.0%", "status": "operational"},
    }
    for et, val in sla_data.items():
        if et in defaults:
            defaults[et] = val

    # Calculate overall platform SLA (average success rate across all sessions)
    all_sessions = await db.collection("auth_sessions").get()
    session_total = len(all_sessions)
    if session_total > 0:
        session_success = sum(1 for doc in all_sessions if doc.to_dict().get("status") == "success")
        platform_sla = round((session_success / session_total) * 100, 2)
    else:
        platform_sla = 100.0

    return {
        "total_transactions": total,
        "authorized_transactions": authorized,
        "failed_transactions": total - authorized,
        "total_volume_usd": round(volume, 2),
        "authorization_rate": auth_rate,
        "modality_breakdown": modality_breakdown,
        "avg_latency": avg_latency,
        "threat_anomalies": threats,
        "service_sla": defaults,
        "platform_sla": platform_sla,
        "as_of": datetime.now(timezone.utc).isoformat(),
    }


@router.get(
    "/payments/daily",
    summary="Daily payment volume time-series",
)
async def get_payment_daily_stats(
    days: int = Query(default=14, ge=1, le=90),
    ctx: dict = Depends(get_dashboard_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    is_admin = ctx["is_admin"]
    since = datetime.now(timezone.utc).date() - timedelta(days=days)
    
    docs = await db.collection("auth_sessions").get()
    
    rows = []
    for doc in docs:
        data = doc.to_dict()
        if not is_admin and data.get("organization_id") != str(ctx["org_id"]):
            continue
        created_at = data.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        if created_at and created_at.date() >= since:
            rows.append({
                "date": created_at.date(),
                "event_type": data.get("event_type"),
                "status": data.get("status"),
            })
            
    daily_dict = {}
    for i in range(days + 1):
        d_str = str(since + timedelta(days=i))
        daily_dict[d_str] = {
            "date": d_str,
            "total_count": 0,
            "successful_count": 0,
            "volume": 0.0,
            "enrollment_count": 0,
            "verification_count": 0,
            "liveness_count": 0,
            "session_count": 0,
            "error_count": 0,
        }
        
    for row in rows:
        d_str = str(row["date"])
        if d_str not in daily_dict:
            daily_dict[d_str] = {
                "date": d_str,
                "total_count": 0,
                "successful_count": 0,
                "volume": 0.0,
                "enrollment_count": 0,
                "verification_count": 0,
                "liveness_count": 0,
                "session_count": 0,
                "error_count": 0,
            }
        
        daily_dict[d_str]["total_count"] += 1
        if row["status"] == "success":
            daily_dict[d_str]["successful_count"] += 1
        else:
            daily_dict[d_str]["error_count"] += 1
            
        et = row["event_type"]
        if et == "enrollment":
            daily_dict[d_str]["enrollment_count"] += 1
        elif et == "verification":
            daily_dict[d_str]["verification_count"] += 1
        elif et == "liveness":
            daily_dict[d_str]["liveness_count"] += 1
        elif et in ("authentication", "session"):
            daily_dict[d_str]["session_count"] += 1
            
    daily = sorted(list(daily_dict.values()), key=lambda x: x["date"])

    return {
        "period_days": days,
        "daily_stats": daily,
        "as_of": datetime.now(timezone.utc).isoformat(),
    }


@router.get(
    "/payments/recent",
    summary="Recent payment transactions live feed",
)
async def get_recent_payments(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    limit: int | None = Query(default=None),
    ctx: dict = Depends(get_dashboard_context),
    db: AsyncSession = Depends(get_db),
) -> dict:
    is_admin = ctx["is_admin"]
    actual_page_size = limit if limit is not None else page_size

    session_repo = SessionRepository(db)
    if is_admin:
        sessions, total = await session_repo.list_all(page=page, page_size=actual_page_size)
    else:
        sessions, total = await session_repo.list_by_org(ctx["org_id"], page=page, page_size=actual_page_size)

    resp_txns = []
    for s in sessions:
        resp_txns.append({
            "id": str(s.id),
            "user_id": str(s.identity_id) if s.identity_id else None,
            "amount": 0.0,
            "currency": "USD",
            "status": "authorized" if s.status == "success" else "failed",
            "modality": s.event_type,
            "device_trust_score": 100.0 - (s.risk_score or 0.0),
            "liveness_passed": s.status == "success",
            "authentication_result": s.status == "success",
            "created_at": s.created_at.isoformat() if isinstance(s.created_at, datetime) else s.created_at,
        })

    return {
        "total": total,
        "page": page,
        "page_size": actual_page_size,
        "transactions": resp_txns,
        "as_of": datetime.now(timezone.utc).isoformat(),
    }


@router.get(
    "/health",
    summary="System health check",
    include_in_schema=True,
)
async def health_check() -> dict:
    """
    Public health check endpoint.
    Used by Docker healthcheck, load balancers, and monitoring.
    """
    db_healthy = await check_db_health()

    return {
        "status": "healthy" if db_healthy else "degraded",
        "database": "ok" if db_healthy else "error",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get(
    "/organizations",
    summary="List all organizations (admin only)",
)
async def get_organizations(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    token_data: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    from app.repositories.organization_repository import OrganizationRepository
    
    org_repo = OrganizationRepository(db)
    orgs, total = await org_repo.list_all(page=page, page_size=page_size)
    
    result = []
    for org in orgs:
        apps_count = await org_repo.count_applications(org.id)
        identities_count = await org_repo.count_identities(org.id)
        
        # Calculate usage status: let's query AuthenticationSession count for this org
        total_sessions = len(await db.collection("auth_sessions").where("organization_id", "==", str(org.id)).get())
        
        result.append({
            "id": str(org.id),
            "name": org.name,
            "plan": org.plan,
            "slug": org.slug,
            "status": org.status,
            "apps": apps_count,
            "users": identities_count,
            "usage": f"{min(100, int(total_sessions / 100 * 100))}%" if total_sessions > 0 else "0%",
            "created_at": org.created_at.isoformat() if isinstance(org.created_at, datetime) else org.created_at
        })
        
    return {
        "organizations": result,
        "total": total
    }
