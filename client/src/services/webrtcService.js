class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.iceServers = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
    this.callbacks = new Map();
  }

  async initializePeerConnection(isInitiator = false) {
    this.closePeerConnection();
    
    this.peerConnection = new RTCPeerConnection(this.iceServers);

    this.peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.emit('remoteStream', remoteStream);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('iceCandidate', event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.emit('connectionStateChange', this.peerConnection.connectionState);
    };

    // Agregar stream local si existe
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    return this.peerConnection;
  }

  async createOffer() {
    if (!this.peerConnection) return null;
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(offer) {
    if (!this.peerConnection) return null;
    
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(answer) {
    if (!this.peerConnection) return;
    
    await this.peerConnection.setRemoteDescription(answer);
  }

  async handleIceCandidate(candidate) {
    if (!this.peerConnection) return;
    
    await this.peerConnection.addIceCandidate(candidate);
  }

  async startScreenShare() {
    try {
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      this.localStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      this.emit('localStream', this.localStream);
      return this.localStream;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  stopScreenShare() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.closePeerConnection();
    this.emit('screenShareStopped');
  }

  closePeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
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

export default new WebRTCService();