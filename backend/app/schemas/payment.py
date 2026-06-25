"""
NeoFace Payment Schemas
Pydantic v2 models for payment authorization request/response.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Merchant schemas ───────────────────────────────────────────────────────────

class MerchantCreate(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=255)
    business_email: str = Field(..., max_length=320)
    business_category: str | None = None
    website_url: str | None = None
    description: str | None = None
    default_currency: str = Field(default="USD", min_length=3, max_length=3)


class MerchantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    business_name: str
    business_email: str
    business_category: str | None
    website_url: str | None
    is_verified: bool
    is_active: bool
    is_sandbox: bool
    default_currency: str
    api_key_prefix: str | None
    created_at: datetime
