
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import jwt
from datetime import datetime, timedelta

from main import app
from database import Base, get_db
from models.models import User, Job
from utils.auth import get_password_hash, get_current_user
from config import settings

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

@pytest.fixture
def create_test_jobs(test_db, create_test_user):
    # Create test jobs
    db = TestingSessionLocal()
    test_jobs = [
        Job(
            title="Software Engineer",
            description="A software engineering position",
            department="Engineering",
            location="Remote",
            company_id=create_test_user.id
        ),
        Job(
            title="Product Manager",
            description="A product management position",
            department="Product",
            location="Hybrid",
            company_id=create_test_user.id
        )
    ]
    db.add_all(test_jobs)
    db.commit()
    for job in test_jobs:
        db.refresh(job)
    return test_jobs

@pytest.fixture
def auth_header(create_test_user):
    # Create a valid JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + access_token_expires
    to_encode = {"user_id": create_test_user.id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return {"Authorization": f"Bearer {encoded_jwt}"}

def test_create_job(client, auth_header):
    response = client.post(
        "/jobs/",
        json={
            "title": "New Job",
            "description": "A new job description",
            "department": "Marketing",
            "location": "On-site"
        },
        headers=auth_header
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Job"
    assert data["department"] == "Marketing"

def test_get_jobs(client, create_test_jobs, auth_header):
    response = client.get("/jobs/", headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Software Engineer"
    assert data[1]["title"] == "Product Manager"

def test_get_job(client, create_test_jobs, auth_header):
    job_id = create_test_jobs[0].id
    response = client.get(f"/jobs/{job_id}", headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Software Engineer"
    assert data["department"] == "Engineering"

def test_update_job(client, create_test_jobs, auth_header):
    job_id = create_test_jobs[0].id
    response = client.put(
        f"/jobs/{job_id}",
        json={
            "title": "Updated Job Title",
            "department": "Updated Department"
        },
        headers=auth_header
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Job Title"
    assert data["department"] == "Updated Department"
    assert data["location"] == "Remote"  # Unchanged field

def test_delete_job(client, create_test_jobs, auth_header):
    job_id = create_test_jobs[0].id
    response = client.delete(f"/jobs/{job_id}", headers=auth_header)
    assert response.status_code == 204
    
    # Verify the job is deleted
    response = client.get(f"/jobs/{job_id}", headers=auth_header)
    assert response.status_code == 404
