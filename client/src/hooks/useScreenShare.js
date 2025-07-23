import { useState, useCallback } from 'react';

export const useScreenShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [localStream, setLocalStream] = useState(null);

  const startSharing = useCallback(async () => {
    try {
      setError('');
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      console.log('🎥 Stream capturado en hook:', !!stream);
      
      setLocalStream(stream);
      setIsSharing(true);

      // Handle when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };

      return stream;
    } catch (err) {
      setError(`Error: ${err.message}`);
      throw err;
    }
  }, []);

  const stopSharing = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setIsSharing(false);
  }, [localStream]);

  return {
    isSharing,
    error,
    localStream,
    startSharing,
    stopSharing
  };
};