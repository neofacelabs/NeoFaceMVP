import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import TokenData, require_admin
from app.models.user import User
from app.models.org_membership import OrgMembership

async def test_user_role(db, email):
    res = await db.execute(select(User).where(User.email == email))
    user = res.scalar_one_or_none()
    if not user:
        print(f"User {email} not found.")
        return
        
    from datetime import datetime
    token_data = TokenData(
        user_id=str(user.id),
        email=user.email,
        role=user.role,
        exp=datetime.now()
    )
    
    try:
        res = await require_admin(token_data, db)
        print(f"✅ User {email} (role: {user.role}) ALLOWED access to Admin endpoints.")
    except Exception as e:
        print(f"❌ User {email} (role: {user.role}) DENIED access: {e}")

async def main():
    db = AsyncSessionLocal()
    try:
        await test_user_role(db, "admin@neoface.io")
        await test_user_role(db, "orgadmin@neoface.io")
        await test_user_role(db, "member@neoface.io")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(main())
