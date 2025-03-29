const { v4: uuidv4 } = require('uuid');
const Game = require('../models/Game');
const Player = require('../models/Player');
const handEvaluator = require('../utils/handEvaluator');
const gameConfig = require('../config/gameConfig');

/**
 * Games registry - stores all active games
 */
const games = new Map();

/**
 * Handle socket connections for the poker game
 * @param {Object} io Socket.io server instance
 */
const setupGameSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    /**
     * Create a new game
     */
    socket.on('createGame', () => {
      const gameId = uuidv4();
      const game = new Game(gameId);
      games.set(gameId, game);
      
      socket.join(gameId);
      socket.emit('gameCreated', { gameId });
      
      console.log(`Game created: ${gameId}`);
    });

    /**
     * Join an existing game
     */
    socket.on('joinGame', ({ gameId, playerName }) => {
      const game = games.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      if (game.players.length >= gameConfig.MAX_PLAYERS) {
        socket.emit('error', { message: `Game is full (max ${gameConfig.MAX_PLAYERS} players)` });
        return;
      }

      try {
        // Create and add the player
        const player = game.addPlayer(socket.id, playerName);
        
        socket.join(gameId);
        socket.gameId = gameId; // Store the game ID for disconnect handling
        
        // Notify everyone
        io.to(gameId).emit('playerJoined', { 
          player: {
            id: player.id,
            name: player.name,
            chips: player.chips,
            isActive: player.isActive
          } 
        });
        
        console.log(`Player ${playerName} joined game: ${gameId}`);
        
        // If we have enough players, allow the game to start
        if (game.players.length >= gameConfig.MIN_PLAYERS) {
          io.to(gameId).emit('readyToStart');
        }
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    /**
     * Start the game
     */
    socket.on('startGame', () => {
      const gameId = socket.gameId;
      if (!gameId) {
        socket.emit('error', { message: 'You are not in a game' });
        return;
      }
      
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      if (game.players.length < gameConfig.MIN_PLAYERS) {
        socket.emit('error', { message: `Not enough players to start (need ${gameConfig.MIN_PLAYERS})` });
        return;
      }
      
      try {
        // Start the first round
        game.startRound();
        
        // Send each player their cards privately
        game.players.forEach(player => {
          io.to(player.id).emit('dealCards', { cards: player.cards });
        });
        
        // Notify everyone about the game state
        io.to(gameId).emit('gameStarted', {
          dealer: game.dealerPosition,
          smallBlind: {
            position: (game.dealerPosition + 1) % game.players.length,
            amount: game.smallBlind
          },
          bigBlind: {
            position: (game.dealerPosition + 2) % game.players.length,
            amount: game.bigBlind
          },
          currentTurn: game.currentTurn,
          pot: game.pot,
          players: game.players.map(p => ({
            id: p.id,
            name: p.name,
            chips: p.chips,
            isActive: p.isActive,
            currentBet: p.currentBet
          }))
        });
        
        console.log(`Game ${gameId} started`);
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Handle player actions (fold, check, call, raise)
     */
    socket.on('playerAction', ({ action, amount }) => {
      const gameId = socket.gameId;
      if (!gameId) {
        socket.emit('error', { message: 'You are not in a game' });
        return;
      }
      
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex === -1) {
        socket.emit('error', { message: 'You are not a player in this game' });
        return;
      }
      
      if (playerIndex !== game.currentTurn) {
        socket.emit('error', { message: 'It is not your turn' });
        return;
      }
      
      const player = game.players[playerIndex];
      let actionCompleted = false;
      let betsMet = false;
      
      // Handle the action
      switch (action) {
        case 'fold':
          player.fold();
          io.to(gameId).emit('playerFolded', { playerId: player.id });
          actionCompleted = true;
          break;
          
        case 'check':
          if (game.currentBet > player.currentBet) {
            socket.emit('error', { message: 'Cannot check, must call or raise' });
            return;
          }
          io.to(gameId).emit('playerChecked', { playerId: player.id });
          actionCompleted = true;
          break;
          
        case 'call':
          if (game.currentBet <= player.currentBet) {
            socket.emit('error', { message: 'No bet to call, should check instead' });
            return;
          }
          
          const callAmount = game.currentBet - player.currentBet;
          const actualBet = player.placeBet(callAmount);
          game.pot += actualBet;
          
          io.to(gameId).emit('playerCalled', { 
            playerId: player.id,
            amount: actualBet,
            pot: game.pot,
            chips: player.chips
          });
          
          actionCompleted = true;
          break;
          
        case 'raise':
          if (!amount || amount <= 0) {
            socket.emit('error', { message: 'Invalid raise amount' });
            return;
          }
          
          // Minimum raise is at least the current bet
          if (amount <= game.currentBet) {
            socket.emit('error', { message: 'Raise amount must be greater than current bet' });
            return;
          }
          
          const totalBet = amount; // Total bet including call
          const actualRaise = player.placeBet(totalBet - player.currentBet);
          
          if (actualRaise < totalBet - player.currentBet) {
            socket.emit('error', { message: 'Not enough chips for this raise' });
            return;
          }
          
          game.pot += actualRaise;
          game.currentBet = totalBet;
          
          io.to(gameId).emit('playerRaised', { 
            playerId: player.id,
            amount: totalBet,
            pot: game.pot,
            chips: player.chips
          });
          
          actionCompleted = true;
          break;
          
        default:
          socket.emit('error', { message: 'Invalid action' });
          return;
      }
      
      if (actionCompleted) {
        // Check if betting round is complete
        betsMet = checkBettingRoundComplete(game);
        
        if (betsMet || game.players.filter(p => p.isActive).length <= 1) {
          // If bets are met or only one active player, move to next phase
          progressGame(io, game);
        } else {
          // Otherwise, move to next player
          game.moveToNextActivePlayer();
          
          io.to(gameId).emit('turnChanged', { 
            currentTurn: game.currentTurn,
            currentPlayer: game.players[game.currentTurn].id
          });
        }
      }
    });

    /**
     * Handle player disconnect
     */
    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
      
      // Clean up player from any games they were in
      if (socket.gameId) {
        const game = games.get(socket.gameId);
        if (game) {
          const playerRemoved = game.removePlayer(socket.id);
          
          if (playerRemoved) {
            // Notify remaining players
            io.to(socket.gameId).emit('playerLeft', { playerId: socket.id });
            
            // If not enough players, end the game
            if (game.players.length < gameConfig.MIN_PLAYERS) {
              io.to(socket.gameId).emit('gameEnded', { reason: 'Not enough players' });
              games.delete(socket.gameId);
            } else if (game.gamePhase !== gameConfig.PHASES.WAITING) {
              // If game in progress, handle the impact of player leaving
              progressGame(io, game);
            }
          }
        }
      }
      
      // Clean up empty games
      for (const [gameId, game] of games.entries()) {
        if (game.players.length === 0) {
          games.delete(gameId);
          console.log(`Removed empty game: ${gameId}`);
        }
      }
    });
  });
};

