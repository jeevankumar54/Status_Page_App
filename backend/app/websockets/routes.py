from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import Optional

from app.api.dependencies import get_current_user, get_user_organization_id
from app.services.organization import get_organization_by_slug
from app.db.session import get_db
from app.websockets.manager import manager
from sqlalchemy.orm import Session
from app.schemas.user import User

router = APIRouter()


@router.websocket("/ws/org/{org_id}")
async def websocket_organization(websocket: WebSocket, org_id: int, token: Optional[str] = None):
    """
    WebSocket endpoint for authenticated organization updates
    """
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return

    try:
        # Validate token and get user
        db = next(get_db())
        user = get_current_user(db, token)
        organization_id = get_user_organization_id(user)
        
        if organization_id != org_id:
            await websocket.close(code=1008, reason="Not authorized for this organization")
            return
        
        await manager.connect(websocket, organization_id)
        
        try:
            while True:
                # Just keep the connection open - we only push updates from the server side
                data = await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(websocket, organization_id)
    except Exception as e:
        await websocket.close(code=1011, reason=str(e))


@router.websocket("/ws/admin")
async def websocket_admin(websocket: WebSocket, token: Optional[str] = None):
    """
    WebSocket endpoint for admin updates (gets updates for all organizations)
    """
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return

    try:
        # Validate token and check superuser status
        db = next(get_db())
        user = get_current_user(db, token)
        
        if not user.is_superuser:
            await websocket.close(code=1008, reason="Admin privileges required")
            return
        
        await manager.connect_admin(websocket)
        
        try:
            while True:
                # Just keep the connection open - we only push updates from the server side
                data = await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(websocket)
    except Exception as e:
        await websocket.close(code=1011, reason=str(e))


@router.websocket("/ws/public/{org_slug}")
async def websocket_public(websocket: WebSocket, org_slug: str):
    """
    WebSocket endpoint for public status page updates
    """
    try:
        # Get organization by slug
        db = next(get_db())
        organization = get_organization_by_slug(db, slug=org_slug)
        
        if not organization:
            await websocket.close(code=1008, reason="Organization not found")
            return
        
        await manager.connect(websocket, organization.id, is_public=True)
        
        try:
            while True:
                # Just keep the connection open - we only push updates from the server side
                data = await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(websocket, organization.id, is_public=True)
    except Exception as e:
        await websocket.close(code=1011, reason=str(e))