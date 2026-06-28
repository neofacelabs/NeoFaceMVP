"""
NeoFace Database Configuration
Firebase Firestore AsyncClient backend (replaces PostgreSQL/Supabase).
"""

from __future__ import annotations

import json
import threading
from typing import Any

from google.cloud.firestore import AsyncClient
from google.cloud.firestore_v1.async_aggregation import AsyncAggregationQuery
import firebase_admin
from firebase_admin import credentials

from app.core.config import settings
from app.core.logging import logger

_init_lock = threading.Lock()
_firestore_client: AsyncClient | None = None

# Monkeypatch AsyncAggregationQuery to support backward compatibility with count().get()
_original_get = AsyncAggregationQuery.get
async def _patched_get(self, *args, **kwargs):
    res = await _original_get(self, *args, **kwargs)
    if res and isinstance(res, list) and isinstance(res[0], list):
        return res[0]
    return res
AsyncAggregationQuery.get = _patched_get


def _get_firestore_client() -> AsyncClient:
    """Initialize and return the Firestore AsyncClient singleton."""
    global _firestore_client

    if _firestore_client is not None:
        return _firestore_client

    with _init_lock:
        if _firestore_client is not None:
            return _firestore_client

        if not settings.FIREBASE_CREDENTIALS_JSON:
            logger.error("database.firestore: FIREBASE_CREDENTIALS_JSON is not configured.")
            raise ValueError("FIREBASE_CREDENTIALS_JSON environment variable is missing.")

        try:
            cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
            if "private_key" in cred_dict:
                cred_dict["private_key"] = cred_dict["private_key"].replace("\\n", "\n")
            
            # Initialize firebase-admin if not already done
            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("database.firestore: Firebase Admin SDK initialized successfully")

            # Create the AsyncClient directly from service account credentials
            _firestore_client = AsyncClient.from_service_account_info(cred_dict)
            logger.info("database.firestore: Firestore AsyncClient initialized successfully")
            return _firestore_client
        except Exception as exc:
            logger.error(f"database.firestore: Failed to initialize Firestore AsyncClient: {exc}")
            raise exc


# Mock engine for dependency injection/lifecycles compatibility
class MockEngine:
    def begin(self):
        class MockConnContext:
            async def __aenter__(self):
                class MockConn:
                    async def execute(self, *args, **kwargs):
                        return None
                    async def run_sync(self, *args, **kwargs):
                        return None
                return MockConn()
            async def __aexit__(self, exc_type, exc_val, exc_tb):
                pass
        return MockConnContext()
    
    async def dispose(self):
        pass

engine: Any = MockEngine()

from collections import defaultdict

class MockMetadata:
    schema: Any = None
    tables: dict = {}
    naming_convention: dict = {}
    _fk_memos: dict = defaultdict(list)
    def _add_table(self, *args, **kwargs):
        pass
    def _remove_table(self, *args, **kwargs):
        pass

class Base:
    metadata: Any = MockMetadata()
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self) -> dict[str, Any]:
        import uuid
        res = {}
        for k, v in self.__dict__.items():
            if k.startswith("_") or callable(v):
                continue
            if isinstance(v, uuid.UUID):
                res[k] = str(v)
            else:
                res[k] = v
        return res


async def get_db() -> AsyncGenerator[AsyncClient, None]:
    """
    FastAPI dependency — yields the Firestore AsyncClient.
    """
    client = _get_firestore_client()
    yield client


# Lifecycle helpers to prevent main.py startup/shutdown errors
async def init_db() -> None:
    """Verify Firestore connection is active."""
    try:

        client = _get_firestore_client()
        # Verify connection by querying collections async generator
        async for _ in client.collections():
            break
        logger.info("database: Firestore connection verified (healthy)")
    except Exception as exc:
        logger.error(f"database: Firestore verification failed: {exc}")
        if settings.ENVIRONMENT in ("production", "staging"):
            raise exc


async def close_db() -> None:
    """Close the Firestore client session."""
    global _firestore_client
    if _firestore_client is not None:
        await _firestore_client.close()
        _firestore_client = None
        logger.info("database: Firestore connection closed")


async def check_db_health() -> bool:
    """Check Firestore health."""
    try:
        client = _get_firestore_client()
        # Try a quick call to check connection
        async for _ in client.collections():
            break
        return True
    except Exception:
        return False
