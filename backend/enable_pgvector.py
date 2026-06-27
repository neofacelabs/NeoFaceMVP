import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def main():
    db = AsyncSessionLocal()
    try:
        print("Attempting to run CREATE EXTENSION IF NOT EXISTS vector;")
        await db.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await db.commit()
        print("Extension created successfully!")
    except Exception as e:
        print(f"Failed to create extension: {e}")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(main())
