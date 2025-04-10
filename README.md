# Status Page App - Backend

This is the backend API for the Status Page application built with FastAPI.

## Features

- User Authentication with JWT
- Organization and Team Management
- Service Status Management
- Incident and Maintenance Management
- Real-time WebSocket Updates
- Public Status Page API

## Requirements

- Python 3.10+
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- WebSockets

## Setup and Installation

### Local Development

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env` file
5. Run the application:
   ```
   uvicorn app.main:app --reload
   ```
6. Initialize the database with first superuser:
   ```
   python -m app.db.init_db
   ```

### Using Docker

1. Build and start the containers:
   ```
   docker-compose up -d
   ```
2. The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   ├── core/             # Core functionality and config
│   ├── db/               # Database models and session
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── websockets/       # WebSocket functionality
│   └── main.py           # FastAPI application
├── tests/                # Test cases
├── .env                  # Environment variables
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── requirements.txt      # Python dependencies
```

## Authentication

The API uses JWT tokens for authentication. To authenticate:

1. Create a user account or use the default superuser
2. Get an access token from `/api/v1/auth/login`
3. Include the token in the Authorization header for subsequent requests: `Authorization: Bearer <token>`
