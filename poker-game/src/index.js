/**
 * CursorPoker - Texas Hold'em Poker Game
 * Main server entry point
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { setupGameSockets } = require('./sockets/gameSocket');
const apiRouter = require('./routes/api');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'CursorPoker API is running',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', apiRouter);

// Set up Socket.IO handlers
setupGameSockets(io);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
}); 