/**
 * Check if the current betting round is complete
 * @param {Game} game The game object
 * @returns {boolean} True if betting round is complete
 */
function checkBettingRoundComplete(game) {
  const activePlayers = game.players.filter(p => p.isActive);
  
  // If only one active player, betting is done
  if (activePlayers.length <= 1) return true;
  
  // Check if all active players have matched the current bet or are all-in
  return activePlayers.every(p => 
    p.currentBet === game.currentBet || 
    p.chips === 0
  );
}

/**
 * Progress the game to the next phase
 * @param {Object} io Socket.io instance
 * @param {Game} game The game object
 */
function progressGame(io, game) {
  const activePlayers = game.players.filter(p => p.isActive);
  
  // If only one active player, they win
  if (activePlayers.length <= 1) {
    endGame(io, game);
    return;
  }
  
  // Otherwise, move to the next game phase
  switch (game.gamePhase) {
    case gameConfig.PHASES.PRE_FLOP:
    case gameConfig.PHASES.FLOP:
    case gameConfig.PHASES.TURN:
    case gameConfig.PHASES.RIVER:
      game.dealCommunityCards();
      
      io.to(game.id).emit('communityCards', { 
        cards: game.communityCards,
        gamePhase: game.gamePhase
      });
      
      io.to(game.id).emit('turnChanged', { 
        currentTurn: game.currentTurn,
        currentPlayer: game.players[game.currentTurn].id
      });
      break;
      
    case gameConfig.PHASES.SHOWDOWN:
      endGame(io, game);
      break;
  }
}

/**
 * End the current game and determine winners
 * @param {Object} io Socket.io instance
 * @param {Game} game The game object
 */
function endGame(io, game) {
  const activePlayers = game.players.filter(p => p.isActive);
  
  // Handle case where everyone folded except one player
  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    winner.receiveChips(game.pot);
    
    io.to(game.id).emit('gameEnded', {
      winners: [{
        player: {
          id: winner.id,
          name: winner.name,
          chips: winner.chips
        },
        amount: game.pot,
        hand: null
      }],
      showdown: false
    });
  } else {
    // Normal showdown with multiple players
    const potDistribution = handEvaluator.calculatePotDistribution(
      activePlayers, 
      game.communityCards, 
      game.pot
    );
    
    // Award chips to winners
    potDistribution.forEach(({ player, amount }) => {
      player.receiveChips(amount);
    });
    
    // Format winners for the event
    const winners = potDistribution.map(({ player, amount }) => ({
      player: {
        id: player.id,
        name: player.name,
        chips: player.chips
      },
      amount,
      hand: handEvaluator.evaluateHand(player.cards, game.communityCards).name,
      cards: player.cards
    }));
    
    // Emit results to all players
    io.to(game.id).emit('gameEnded', {
      winners,
      showdown: true,
      communityCards: game.communityCards
    });
    
    // Show all players' cards
    activePlayers.forEach(player => {
      io.to(game.id).emit('showCards', {
        playerId: player.id,
        cards: player.cards,
        handName: handEvaluator.evaluateHand(player.cards, game.communityCards).name
      });
    });
  }
  
  // Reset the game state for a new round
  game.gamePhase = gameConfig.PHASES.WAITING;
  game.dealerPosition = (game.dealerPosition + 1) % game.players.length;
  
  // After a short delay, allow starting a new round
  setTimeout(() => {
    if (game.players.length >= gameConfig.MIN_PLAYERS) {
      io.to(game.id).emit('readyToStart');
    }
  }, gameConfig.ROUND_END_DELAY);
}

module.exports = { setupGameSockets, games }; 