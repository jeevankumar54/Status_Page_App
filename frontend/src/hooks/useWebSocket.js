import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

export const useWebSocket = (namespace = '') => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const { token } = useAuth();

  // Initialize the socket connection
  useEffect(() => {
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_URL || '';
    const socketUrl = `${baseUrl}${namespace}`;

    // Create socket instance with auth token
    const socketInstance = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket event handlers
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Set the socket instance
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [token, namespace]);

  // Listen for a specific event
  const subscribe = useCallback((event, callback) => {
    if (!socket) return () => {};

    socket.on(event, (data) => {
      setLastMessage({ event, data });
      callback(data);
    });

    return () => {
      socket.off(event);
    };
  }, [socket]);

  // Send a message to the server
  const send = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    lastMessage,
    subscribe,
    send,
  };
};

export default useWebSocket;