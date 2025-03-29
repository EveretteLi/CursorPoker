const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Game state
const games = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Create a new game
  socket.on('createGame', (data) => {
    const gameId = uuidv4();
    const game = {
      id: gameId,
      players: [],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      gamePhase: 'waiting',
      deck: [],
      currentTurn: null
    };
    games.set(gameId, game);
    socket.join(gameId);
    socket.emit('gameCreated', { gameId });
  });

  // Join an existing game
  socket.on('joinGame', (data) => {
    const { gameId, playerName } = data;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.players.length >= 9) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      chips: 1000,
      cards: [],
      isActive: true
    };

    game.players.push(player);
    socket.join(gameId);
    io.to(gameId).emit('playerJoined', { player });
  });

  // Handle player actions
  socket.on('playerAction', (data) => {
    const { gameId, action, amount } = data;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    // Handle different actions (fold, check, call, raise)
    switch (action) {
      case 'fold':
        handleFold(game, socket.id);
        break;
      case 'check':
        handleCheck(game, socket.id);
        break;
      case 'call':
        handleCall(game, socket.id);
        break;
      case 'raise':
        handleRaise(game, socket.id, amount);
        break;
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Clean up games and players
    games.forEach((game, gameId) => {
      game.players = game.players.filter(player => player.id !== socket.id);
      if (game.players.length === 0) {
        games.delete(gameId);
      }
    });
  });
});

// Game action handlers
function handleFold(game, playerId) {
  const player = game.players.find(p => p.id === playerId);
  if (player) {
    player.isActive = false;
    io.to(game.id).emit('playerFolded', { playerId });
    checkRoundEnd(game);
  }
}

function handleCheck(game, playerId) {
  // Implement check logic
  io.to(game.id).emit('playerChecked', { playerId });
  moveToNextPlayer(game);
}

function handleCall(game, playerId) {
  const player = game.players.find(p => p.id === playerId);
  if (player) {
    const callAmount = game.currentBet;
    player.chips -= callAmount;
    game.pot += callAmount;
    io.to(game.id).emit('playerCalled', { playerId, amount: callAmount });
    moveToNextPlayer(game);
  }
}

function handleRaise(game, playerId, amount) {
  const player = game.players.find(p => p.id === playerId);
  if (player && player.chips >= amount) {
    player.chips -= amount;
    game.pot += amount;
    game.currentBet = amount;
    io.to(game.id).emit('playerRaised', { playerId, amount });
    moveToNextPlayer(game);
  }
}

function moveToNextPlayer(game) {
  // Implement next player logic
  const activePlayers = game.players.filter(p => p.isActive);
  if (activePlayers.length > 1) {
    const currentIndex = activePlayers.findIndex(p => p.id === game.currentTurn);
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    game.currentTurn = activePlayers[nextIndex].id;
    io.to(game.id).emit('turnChanged', { currentTurn: game.currentTurn });
  } else {
    // Only one player left, they win
    const winner = activePlayers[0];
    io.to(game.id).emit('gameEnded', { winner });
  }
}

function checkRoundEnd(game) {
  const activePlayers = game.players.filter(p => p.isActive);
  if (activePlayers.length === 1) {
    // Only one player left, they win
    const winner = activePlayers[0];
    io.to(game.id).emit('gameEnded', { winner });
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 