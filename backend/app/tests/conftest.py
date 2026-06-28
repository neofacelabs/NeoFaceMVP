"""
NeoFace Test Configuration
Pytest fixtures for async tests, test database, mock services, and test clients.
"""

import os
# Force single-threaded execution for numerical libraries to prevent segfaults on macOS/ARM
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import asyncio
import io
import sys
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

# Mock mediapipe submodules to prevent Python 3.14 import failures
mock_mp = MagicMock()
sys.modules["mediapipe"] = mock_mp
sys.modules["mediapipe.solutions"] = mock_mp
sys.modules["mediapipe.solutions.face_mesh"] = mock_mp
sys.modules["mediapipe.solutions.drawing_utils"] = mock_mp
sys.modules["mediapipe.solutions.drawing_styles"] = mock_mp

import numpy as np
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
import json

from app.core.database import Base, get_db
from app.core.security import JWTHandler, PasswordHasher
from app.main import app
from app.models.user import User
from app.models.face_embedding import FaceEmbedding
from app.models.auth_log import AuthLog
from app.services.face_detector import DetectedFace, DetectionResult, FaceDetectorService
from app.services.liveness_service import LivenessCheckResult, LivenessService

# ── Mock Firestore client ─────────────────────────────────────────────────────
class MockDocumentSnapshot:
    def __init__(self, id, data, reference=None):
        self.id = id
        self.exists = data is not None
        self._data = data
        self.reference = reference

    def to_dict(self):
        return self._data

class MockDocumentReference:
    def __init__(self, id, data_store, path):
        self.id = id
        self.data_store = data_store
        self.path = path

    async def get(self):
        data = self.data_store.get(self.path)
        return MockDocumentSnapshot(self.id, data, self)

    async def set(self, data):
        self.data_store.set(self.path, data)

    async def update(self, data):
        existing = self.data_store.get(self.path) or {}
        existing.update(data)
        self.data_store.set(self.path, existing)

    async def delete(self):
        self.data_store.delete(self.path)

class MockQuery:
    def __init__(self, col_path, data_store, filters=None, order_by_val=None, limit_val=None, offset_val=None):
        self.col_path = col_path
        self.data_store = data_store
        self.filters = filters or []
        self.order_by_val = order_by_val
        self.limit_val = limit_val
        self.offset_val = offset_val

    def where(self, field, op, val):
        new_filters = list(self.filters)
        new_filters.append((field, op, val))
        return MockQuery(self.col_path, self.data_store, new_filters, self.order_by_val, self.limit_val, self.offset_val)

    def order_by(self, field, direction=None):
        return MockQuery(self.col_path, self.data_store, self.filters, (field, direction), self.limit_val, self.offset_val)

    def limit(self, limit_val):
        return MockQuery(self.col_path, self.data_store, self.filters, self.order_by_val, limit_val, self.offset_val)

    def offset(self, offset_val):
        return MockQuery(self.col_path, self.data_store, self.filters, self.order_by_val, self.limit_val, offset_val)

    def count(self):
        class MockCountQuery:
            def __init__(self, query):
                self.query = query
            async def get(self):
                docs = await self.query.get()
                class MockCountResult:
                    def __init__(self, val):
                        self.value = val
                return [MockCountResult(len(docs))]
        return MockCountQuery(self)

    async def get(self):
        docs = self.data_store.get_all(self.col_path)
        filtered_docs = []
        for doc_id, data in docs.items():
            match = True
            for field, op, val in self.filters:
                actual_val = data.get(field)
                if op == "==":
                    if str(actual_val) != str(val): match = False
                elif op == "!=":
                    if str(actual_val) == str(val): match = False
                elif op == ">=":
                    if actual_val is None or actual_val < val: match = False
                elif op == "<=":
                    if actual_val is None or actual_val > val: match = False
                elif op == "<":
                    if actual_val is None or actual_val >= val: match = False
                elif op == "in":
                    if actual_val not in val: match = False
            if match:
                ref = MockDocumentReference(doc_id, self.data_store, f"{self.col_path}/{doc_id}")
                filtered_docs.append(MockDocumentSnapshot(doc_id, data, ref))
        
        if self.order_by_val:
            field, direction = self.order_by_val
            filtered_docs.sort(key=lambda x: x.to_dict().get(field) or "", reverse=(direction == "DESCENDING"))
        
        if self.offset_val:
            filtered_docs = filtered_docs[self.offset_val:]
        if self.limit_val:
            filtered_docs = filtered_docs[:self.limit_val]
        return filtered_docs

