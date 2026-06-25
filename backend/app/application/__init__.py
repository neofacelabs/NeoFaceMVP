"""Application layer (use‑cases / services).

This layer contains pure business logic. It depends only on:
  * Abstract repository interfaces (defined in `app.application.interfaces`).
  * Domain entities (`app.models`).

It does NOT depend on FastAPI, SQLAlchemy, or any framework concerns.
"""
