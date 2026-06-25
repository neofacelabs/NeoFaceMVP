"""
NeoFace AaaS — Waitlist Router
POST /api/v1/waitlist
"""

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.waitlist_entry import WaitlistEntry

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])


class WaitlistCreate(BaseModel):
    email: EmailStr = Field(..., examples=["user@company.com"])
    feature: str = Field(..., min_length=1, max_length=100)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Join waitlist for a coming-soon feature",
)
async def join_waitlist(
    schema: WaitlistCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    entry = WaitlistEntry(
        email=schema.email,
        feature=schema.feature,
    )
    db.add(entry)
    await db.flush()
    return {"success": True, "email": entry.email, "feature": entry.feature}
