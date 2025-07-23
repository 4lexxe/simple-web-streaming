import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
  }

  connect(serverUrl = 'http://localhost:3001') {
    this.socket = io(serverUrl);
    
    this.socket.on('connect', () => {
      this.emit('connected', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.emit('disconnected');
    });

    // Eventos de sala
    this.socket.on('user-joined', (userId) => {
      this.emit('userJoined', userId);
    });

    this.socket.on('user-left', (userId) => {
      this.emit('userLeft', userId);
    });

    this.socket.on('room-users', (users) => {
      this.emit('roomUsers', users);
    });

    // Eventos de presentación
    this.socket.on('presentation-started', (presenterId) => {
      this.emit('presentationStarted', presenterId);
    });

    this.socket.on('presentation-stopped', (presenterId) => {
      this.emit('presentationStopped', presenterId);
    });

    // Eventos WebRTC
    this.socket.on('webrtc-signal', (data) => {
      this.emit('webrtcSignal', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId) {
    this.socket?.emit('join-room', roomId);
  }

  startPresentation(roomId) {
    this.socket?.emit('start-presentation', roomId);
  }

  stopPresentation(roomId) {
    this.socket?.emit('stop-presentation', roomId);
  }

  sendWebRTCSignal(type, payload, target) {
    this.socket?.emit('webrtc-signal', { type, payload, target });
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event).add(callback);
  }

  off(event, callback) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event, data) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export default new SocketService();