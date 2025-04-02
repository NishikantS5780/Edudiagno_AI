
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db
from models.models import User
from utils.auth import get_password_hash

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def test_db():
    # Create the database and tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop the database after the test
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(test_db):
    # Create a test client for the app
    with TestClient(app) as c:
        yield c

@pytest.fixture
def create_test_user(test_db):
    # Create a test user
    db = TestingSessionLocal()
    hashed_password = get_password_hash("testpassword")
    db_user = User(
        email="test@example.com",
        password_hash=hashed_password,
        first_name="Test",
        last_name="User",
        company_name="Test Company"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def test_register(client):
    response = client.post(
        "/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword",
            "first_name": "New",
            "last_name": "User",
            "company_name": "New Company"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "password_hash" not in data

def test_login(client, create_test_user):
    response = client.post(
        "/login",
        data={
            "username": "test@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, create_test_user):
    response = client.post(
        "/login",
        data={
            "username": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
