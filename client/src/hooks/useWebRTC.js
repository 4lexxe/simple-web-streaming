import { useRef, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export const useWebRTC = () => {
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const createPeerConnection = useCallback((userId, isInitiator, onRemoteStream, socket) => {
    console.log('Creando PeerConnection:', { userId, isInitiator, hasLocalStream: !!localStreamRef.current });
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = peerConnection;

    peerConnection.ontrack = (event) => {
      console.log('Track recibido:', event.streams.length, 'streams');
      const [remoteStream] = event.streams;
      if (remoteStream) {
        console.log('Llamando onRemoteStream con stream:', !!remoteStream);
        onRemoteStream(remoteStream);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && socket.connected) {
        console.log('Enviando ICE candidate a:', userId);
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          target: userId
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState, 'para:', userId);
    };

    if (localStreamRef.current && isInitiator) {
      console.log('Agregando tracks locales para:', userId);
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    } else {
      console.log('No agregando tracks:', { hasLocalStream: !!localStreamRef.current, isInitiator });
    }

    return peerConnection;
  }, []);

  const createOffer = useCallback(async (userId, socket) => {
    console.log('Creando offer para:', userId);
    if (!peerConnectionRef.current) {
      console.warn('No hay peerConnection para crear offer');
      return;
    }
    if (!socket || !socket.connected) {
      console.warn('Socket not available for offer');
      return;
    }

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      console.log('Enviando offer a:', userId);
      socket.emit('offer', {
        offer: offer,
        target: userId
      });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  }, []);

  const handleOffer = useCallback(async (offer, senderId, onRemoteStream, socket) => {
    console.log('Handle offer de:', senderId);
    if (!socket || !socket.connected) {
      console.warn('Socket not available for answer');
      return;
    }
    
    try {
      if (!peerConnectionRef.current) {
        console.log('Creando nueva conexión para handleOffer');
        createPeerConnection(senderId, false, onRemoteStream, socket);
      }

      console.log('Estableciendo remote description');
      await peerConnectionRef.current.setRemoteDescription(offer);
      
      console.log('Creando answer');
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      console.log('Enviando answer a:', senderId);
      socket.emit('answer', {
        answer: answer,
        target: senderId
      });
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async (answer) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  }, []);

  const setLocalStream = useCallback((stream) => {
    console.log('Set local stream llamado con:', !!stream);
    localStreamRef.current = stream;
  }, []);

  const hasLocalStream = useCallback(() => {
    return !!localStreamRef.current;
  }, []);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  return {
    createPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    setLocalStream,
    hasLocalStream,
    cleanup
  };
};