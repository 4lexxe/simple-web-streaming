import { useState } from 'react';
import { IoWarning } from 'react-icons/io5';

const ConnectionModal = ({ onConnect, error }) => {
  const [roomId, setRoomId] = useState('');

  const handleSubmit = () => {
    if (roomId.trim()) {
      onConnect(roomId.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="connection-modal">
      <div className="modal-content">
        <h2 className="modal-title">Unirse a la Sala</h2>
        <p className="modal-subtitle">Ingresa el ID de la sala para comenzar</p>

        {error && (
          <div className="error-message">
            <IoWarning />
            {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">ID de la Sala</label>
          <input
            type="text"
            placeholder="Ej: sala123"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input-field"
            autoFocus
          />
        </div>

        <button
          className="modal-button"
          onClick={handleSubmit}
          disabled={!roomId.trim()}
        >
          Unirse a la Sala
        </button>
      </div>
    </div>
  );
};

export default ConnectionModal;