from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router, public_router
from app.websockets.routes import router as websocket_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Include public routes (no authentication required)
app.include_router(public_router, prefix="/public")

# Include WebSocket routes
app.include_router(websocket_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to the Status Page API",
        "docs": "/docs",
    }