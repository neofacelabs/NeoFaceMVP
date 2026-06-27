import asyncio
import numpy as np
from sqlalchemy import select, text
from app.core.database import AsyncSessionLocal
from app.models.face_embedding import FaceEmbedding
from app.models.user import User

async def main():
    db = AsyncSessionLocal()
    try:
        # Get the enrolled user's embedding
        res = await db.execute(select(FaceEmbedding).join(FaceEmbedding.user).where(User.email == "member@neoface.io"))
        emb = res.scalar_one_or_none()
        if not emb:
            print("Embedding not found.")
            return
            
        query_vector = emb.embedding_vector
        print(f"Query vector length: {len(query_vector)}")
        
        # Test query 1: pgvector method
        stmt = (
            select(
                FaceEmbedding,
                text("1.0 - (CAST(face_embeddings.embedding_vector AS vector) <=> CAST(:query_vector AS vector)) AS similarity")
            )
            .join(FaceEmbedding.user)
            .order_by(text("CAST(face_embeddings.embedding_vector AS vector) <=> CAST(:query_vector AS vector)"))
            .params(query_vector=str(query_vector))
            .limit(1)
        )
        res = await db.execute(stmt)
        rows = res.all()
        print(f"Query returned {len(rows)} rows.")
        for row in rows:
            print(f"Matched User ID: {row[0].user_id}, Similarity: {row[1]}")
            
    except Exception as e:
        print(f"Error during query: {e}")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(main())
