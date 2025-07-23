import { useRef } from 'react';

const VideoArea = ({ 
  isReceiving, 
  isSharing, 
  remoteVideoRef, 
  previewVideoRef 
}) => {
  return (
    <div className="video-area">
      <div className="main-video-container">
        {/* Video siempre presente en el DOM, pero oculto cuando no hay stream */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="main-video"
          style={{ display: isReceiving ? 'block' : 'none' }}
        />
        
        {/* Overlay mostrado cuando no hay stream */}
        {!isReceiving && (
          <div className="video-overlay">
            Esperando que alguien comparta su pantalla...
          </div>
        )}
      </div>

      {/* Preview pequeño: mi pantalla cuando estoy compartiendo */}
      {isSharing && (
        <div className="pip-container active">
          <video
            ref={previewVideoRef}
            autoPlay
            muted
            className="pip-video"
          />
          <div className="pip-label">Mi pantalla</div>
        </div>
      )}
    </div>
  );
};

export default VideoArea;