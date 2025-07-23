import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import { useScreenShare } from '../hooks/useScreenShare';
import { useScreenShareLogic } from '../hooks/useScreenShareLogic';
import { useSocketEvents } from '../hooks/useSocketEvents';

import ConnectionModal from './ConnectionModal';
import TopBar from './TopBar';
import VideoArea from './VideoArea';
import ControlBar from './ControlBar';

import '../styles/ScreenShare.css';

const ScreenShare = () => {
  const [roomId, setRoomId] = useState('');

  const { socket, isConnected, connect } = useSocket();
  const { isSharing, error, localStream, startSharing, stopSharing } = useScreenShare();
  const webRTC = useWebRTC();
  
  const screenShareLogic = useScreenShareLogic(webRTC);
  const { createSocketEvents } = useSocketEvents(webRTC, screenShareLogic, isSharing);

  const {
    isReceiving,
    remoteVideoRef,
    localVideoRef,
    previewVideoRef,
    processPendingUsers
  } = screenShareLogic;

  // Asignar el localStream a los elementos de video cuando esté disponible
  useEffect(() => {
    if (localStream) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = localStream;
      }

      // Procesar usuarios pendientes cuando el stream esté listo
      processPendingUsers();
    } else {
      // Limpiar cuando no hay stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = null;
      }
    }
  }, [localStream, processPendingUsers]);

  const handleConnect = (roomIdInput) => {
    setRoomId(roomIdInput);
    const socketEvents = createSocketEvents(roomIdInput);
    connect(roomIdInput, socketEvents);
  };

  const handleStartSharing = async () => {
    try {
      const stream = await startSharing();
      webRTC.setLocalStream(stream);
      if (socket) {
        socket.emit('start-sharing', roomId);
        console.log('Evento start-sharing enviado');
      }
    } catch (err) {
      console.error('Error starting share:', err);
    }
  };

  const handleStopSharing = () => {
    stopSharing();
    if (socket) {
      socket.emit('stop-sharing', roomId);
    }
  };

  const handleLeaveCall = () => {
    window.location.reload();
  };

  // Show connection modal if not connected
  if (!isConnected) {
    return (
      <ConnectionModal 
        onConnect={handleConnect}
        error={error}
      />
    );
  }

  return (
    <div className="screen-share-container">
      <TopBar 
        roomId={roomId}
        isConnected={isConnected}
      />

      <VideoArea
        isReceiving={isReceiving}
        isSharing={isSharing}
        remoteVideoRef={remoteVideoRef}
        previewVideoRef={previewVideoRef}
      />

      <ControlBar
        isSharing={isSharing}
        onStartSharing={handleStartSharing}
        onStopSharing={handleStopSharing}
        onLeaveCall={handleLeaveCall}
      />
    </div>
  );
};

export default ScreenShare;