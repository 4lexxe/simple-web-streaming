import { MdPeople } from 'react-icons/md';

const TopBar = ({ roomId, isConnected }) => {
  return (
    <div className="top-bar">
      <div className="room-info">
        <div className="room-title">
          <MdPeople />
          Sala de Screen Share
        </div>
        <div className="room-id">ID: {roomId}</div>
      </div>
      <div className="connection-status">
        <div className={`status-dot ${isConnected ? '' : 'disconnected'}`}></div>
        {isConnected ? 'Conectado' : 'Desconectado'}
      </div>
    </div>
  );
};

export default TopBar;