import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.org_membership import OrgMembership

async def main():
    db = AsyncSessionLocal()
    try:
        res = await db.execute(select(User).where(User.email == "orgadmin@neoface.io"))
        user = res.scalar_one_or_none()
        if not user:
            print("User not found")
            return
        print(f"User email: {user.email}, ID: {user.id}")
        
        res = await db.execute(select(OrgMembership).where(OrgMembership.user_id == user.id))
        memberships = res.scalars().all()
        print(f"Found {len(memberships)} memberships:")
        for m in memberships:
            print(f" - Org ID: {m.organization_id}, Role: {m.role}")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(main())