class MockCollectionReference:
    def __init__(self, path, data_store):
        self.path = path
        self.data_store = data_store

    def document(self, id):
        return MockDocumentReference(id, self.data_store, f"{self.path}/{id}")

    def where(self, field, op, val):
        return MockQuery(self.path, self.data_store).where(field, op, val)

    def order_by(self, field, direction=None):
        return MockQuery(self.path, self.data_store).order_by(field, direction)

    def limit(self, limit_val):
        return MockQuery(self.path, self.data_store).limit(limit_val)

    def offset(self, offset_val):
        return MockQuery(self.path, self.data_store).offset(offset_val)

    def count(self):
        return MockQuery(self.path, self.data_store).count()

    async def get(self):
        return await MockQuery(self.path, self.data_store).get()

class MockDataStore:
    def __init__(self):
        self.store = {}

    def get(self, path):
        return self.store.get(path)

    def set(self, path, data):
        self.store[path] = data

    def delete(self, path):
        self.store.pop(path, None)

    def get_all(self, col_path):
        prefix = f"{col_path}/"
        return {k.split("/")[-1]: v for k, v in self.store.items() if k.startswith(prefix)}

class MockFirestoreClient:
    def __init__(self):
        self.data_store = MockDataStore()

    def collection(self, path):
        return MockCollectionReference(path, self.data_store)

    async def collections(self):
        return []

    async def commit(self):
        pass

    async def rollback(self):
        pass

    def add(self, instance):
        pass

    async def flush(self):
        pass

    async def refresh(self, instance):
        pass

    async def close(self):
        pass


@pytest.fixture(scope="session")
def event_loop():
    """Create a single event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def db_session() -> MockFirestoreClient:
    """Provide a mock Firestore client for tests."""
    return MockFirestoreClient()


@pytest_asyncio.fixture
async def async_client(db_session: MockFirestoreClient, mock_face_detector) -> AsyncClient:
    """
    Async HTTP client with overridden database dependency and mocked face detector.
    Use this for API integration tests.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    from app.utils.dependencies import get_face_detector, get_storage
    app.dependency_overrides[get_face_detector] = lambda: mock_face_detector

    mock_storage = AsyncMock()
    mock_storage.save_face_image.return_value = "faces/test/image.jpg"
    mock_storage.delete_face_image.return_value = True
    app.dependency_overrides[get_storage] = lambda: mock_storage

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client

    app.dependency_overrides.clear()


# ── Mock AI services ──────────────────────────────────────────────────────────

def make_fake_embedding(seed: int = 42) -> np.ndarray:
    """Generate a deterministic fake 512-d embedding."""
    rng = np.random.RandomState(seed)
    emb = rng.randn(512).astype(np.float32)
    return emb / np.linalg.norm(emb)


def make_fake_detected_face(seed: int = 42) -> DetectedFace:
    """Create a fake DetectedFace with a real embedding."""
    return DetectedFace(
        bbox=(50, 50, 200, 200),
        landmarks=np.zeros((5, 2)),
        embedding=make_fake_embedding(seed),
        detection_score=0.98,
        quality_score=85.0,
        face_crop=np.zeros((112, 112, 3), dtype=np.uint8),
    )


def make_fake_detection_result(
    success: bool = True,
    face_count: int = 1,
    seed: int = 42,
) -> DetectionResult:
    """Create a fake DetectionResult."""
    faces = [make_fake_detected_face(seed)] if success and face_count == 1 else []
    return DetectionResult(
        success=success,
        face_count=face_count,
        faces=faces,
        image_width=640,
        image_height=480,
        blur_score=250.0,
    )


