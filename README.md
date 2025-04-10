# Status Page Application

A simplified version of a status page application similar to services like StatusPage, Cachet, Betterstack, or Openstatus. This application allows administrators to manage services and their statuses, and provides a public-facing page for users to view the current status of all services.

## Features

- **User Authentication**: Complete auth flow with login, registration, and password reset
- **Team Management**: Create and manage teams within your organization
- **Multi-tenant Organization**: Support for multiple organizations with isolated resources
- **Service Management**: CRUD operations for services with status tracking
- **Incident Management**: Create, update, and resolve incidents
- **Maintenance Scheduling**: Schedule and track maintenance events
- **Real-time Updates**: WebSocket connection for live status updates
- **Public Status Page**: Customizable public-facing status page

## Project Structure

```
/status-page-app
  /backend                 # FastAPI backend
    /app
      /api                 # API endpoints
      /core                # Core functionality
      /db                  # Database models
      /models              # SQLAlchemy models
      /schemas             # Pydantic schemas
      /services            # Business logic
      /utils               # Utilities
      /websockets          # WebSocket handlers
  /frontend                # React frontend
    /public                # Static files
    /src
      /assets              # Static assets
      /components          # React components
      /context             # Context providers
      /hooks               # Custom hooks
      /lib                 # Utility libraries
      /pages               # Page components
      /services            # API services
      /styles              # CSS and Tailwind
```

## Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation and settings management
- **JWT**: Authentication with JSON Web Tokens
- **WebSockets**: Real-time communication
- **MySQL**: Database

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Zustand**: State management
- **Tailwind CSS**: Utility-first CSS framework
- **HeadlessUI**: Unstyled, accessible UI components
- **Socket.IO**: WebSocket client for real-time updates
- **Vite**: Frontend build tool

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MySQL (v8+)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env` file

5. Initialize the database:
   ```bash
   python -m app.db.init_db
   ```

6. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env` file

4. Run the development server:
   ```bash
   npm run dev
   ```

## Using Docker
Alternatively, you can use Docker Compose to run both the backend and frontend:

```bash
docker-compose up -d
```

## API Documentation
Once the backend server is running, you can access the interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License
This project is licensed under the MIT License - see the LICENSE file for details.