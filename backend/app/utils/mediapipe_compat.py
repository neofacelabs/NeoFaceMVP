"""
NeoFace — MediaPipe Compatibility Shim
Provides a unified import surface for both:
  - mediapipe 0.10.x with mp.solutions (pre-0.10.15)
  - mediapipe 0.10.15+ where mp.solutions was removed (Tasks API)

Usage:
    from app.utils.mediapipe_compat import get_face_mesh

    face_mesh = get_face_mesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
    )
    # Use face_mesh exactly as before
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

_HAS_SOLUTIONS = False
_face_mesh_cls = None


def _try_load_solutions():
    """Try to load mp.solutions.face_mesh (mediapipe <= 0.10.14)."""
    global _HAS_SOLUTIONS, _face_mesh_cls
    try:
        import mediapipe as mp
        # This attribute exists in mediapipe <= 0.10.14
        _ = mp.solutions.face_mesh.FaceMesh
        _face_mesh_cls = mp.solutions.face_mesh.FaceMesh
        _HAS_SOLUTIONS = True
        logger.debug("mediapipe: using legacy mp.solutions.face_mesh API")
    except AttributeError:
        _HAS_SOLUTIONS = False
        logger.warning(
            "mediapipe: mp.solutions not available (version >= 0.10.15). "
            "FaceMesh will use heuristic fallback. "
            "Pin mediapipe==0.10.14 for full functionality."
        )


_try_load_solutions()


class _DummyFaceMesh:
    """
    No-op FaceMesh for environments where mp.solutions is unavailable.
    Returns no landmarks — services gracefully degrade to heuristic fallbacks.
    """

    class _Result:
        multi_face_landmarks = None

    def __init__(self, **kwargs):
        pass

    def process(self, image):
        return self._Result()

    def close(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


def get_face_mesh(**kwargs) -> object:
    """
    Return a FaceMesh instance compatible with mp.solutions.face_mesh.FaceMesh.

    Args:
        **kwargs: Forwarded to FaceMesh constructor
                  (static_image_mode, max_num_faces, refine_landmarks,
                   min_detection_confidence, min_tracking_confidence)

    Returns:
        FaceMesh instance (real or no-op dummy)
    """
    if _HAS_SOLUTIONS and _face_mesh_cls is not None:
        return _face_mesh_cls(**kwargs)
    return _DummyFaceMesh(**kwargs)


def has_solutions() -> bool:
    """Returns True if mp.solutions is available."""
    return _HAS_SOLUTIONS
