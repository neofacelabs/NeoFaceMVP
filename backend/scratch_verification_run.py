import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.face_embedding import FaceEmbedding
from app.models.user import User
from app.services.verification_service import VerificationService
from app.utils.dependencies import get_face_detector, get_face_embedder, get_liveness_service

async def main():
    db = AsyncSessionLocal()
    try:
        # Get the enrolled user
        res = await db.execute(select(FaceEmbedding).join(FaceEmbedding.user).where(User.email == "member@neoface.io"))
        emb = res.scalar_one_or_none()
        if not emb:
            print("No embedding found in DB.")
            return
            
        print(f"Loaded embedding from user: {emb.user_id}")
        
        # Instantiate VerificationService
        detector = get_face_detector()
        embedder = get_face_embedder()
        liveness = get_liveness_service()
        
        v_service = VerificationService(
            db=db,
            detector=detector,
            embedder=embedder,
            liveness=liveness
        )
        
        # Verify the source image bytes
        print("Calling VerificationService.verify on stored source image bytes...")
        result = await v_service.verify(
            image_bytes=emb.source_image_bytes,
            threshold=0.65,
            skip_liveness=True,
            use_pipeline=False
        )
        print("Result:", result)
        print("Authenticated:", result.authenticated)
        print("Confidence:", result.confidence_score)
        print("Failure reason:", result.failure_reason)
        
    except Exception as e:
        print(f"Exception raised: {e}")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(main())
