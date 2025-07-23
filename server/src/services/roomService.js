class RoomService {
  constructor() {
    this.rooms = new Map();
  }

  joinRoom(socketId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: new Set(),
        presenter: null
      });
    }

    const room = this.rooms.get(roomId);
    room.users.add(socketId);

    return {
      room,
      otherUsers: Array.from(room.users).filter(id => id !== socketId)
    };
  }

  leaveRoom(socketId, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.users.delete(socketId);

    if (room.presenter === socketId) {
      room.presenter = null;
    }

    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }

    return room;
  }

  startPresentation(socketId, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.presenter = socketId;
    return Array.from(room.users).filter(id => id !== socketId);
  }

  stopPresentation(socketId, roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.presenter !== socketId) return null;

    room.presenter = null;
    return Array.from(room.users).filter(id => id !== socketId);
  }

  getRoomUsers(roomId, excludeSocketId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.users).filter(id => id !== excludeSocketId);
  }
}

module.exports = new RoomService();