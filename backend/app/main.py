from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.dentists import router as dentist_router
from app.api.routes.patients import router as patient_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models import appointment, schedule_slot, user  # noqa: F401


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    Base.metadata.create_all(bind=engine)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(auth_router, prefix=settings.api_v1_prefix)
    app.include_router(dentist_router, prefix=settings.api_v1_prefix)
    app.include_router(patient_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
