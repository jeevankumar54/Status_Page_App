import json
from typing import Dict, List, Any, Optional
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Map organization_id -> list of connected WebSockets
        self.org_connections: Dict[int, List[WebSocket]] = {}
        # Map organization_id -> list of public WebSockets
        self.public_connections: Dict[int, List[WebSocket]] = {}
        # Active connections for all organizations (admin view)
        self.admin_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket, organization_id: int, is_public: bool = False):
        await websocket.accept()
        
        if is_public:
            if organization_id not in self.public_connections:
                self.public_connections[organization_id] = []
            self.public_connections[organization_id].append(websocket)
        else:
            if organization_id not in self.org_connections:
                self.org_connections[organization_id] = []
            self.org_connections[organization_id].append(websocket)
    
    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admin_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket, organization_id: Optional[int] = None, is_public: bool = False):
        if organization_id is not None:
            if is_public and organization_id in self.public_connections:
                if websocket in self.public_connections[organization_id]:
                    self.public_connections[organization_id].remove(websocket)
            elif not is_public and organization_id in self.org_connections:
                if websocket in self.org_connections[organization_id]:
                    self.org_connections[organization_id].remove(websocket)
        else:
            # Check in admin connections
            if websocket in self.admin_connections:
                self.admin_connections.remove(websocket)
            # Check in all organization connections
            for org_id in self.org_connections:
                if websocket in self.org_connections[org_id]:
                    self.org_connections[org_id].remove(websocket)
            # Check in all public connections
            for org_id in self.public_connections:
                if websocket in self.public_connections[org_id]:
                    self.public_connections[org_id].remove(websocket)
    
    async def send_personal_message(self, message: Any, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))
    
    async def broadcast_organization(self, organization_id: int, message: Any):
        if organization_id in self.org_connections:
            for connection in self.org_connections[organization_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    # Remove disconnected clients
                    self.disconnect(connection, organization_id)
        
        # Also send to admin connections
        for connection in self.admin_connections:
            try:
                await connection.send_text(json.dumps({
                    **message,
                    "organization_id": organization_id
                }))
            except Exception:
                # Remove disconnected clients
                self.disconnect(connection)
    
    async def broadcast_public(self, organization_id: int, message: Any):
        if organization_id in self.public_connections:
            for connection in self.public_connections[organization_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    # Remove disconnected clients
                    self.disconnect(connection, organization_id, is_public=True)


# Create a single instance to be imported elsewhere
manager = ConnectionManager()