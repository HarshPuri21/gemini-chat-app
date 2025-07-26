// server.js
// This is the backend server for the Real-time Chat Application.
// It uses Node.js, Express, Socket.IO, and Redis.

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

// --- Initialization ---
const app = express();
const httpServer = createServer(app);

// In a production environment, you would use your actual Redis server credentials.
const redisClient = createClient({ url: 'redis://localhost:6379' });
const subClient = redisClient.duplicate();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for simplicity. In production, restrict this.
  },
  // Use the Redis adapter to broadcast events across multiple server instances.
  // This is the key to making the application scalable.
  adapter: createAdapter(redisClient, subClient),
});

// --- Data Storage (In-memory for this example) ---
// In a real app, this would be a database like PostgreSQL or MongoDB.
const users = {}; // Store users by socket ID
const messageHistory = {}; // Store message history per room

// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle a user joining the chat
  socket.on('join', ({ username }) => {
    users[socket.id] = { id: socket.id, name: username };
    console.log(`${username} (${socket.id}) joined the chat.`);
    
    // Broadcast updated user list to everyone
    io.emit('updateUserList', Object.values(users));
  });

  // Handle a user joining a specific room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${users[socket.id]?.name} joined room: ${roomId}`);

    // Send a system message to the user who just joined
    socket.emit('systemMessage', `Welcome to the #${roomId} room!`);
    
    // Send the room's message history to the user
    socket.emit('messageHistory', messageHistory[roomId] || []);

    // Notify others in the room that a new user has joined
    socket.to(roomId).emit('systemMessage', `${users[socket.id]?.name} has joined the room.`);
  });

  // Handle an incoming chat message
  socket.on('sendMessage', ({ message, roomId }) => {
    const sender = users[socket.id];
    if (!sender) return; // Ignore messages from unknown users

    const messageData = {
      id: Date.now(),
      username: sender.name,
      text: message,
      roomId: roomId,
    };

    // Store the message
    if (!messageHistory[roomId]) {
      messageHistory[roomId] = [];
    }
    messageHistory[roomId].push(messageData);
    // Keep history from growing too large
    if (messageHistory[roomId].length > 100) {
      messageHistory[roomId].shift();
    }

    // Broadcast the message to everyone in the room
    io.to(roomId).emit('newMessage', messageData);
    console.log(`Message from ${sender.name} in room ${roomId}: ${message}`);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      console.log(`User disconnected: ${user.name} (${socket.id})`);
      delete users[socket.id];
      // Broadcast the updated user list and a system message
      io.emit('updateUserList', Object.values(users));
      io.emit('systemMessage', `${user.name} has left the chat.`);
    }
  });
});

// --- Server Listening ---
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

