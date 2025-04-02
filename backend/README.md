# EduDiagnoAI Backend

This is the backend for EduDiagnoAI, an AI-powered interview platform.

## Setup

### Prerequisites

- Python 3.8 or higher
- PostgreSQL

### Environment Setup

1. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your configuration:
   - Set up a PostgreSQL database URL
   - Generate a secure random string for SECRET_KEY
   - Add your OpenAI API key

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE edudiagnoai;
```

2. Run database migrations:

```bash
alembic upgrade head
```

## Running the Application

Start the application with:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

The API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

- `main.py`: Main application file
- `config.py`: Application configuration
- `database.py`: Database connection setup
- `models/`: Database models
- `schemas/`: Pydantic models for validation
- `routers/`: API endpoints
- `utils/`: Utility functions
- `migrations/`: Alembic migrations

## Development

### Creating New Migrations

```bash
alembic revision --autogenerate -m "description of changes"
```

### Running Tests

```bash
pytest
```

## Working with Local File Storage

For development, files are stored locally in the `uploads` directory. The structure mirrors what would be found in S3:
- `uploads/videos/`: Video recordings
- `uploads/resumes/`: Candidate resumes

## Production Deployment

For production, you should:
1. Use a proper WSGI server like Gunicorn
2. Set up HTTPS with a proper certificate
3. Consider using a cloud storage solution like AWS S3 instead of local storage
4. Set up proper logging
5. Use environment variables for all sensitive information
