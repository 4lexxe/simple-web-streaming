const rooms = new Map();

const handleConnection = (io, socket) => {
  console.log('Usuario conectado:', socket.id);
  let currentRoom = null;

  // Unirse a una sala
  socket.on('join-room', (roomId) => {
    currentRoom = roomId;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: new Set(), presenter: null });
    }

    const room = rooms.get(roomId);
    room.users.add(socket.id);

    console.log(`Usuario ${socket.id} se unió a la sala ${roomId}`);
    
    // Notificar a otros usuarios
    socket.to(roomId).emit('user-joined', socket.id);
    
    // Si hay presentador activo, notificar al nuevo usuario Y al presentador
    if (room.presenter) {
      socket.emit('user-started-sharing', room.presenter);
      console.log(`Notificando a ${socket.id} que ${room.presenter} está compartiendo`);
      
      // También notificar al presentador que hay un nuevo usuario
      socket.to(room.presenter).emit('user-joined', socket.id);
      console.log(`Notificando a ${room.presenter} que ${socket.id} se unió`);
    }
  });

  // Iniciar presentación
  socket.on('start-sharing', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      room.presenter = socket.id;
      socket.to(roomId).emit('user-started-sharing', socket.id);
      console.log(`Usuario ${socket.id} inició sharing en sala ${roomId}`);
      
      // Enviar lista de usuarios para conectar INMEDIATAMENTE
      const users = Array.from(room.users).filter(id => id !== socket.id);
      if (users.length > 0) {
        socket.emit('users-list', users);
        console.log(`Enviando lista de ${users.length} usuarios a ${socket.id}`);
      }
    }
  });

  // Detener presentación
  socket.on('stop-sharing', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.presenter === socket.id) {
      room.presenter = null;
      socket.to(roomId).emit('user-stopped-sharing', socket.id);
      console.log(`Usuario ${socket.id} detuvo sharing en sala ${roomId}`);
    }
  });

  // Señalización WebRTC
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      sender: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      sender: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      room.users.delete(socket.id);
      
      if (room.presenter === socket.id) {
        room.presenter = null;
        socket.to(currentRoom).emit('user-stopped-sharing', socket.id);
      }
      
      socket.to(currentRoom).emit('user-left', socket.id);
      
      // Eliminar sala si está vacía
      if (room.users.size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
};

module.exports = { handleConnection };