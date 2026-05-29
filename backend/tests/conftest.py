import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

os.environ.setdefault("DATABASE_URL", os.environ.get("TEST_DATABASE_URL", "postgresql+psycopg://odonto:odonto@localhost:5432/odonto_test"))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app

TEST_DB_URL = os.environ.get("TEST_DATABASE_URL", "postgresql+psycopg://odonto:odonto@localhost:5432/odonto_test")
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False} if TEST_DB_URL.startswith("sqlite") else {},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session() -> Session:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session: Session) -> TestClient:
    app = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)
