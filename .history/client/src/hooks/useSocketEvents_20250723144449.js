import { useCallback } from 'react';

export const useSocketEvents = (webRTC, screenShareLogic, isSharing) => {
  const {
    handleRemoteStream,
    addPendingUser,
    stopReceiving
  } = screenShareLogic;

  const createSocketEvents = useCallback((roomId) => {
    return {
      onUserJoined: (userId, socketInstance) => {
        console.log('Usuario unido:', userId, 'hasLocalStream:', webRTC.hasLocalStream());
        
        if (webRTC.hasLocalStream()) {
          console.log('Creando conexión como presenter para:', userId);
          setTimeout(() => {
            webRTC.createPeerConnection(userId, true, handleRemoteStream, socketInstance);
            setTimeout(() => webRTC.createOffer(userId, socketInstance), 500);
          }, 100);
        } else if (isSharing) {
          addPendingUser(userId, socketInstance, 'joined');
        }
      },

      onUserStartedSharing: (userId, socketInstance) => {
        console.log('Usuario comenzó a compartir:', userId, 'creando conexión como viewer');
        webRTC.createPeerConnection(userId, false, handleRemoteStream, socketInstance);
        console.log('Conexión de viewer creada para:', userId);
      },

      onUserStoppedSharing: () => {
        console.log('Usuario dejó de compartir');
        stopReceiving();
        webRTC.cleanup();
      },

      onUsersList: (users, socketInstance) => {
        console.log('Lista de usuarios:', users, 'hasLocalStream:', webRTC.hasLocalStream());
        
        if (users.length > 0 && webRTC.hasLocalStream()) {
          console.log('Procesando lista de usuarios como presenter');
          users.forEach((userId, index) => {
            setTimeout(() => {
              webRTC.createPeerConnection(userId, true, handleRemoteStream, socketInstance);
              setTimeout(() => webRTC.createOffer(userId, socketInstance), 500);
            }, index * 200);
          });
        } else {
          console.log('NO procesando lista - users:', users.length, 'hasLocalStream:', webRTC.hasLocalStream());
        }
      },

      onOffer: (data, socketInstance) => {
        console.log('Oferta recibida de:', data.sender);
        webRTC.handleOffer(data.offer, data.sender, handleRemoteStream, socketInstance);
      },

      onAnswer: (data) => {
        console.log('Respuesta recibida de:', data.sender);
        webRTC.handleAnswer(data.answer);
      },

      onIceCandidate: (data) => {
        console.log('Candidato ICE recibido de:', data.sender);
        webRTC.handleIceCandidate(data.candidate);
      },

      onDisconnect: webRTC.cleanup
    };
  }, [webRTC, handleRemoteStream, addPendingUser, stopReceiving, isSharing]);

  return { createSocketEvents };
};