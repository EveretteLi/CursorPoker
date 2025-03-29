const Deck = require('./Deck');
const Player = require('./Player');
const gameConfig = require('../config/gameConfig');

/**
 * Represents a poker game session
 */
class Game {
  /**
   * Create a new game
   * @param {string} id - The unique identifier for the game
   */
  constructor(id) {
    this.id = id;
    this.players = [];
    this.deck = new Deck();
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.gamePhase = gameConfig.PHASES.WAITING;
    this.currentTurn = null;
    this.smallBlind = gameConfig.SMALL_BLIND;
    this.bigBlind = gameConfig.BIG_BLIND;
    this.dealerPosition = 0;
  }

  /**
   * Add a player to the game
   * @param {string} id - Player ID
   * @param {string} name - Player name
   * @returns {Player} The created player object
   */
  addPlayer(id, name) {
    if (this.players.length >= gameConfig.MAX_PLAYERS) {
      throw new Error(`Game is full (max ${gameConfig.MAX_PLAYERS} players)`);
    }
    
    const player = new Player(id, name, gameConfig.STARTING_CHIPS);
    this.players.push(player);
    return player;
  }

  /**
   * Remove a player from the game
   * @param {string} playerId - The ID of the player to remove
   * @returns {boolean} True if player was removed, false if not found
   */
  removePlayer(playerId) {
    const initialLength = this.players.length;
    this.players = this.players.filter(player => player.id !== playerId);
    return this.players.length < initialLength;
  }

  /**
   * Start a new round of poker
   */
  startRound() {
    if (this.players.length < gameConfig.MIN_PLAYERS) {
      throw new Error(`Not enough players to start a game (need at least ${gameConfig.MIN_PLAYERS})`);
    }

    // Reset game state
    this.deck = new Deck();
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.gamePhase = gameConfig.PHASES.PRE_FLOP;
    
    // Reset player hands
    this.players.forEach(player => player.resetHand());
    
    // Deal cards to players
    for (let i = 0; i < 2; i++) {
      this.players.forEach(player => {
        player.receiveCards(this.deck.dealCards(1));
      });
    }
    
    // Set blinds and initial turn
    this.setBlindBets();
    this.moveToNextActivePlayer(this.getPlayerAfterBigBlind());
  }

  /**
   * Set blind bets at the start of a round
   */
  setBlindBets() {
    if (this.players.length < gameConfig.MIN_PLAYERS) return;
    
    const smallBlindPos = (this.dealerPosition + 1) % this.players.length;
    const bigBlindPos = (this.dealerPosition + 2) % this.players.length;
    
    // Small blind
    const smallBlinder = this.players[smallBlindPos];
    const sbAmount = smallBlinder.placeBet(this.smallBlind);
    this.pot += sbAmount;
    
    // Big blind
    const bigBlinder = this.players[bigBlindPos];
    const bbAmount = bigBlinder.placeBet(this.bigBlind);
    this.pot += bbAmount;
    
    this.currentBet = this.bigBlind;
  }

  /**
   * Get the player after the big blind
   * @returns {number} The index of the player after the big blind
   */
  getPlayerAfterBigBlind() {
    return (this.dealerPosition + 3) % this.players.length;
  }

  /**
   * Move the current turn to the next active player
   * @param {number} startPosition - The position to start from
   */
  moveToNextActivePlayer(startPosition = this.currentTurn) {
    const activePlayers = this.players.filter(player => player.isActive);
    if (activePlayers.length <= 1) {
      this.endRound();
      return;
    }
    
    let nextPos = startPosition;
    do {
      nextPos = (nextPos + 1) % this.players.length;
    } while (!this.players[nextPos].isActive);
    
    this.currentTurn = nextPos;
  }

  /**
   * Deal the next set of community cards based on the current game phase
   */
  dealCommunityCards() {
    switch (this.gamePhase) {
      case gameConfig.PHASES.PRE_FLOP:
        // Deal the flop (3 cards)
        this.communityCards = this.deck.dealCards(3);
        this.gamePhase = gameConfig.PHASES.FLOP;
        break;
      case gameConfig.PHASES.FLOP:
        // Deal the turn (1 card)
        this.communityCards.push(...this.deck.dealCards(1));
        this.gamePhase = gameConfig.PHASES.TURN;
        break;
      case gameConfig.PHASES.TURN:
        // Deal the river (1 card)
        this.communityCards.push(...this.deck.dealCards(1));
        this.gamePhase = gameConfig.PHASES.RIVER;
        break;
      case gameConfig.PHASES.RIVER:
        this.gamePhase = gameConfig.PHASES.SHOWDOWN;
        break;
    }
    
    // Reset bets for the new betting round
    this.currentBet = 0;
    this.players.forEach(player => {
      if (player.isActive) {
        player.currentBet = 0;
      }
    });
    
    // Start with player after dealer
    this.moveToNextActivePlayer((this.dealerPosition) % this.players.length);
  }

  /**
   * End the current round and determine winners
   */
  endRound() {
    this.gamePhase = gameConfig.PHASES.SHOWDOWN;
    // Winner determination logic to be handled by HandEvaluator
    
    // Rotate dealer position for next round
    this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
  }
}

module.exports = Game; 