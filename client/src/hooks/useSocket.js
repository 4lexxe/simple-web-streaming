import { useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const connect = useCallback((roomId, callbacks) => {
    if (socketRef.current) return;

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-room', roomId);
      callbacks.onConnect?.(newSocket.id);
    });

    newSocket.on('user-joined', (userId) => callbacks.onUserJoined?.(userId, newSocket));
    newSocket.on('user-started-sharing', (userId) => callbacks.onUserStartedSharing?.(userId, newSocket));
    newSocket.on('user-stopped-sharing', (userId) => callbacks.onUserStoppedSharing?.(userId, newSocket));
    newSocket.on('users-list', (users) => callbacks.onUsersList?.(users, newSocket));
    newSocket.on('presenter-available', (presenterId) => callbacks.onPresenterAvailable?.(presenterId, newSocket));

    // WebRTC events
    newSocket.on('offer', (data) => callbacks.onOffer?.(data, newSocket));
    newSocket.on('answer', (data) => callbacks.onAnswer?.(data, newSocket));
    newSocket.on('ice-candidate', (data) => callbacks.onIceCandidate?.(data, newSocket));

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      callbacks.onDisconnect?.();
    });

    return newSocket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect
  };
};