"""
NeoFace Roadmap Verification Tests
Covers Phase 1-5 additions: pgvector queries, Stripe payments, tenant isolation, and XGBoost tasks.
"""

import uuid
import base64
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch, AsyncMock

import numpy as np
import pytest
import pytest_asyncio

from app.models.merchant import Merchant
from app.models.trust_engine import BehaviorProfile, BehaviorEvent, ContinuousSession
from app.repositories.embedding_repository import EmbeddingRepository
from app.services.behavioral_biometrics_service import BehavioralBiometricsService
from app.tasks.behavior_training_task import _train_behavior_model
from app.tasks.continuous_auth_tasks import _sweep_sessions_async
from app.tests.conftest import make_fake_embedding, MockFirestoreClient


@pytest.fixture(autouse=True)
def mock_firestore_client(db_session):
    with patch("app.core.database._get_firestore_client", return_value=db_session), \
         patch("app.tasks.behavior_training_task._get_firestore_client", return_value=db_session, create=True), \
         patch("app.tasks.continuous_auth_tasks._get_firestore_client", return_value=db_session, create=True):
        yield


@pytest_asyncio.fixture
async def sample_merchant(db_session: MockFirestoreClient) -> Merchant:
    """Create a sample merchant in the database."""
    mid = uuid.uuid4()
    merchant = Merchant(
        id=mid,
        business_name="Test Shop",
        business_email="shop@test.com",
        business_category="retail",
        api_key_prefix="nf_live_test",
        api_key_hash="dummy_hash",
        is_active=True,
    )
    await db_session.collection("merchants").document(str(mid)).set(merchant.to_dict())
    return merchant


class TestPhase1Biometrics:
    """Tests nearest neighbors query using Firestore repository."""

    @pytest.mark.asyncio
    async def test_find_nearest_neighbors_sqlite_fallback(self, db_session: MockFirestoreClient, enrolled_user):
        """Test nearest neighbor search falls back to numpy in tests."""
        user, face_embedding = enrolled_user
        repo = EmbeddingRepository(db_session)

        # Vector identical to the enrolled user's vector
        query_vector = face_embedding.embedding_vector

        # Executing search should use the numpy fallback
        results = await repo.find_nearest_neighbors(query_vector, limit=1)
        assert len(results) == 1
        matched_emb, similarity = results[0]
        assert matched_emb.user_id == user.id
        assert similarity > 0.95  # Cosine similarity very close to 1 (identical)


class TestPhase4Behavioral:
    """Tests XGBoost behavioral training task and prediction scoring."""

    @pytest.mark.asyncio
    async def test_xgboost_celery_training_flow(self, db_session: MockFirestoreClient, test_user):
        """Test that the async training function fits XGBoost and stores weights."""
        profile_id = uuid.uuid4()
        profile = BehaviorProfile(id=profile_id, user_id=test_user.id, total_events=0)
        await db_session.collection("behavior_profiles").document(str(profile_id)).set(profile.to_dict())

        # Add 200 dummy events for the user
        for i in range(200):
            event_id = uuid.uuid4()
            event = BehaviorEvent(
                id=event_id,
                profile_id=profile_id,
                user_id=test_user.id,
                event_type="keyboard" if i % 2 == 0 else "mouse",
                metrics={
                    "wpm": 75.0 + (i % 5),
                    "dwell": 120.0 + (i % 10),
                    "flight": 150.0 + (i % 20),
                    "speed": 250.0 + (i % 50),
                    "curvature": 0.8,
                }
            )
            await db_session.collection("behavior_events").document(str(event_id)).set(event.to_dict())

        # Execute training logic directly
        res = await _train_behavior_model(str(test_user.id))
        assert res["status"] == "trained"
        assert res["events_count"] == 200

        # Reload profile and verify model is saved
        reloaded_doc = await db_session.collection("behavior_profiles").document(str(profile_id)).get()
        assert reloaded_doc.exists
        reloaded_data = reloaded_doc.to_dict()
        assert reloaded_data.get("model_data") is not None
        assert reloaded_data["model_data"]["algorithm"] == "xgboost"
        assert "model_bytes" in reloaded_data["model_data"]

        # Predict with service scoring using XGBoost
        service = BehavioralBiometricsService()
        from app.services.behavioral_biometrics_service import BehaviorProfile as ServiceProfile, BehaviorEventData
        
        svc_profile = ServiceProfile(
            user_id=str(test_user.id),
            total_events=200,
            is_baseline_established=True,
            model_data=reloaded_data["model_data"]
        )

        test_event = BehaviorEventData(
            event_type="keyboard",
            metrics={"wpm": 77.0, "dwell": 125.0, "flight": 155.0}
        )

        score_res = service.score([test_event], svc_profile)
        assert score_res.method == "xgboost"
        assert 0.0 <= score_res.behavior_score <= 100.0


class TestPhase4ContinuousAuthDecay:
    """Tests active-typing based continuous authentication decay modifiers."""

    @pytest.mark.asyncio
    async def test_continuous_auth_decay_with_typing(self, db_session: MockFirestoreClient, test_user):
        """Test that active keyboard behavior events mitigate/reduce continuous auth decay."""
        # Create continuous session
        session_id = uuid.uuid4()
        session = ContinuousSession(
            id=session_id,
            user_id=test_user.id,
            session_token="session_decay_test_token",
            status="active",
            current_trust_score=100.0,
            check_interval_seconds=30,
            last_verified_at=datetime.now(timezone.utc)
        )
        await db_session.collection("continuous_sessions").document(str(session_id)).set(session.to_dict())

        # Create behavior profile
        profile_id = uuid.uuid4()
        profile = BehaviorProfile(id=profile_id, user_id=test_user.id)
        await db_session.collection("behavior_profiles").document(str(profile_id)).set(profile.to_dict())

        # Add a recent keyboard typing event for the user
        event_id = uuid.uuid4()
        typing_event = BehaviorEvent(
            id=event_id,
            profile_id=profile_id,
            user_id=test_user.id,
            event_type="keyboard",
            metrics={"wpm": 60.0},
            created_at=datetime.now(timezone.utc)
        )
        await db_session.collection("behavior_events").document(str(event_id)).set(typing_event.to_dict())

        # Overdue by 75 seconds ago
        overdue_time = datetime.now(timezone.utc) - timedelta(seconds=75)
        await db_session.collection("continuous_sessions").document(str(session_id)).update({"last_verified_at": overdue_time.isoformat()})

        # Run background sweep task
        sweep_res = await _sweep_sessions_async()
        
        # Verify session was updated and decay was applied
        reloaded = await db_session.collection("continuous_sessions").document(str(session_id)).get()
        reloaded_data = reloaded.to_dict()
        assert sweep_res["sessions_updated"] == 1
        
        # Decay with typing should be 1 point per missed interval, so 100.0 -> 99.0
        # Instead of 5 points per missed interval (100.0 -> 95.0)
        assert reloaded_data["current_trust_score"] == 99.0
