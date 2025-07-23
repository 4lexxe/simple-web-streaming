import { useState, useRef, useEffect, useCallback } from 'react';

export const useScreenShareLogic = (webRTC) => {
  const [isReceiving, setIsReceiving] = useState(false);
  const [pendingRemoteStream, setPendingRemoteStream] = useState(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const pendingUsersRef = useRef([]);

  const handleRemoteStream = useCallback((stream) => {
    console.log('handleRemoteStream llamado:', {
      hasStream: !!stream,
      hasRemoteVideoRef: !!remoteVideoRef.current,
      currentIsReceiving: isReceiving
    });

    const assignStream = () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setIsReceiving(true);
        setPendingRemoteStream(null);
        console.log('🎬 Stream asignado a remoteVideoRef y setIsReceiving(true)');
        return true;
      }
      return false;
    };

    if (!assignStream()) {
      setPendingRemoteStream(stream);
      
      // Reintentar hasta 10 veces con intervalos de 100ms
      let attempts = 0;
      const retryInterval = setInterval(() => {
        attempts++;
        console.log(`Reintento ${attempts}/10 para asignar stream`, {
          remoteVideoRefCurrent: !!remoteVideoRef.current,
          isReceiving: isReceiving,
          videoElementInDOM: !!document.querySelector('.main-video')
        });
        
        if (assignStream() || attempts >= 10) {
          clearInterval(retryInterval);
          if (attempts >= 10) {
          }
        }
      }, 100);
    }
  }, [isReceiving]);

  const processPendingUsers = useCallback(() => {
    if (pendingUsersRef.current.length > 0) {
      console.log('Stream listo, procesando usuarios pendientes:', pendingUsersRef.current.length);
      pendingUsersRef.current.forEach(({ userId, socketInstance, type }) => {
        if (type === 'joined') {
          setTimeout(() => {
            webRTC.createPeerConnection(userId, true, handleRemoteStream, socketInstance);
            setTimeout(() => webRTC.createOffer(userId, socketInstance), 500);
          }, 100);
        }
      });
      pendingUsersRef.current = []; // Limpiar usuarios pendientes
    }
  }, [webRTC, handleRemoteStream]);

  const addPendingUser = useCallback((userId, socketInstance, type) => {
    console.log('🔵 Guardando usuario pendiente:', userId);
    pendingUsersRef.current.push({ userId, socketInstance, type });
  }, []);

  const stopReceiving = useCallback(() => {
    setIsReceiving(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  // Asignar stream remoto pendiente cuando remoteVideoRef esté disponible
  useEffect(() => {
    if (pendingRemoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = pendingRemoteStream;
      setIsReceiving(true);
      setPendingRemoteStream(null);
    }
  }); // Sin dependencias para que se ejecute en cada render

  return {
    isReceiving,
    remoteVideoRef,
    localVideoRef,
    previewVideoRef,
    handleRemoteStream,
    processPendingUsers,
    addPendingUser,
    stopReceiving
  };
};