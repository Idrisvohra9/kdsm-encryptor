const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store active rooms and users
const activeRooms = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', (data) => {
    const { roomId, userId, username } = data;
    
    // Leave any previous rooms
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    // Join the new room
    socket.join(roomId);
    
    // Store user info
    userSockets.set(socket.id, { userId, username, roomId });
    
    // Update room members
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add(userId);

    // Notify room about new member
    socket.to(roomId).emit('user-joined', {
      userId,
      username,
      timestamp: new Date().toISOString()
    });

    // Send current room members to the new user
    const roomMembers = Array.from(activeRooms.get(roomId));
    socket.emit('room-members', roomMembers);

    console.log(`User ${username} (${userId}) joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on('send-message', (data) => {
    const { roomId, message, senderId, senderName, timestamp } = data;
    
    // Broadcast message to all users in the room except sender
    socket.to(roomId).emit('receive-message', {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      message,
      senderId,
      senderName,
      timestamp,
    });

    console.log(`Message sent in room ${roomId} by ${senderName}`);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { roomId, userId, username } = data;
    socket.to(roomId).emit('user-typing', { userId, username, isTyping: true });
  });

  socket.on('typing-stop', (data) => {
    const { roomId, userId, username } = data;
    socket.to(roomId).emit('user-typing', { userId, username, isTyping: false });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userInfo = userSockets.get(socket.id);
    
    if (userInfo) {
      const { userId, username, roomId } = userInfo;
      
      // Remove from active room
      if (activeRooms.has(roomId)) {
        activeRooms.get(roomId).delete(userId);
        if (activeRooms.get(roomId).size === 0) {
          activeRooms.delete(roomId);
        }
      }
      
      // Notify room about user leaving
      socket.to(roomId).emit('user-left', {
        userId,
        username,
        timestamp: new Date().toISOString()
      });
      
      userSockets.delete(socket.id);
      console.log(`User ${username} (${userId}) disconnected from room ${roomId}`);
    }
    
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});