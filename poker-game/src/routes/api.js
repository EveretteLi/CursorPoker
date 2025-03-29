const express = require('express');
const { games } = require('../sockets/gameSocket');
const gameConfig = require('../config/gameConfig');

const router = express.Router();

/**
 * Get game information
 * @route GET /api/games/:gameId
 */
router.get('/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  const game = games.get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // Return a sanitized version of the game state
  // (without private info like player cards)
  const gameState = {
    id: game.id,
    players: game.players.map(player => ({
      id: player.id,
      name: player.name,
      chips: player.chips,
      isActive: player.isActive,
      hasFolded: !player.isActive,
      hasCards: player.cards.length > 0
    })),
    gamePhase: game.gamePhase,
    communityCards: game.gamePhase === gameConfig.PHASES.WAITING ? [] : game.communityCards,
    pot: game.pot,
    currentBet: game.currentBet,
    dealerPosition: game.dealerPosition,
    currentTurn: game.currentTurn
  };
  
  res.json(gameState);
});

/**
 * List all active games
 * @route GET /api/games
 */
router.get('/games', (req, res) => {
  const gamesList = [];
  
  for (const [gameId, game] of games.entries()) {
    gamesList.push({
      id: gameId,
      playerCount: game.players.length,
      gamePhase: game.gamePhase,
      isActive: game.gamePhase !== gameConfig.PHASES.WAITING
    });
  }
  
  res.json({ games: gamesList });
});

/**
 * Get game configuration
 * @route GET /api/config
 */
router.get('/config', (req, res) => {
  res.json({
    maxPlayers: gameConfig.MAX_PLAYERS,
    minPlayers: gameConfig.MIN_PLAYERS,
    startingChips: gameConfig.STARTING_CHIPS,
    smallBlind: gameConfig.SMALL_BLIND,
    bigBlind: gameConfig.BIG_BLIND
  });
});

module.exports = router; 