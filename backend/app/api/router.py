from fastapi import APIRouter

from app.api.endpoints import auth, services, incidents, organizations, public

api_router = APIRouter()

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Organization routes
api_router.include_router(
    organizations.router, prefix="/organizations", tags=["organizations"]
)

# Service routes
api_router.include_router(services.router, prefix="/services", tags=["services"])

# Incident routes
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])

# Public routes - these don't require authentication
public_router = APIRouter()
public_router.include_router(public.router, tags=["public"])