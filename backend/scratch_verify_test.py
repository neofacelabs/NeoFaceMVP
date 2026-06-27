import asyncio
import numpy as np
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.face_embedding import FaceEmbedding
from app.models.user import User
from app.services.face_embedding import FaceEmbeddingService
from app.services.face_detector import FaceDetectorService

async def main():
    db = AsyncSessionLocal()
    try:
        # Get the enrolled user
        res = await db.execute(select(User).where(User.email == "member@neoface.io"))
        user = res.scalar_one_or_none()
        if not user:
            print("User member@neoface.io not found.")
            return
            
        print(f"User found: {user.name}, Enrolled: {user.is_enrolled}")
        
        # Get their embedding
        res = await db.execute(select(FaceEmbedding).where(FaceEmbedding.user_id == user.id))
        embeddings = res.scalars().all()
        print(f"Number of embeddings in DB: {len(embeddings)}")
        if not embeddings:
            return
            
        emb = embeddings[0]
        db_vector = np.array(emb.embedding_vector, dtype=np.float32)
        print(f"Stored DB vector norm: {np.linalg.norm(db_vector)}")
        
        # Now, if we have source_image_bytes, let's detect and verify it!
        if emb.source_image_bytes:
            print("Running face detection on source_image_bytes...")
            detector = FaceDetectorService.get_instance()
            detector.initialize()
            det_result, face = detector.detect_single(emb.source_image_bytes)
            if not det_result.success or face is None:
                print(f"Detection failed on source image: {det_result.error}")
                return
            
            embedder = FaceEmbeddingService()
            query_vector = embedder.get_embedding(face)
            print(f"Query vector norm: {np.linalg.norm(query_vector)}")
            
            # Compute similarity
            similarity = float(np.dot(db_vector, query_vector))
            print(f"Python Dot Product Cosine Similarity: {similarity}")
            
            # Calibrate score
            calibrated = embedder.calibrate_similarity_score(similarity)
            print(f"Calibrated similarity score: {calibrated}%")
        else:
            print("No source image bytes stored.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(main())