@pytest.fixture
def mock_face_detector():
    """Mock FaceDetectorService that returns successful detections."""
    mock = MagicMock(spec=FaceDetectorService)
    mock.detect_single.return_value = (
        make_fake_detection_result(success=True),
        make_fake_detected_face(),
    )
    mock.detect.return_value = make_fake_detection_result(success=True)
    mock._initialized = True
    return mock


@pytest.fixture
def mock_liveness_pass():
    """Mock LivenessService that always passes."""
    result = LivenessCheckResult(
        is_live=True,
        score=85.0,
        blink_detected=True,
        head_turn_detected=True,
        smile_detected=True,
        ear_value=0.25,
        mouth_ratio=0.15,
        yaw_angle=20.0,
        checks_passed=3,
    )
    mock = MagicMock(spec=LivenessService)
    mock.analyze.return_value = result
    return mock


@pytest.fixture
def mock_liveness_fail():
    """Mock LivenessService that always fails."""
    result = LivenessCheckResult(
        is_live=False,
        score=25.0,
        blink_detected=False,
        head_turn_detected=False,
        smile_detected=False,
        ear_value=0.30,
        mouth_ratio=0.05,
        yaw_angle=2.0,
        checks_passed=0,
        failure_reason="Blink not detected",
    )
    mock = MagicMock(spec=LivenessService)
    mock.analyze.return_value = result
    return mock


# ── Test data factories ────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def test_user(db_session: MockFirestoreClient) -> User:
    """Create a standard test user in the database."""
    uid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    user = User(
        id=uid,
        name="Test User",
        email="testuser@example.com",
        hashed_password=PasswordHasher.hash("TestPass123!"),
        role="user",
        is_active=True,
        is_enrolled=False,
        created_at=now,
        updated_at=now,
    )
    await db_session.collection("users").document(str(uid)).set(user.to_dict())
    return user


@pytest_asyncio.fixture
async def test_admin(db_session: MockFirestoreClient) -> User:
    """Create a test admin user in the database."""
    uid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    admin = User(
        id=uid,
        name="Test Admin",
        email="testadmin@example.com",
        hashed_password=PasswordHasher.hash("AdminPass123!"),
        role="admin",
        is_active=True,
        is_enrolled=False,
        created_at=now,
        updated_at=now,
    )
    await db_session.collection("users").document(str(uid)).set(admin.to_dict())
    return admin


@pytest_asyncio.fixture
async def enrolled_user(db_session: MockFirestoreClient) -> tuple[User, FaceEmbedding]:
    """Create a test user with a face embedding."""
    uid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    user = User(
        id=uid,
        name="Enrolled User",
        email="enrolled@example.com",
        hashed_password=PasswordHasher.hash("TestPass123!"),
        role="user",
        is_active=True,
        is_enrolled=True,
        created_at=now,
        updated_at=now,
    )
    await db_session.collection("users").document(str(uid)).set(user.to_dict())

    emb_id = uuid.uuid4()
    embedding = FaceEmbedding(
        id=emb_id,
        user_id=user.id,
        embedding_vector=make_fake_embedding(seed=99).tolist(),
        embedding_version="arcface_r100_v1",
        embedding_dimension=512,
        quality_score=85.0,
    )
    await db_session.collection("face_embeddings").document(str(emb_id)).set(embedding.to_dict())
    return user, embedding


def make_admin_token(user_id: str, email: str = "admin@test.com") -> str:
    """Generate a valid admin JWT for tests."""
    return JWTHandler.create_access_token(
        user_id=user_id, email=email, role="admin"
    )


def make_user_token(user_id: str, email: str = "user@test.com") -> str:
    """Generate a valid user JWT for tests."""
    return JWTHandler.create_access_token(
        user_id=user_id, email=email, role="user"
    )


def make_test_image_bytes() -> bytes:
    """Generate a minimal valid JPEG image for tests."""
    try:
        import cv2
        img = np.ones((224, 224, 3), dtype=np.uint8) * 128
        _, buffer = cv2.imencode(".jpg", img)
        return buffer.tobytes()
    except ImportError:
        # Fallback: tiny valid JPEG bytes
        return (
            b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
            b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
            b"\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
            b"\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\x1e"
            b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f"
            b"\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00"
            b"\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01"
            b"\x00\x00?\x00\xf5\x0a\xff\xd9"
        )
