import { io } from 'socket.io-client';

// Initialize WebSocket connection
export const initWebSocket = (namespace = '', token) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const socketUrl = `${baseUrl}${namespace}`;
  
  // Create socket instance with auth token
  const socket = io(socketUrl, {
    auth: {
      token,
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  // Add some basic logging
  socket.on('connect', () => {
    console.log('WebSocket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });
  
  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });
  
  return socket;
};

// Helper to subscribe to events
export const subscribeToEvent = (socket, event, callback) => {
  if (!socket) return () => {};
  
  socket.on(event, callback);
  
  // Return unsubscribe function
  return () => {
    socket.off(event, callback);
  };
};

// Helper to emit events
export const emitEvent = (socket, event, data) => {
  if (!socket) return false;
  
  socket.emit(event, data);
  return true;
};

// Helper to disconnect
export const disconnect = (socket) => {
  if (socket) {
    socket.disconnect();
  }
};

export default {
  initWebSocket,
  subscribeToEvent,
  emitEvent,
  disconnect,
};