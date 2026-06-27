from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import TokenData, get_current_user_token
from app.models.user import User

def require_permissions(required_perms: list[str]):
    """
    FastAPI dependency factory: validates the authenticated user has all specified permissions.
    Wildcard permission '*' allows bypassing checks.
    """
    async def dependency(
        token_data: TokenData = Depends(get_current_user_token),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        from uuid import UUID
        user_uuid = UUID(token_data.user_id)
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
            
        user_perms = user.permissions
        
        # Check wildcard bypass
        if "*" in user_perms:
            return user
            
        # Check explicit permissions
        for perm in required_perms:
            if perm not in user_perms:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permission: {perm}",
                )
        return user
        
    return dependency
