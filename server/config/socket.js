const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // Join user-specific notification room
    socket.on('join_user', (userId) => {
      if (userId) {
        const roomName = `user:${userId}`;
        socket.join(roomName);
        console.log(`👤 Socket ${socket.id} joined room: ${roomName}`);
      }
    });

    // Leave user-specific room
    socket.on('leave_user', (userId) => {
      if (userId) {
        const roomName = `user:${userId}`;
        socket.leave(roomName);
        console.log(`👤 Socket ${socket.id} left room: ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io instance has not been initialized');
  }
  return io;
};

// Emit event to a specific user room
const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Broadcast event to all connected clients
const broadcastEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  broadcastEvent,
};
