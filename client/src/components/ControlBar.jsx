import {
  MdScreenShare,
  MdStopScreenShare,
  MdCallEnd
} from 'react-icons/md';

const ControlBar = ({ 
  isSharing, 
  onStartSharing, 
  onStopSharing, 
  onLeaveCall 
}) => {
  return (
    <div className="bottom-controls">
      <button
        className={`control-button ${isSharing ? 'danger' : 'primary'}`}
        onClick={isSharing ? onStopSharing : onStartSharing}
        title={isSharing ? 'Detener compartir pantalla' : 'Compartir pantalla'}
      >
        {isSharing ? <MdStopScreenShare /> : <MdScreenShare />}
      </button>

      <button
        className="control-button danger"
        title="Salir de la llamada"
        onClick={onLeaveCall}
      >
        <MdCallEnd />
      </button>
    </div>
  );
};

export default ControlBar;