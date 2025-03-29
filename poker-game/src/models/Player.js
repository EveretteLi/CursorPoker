const gameConfig = require('../config/gameConfig');

/**
 * Represents a player in the poker game
 */
class Player {
  /**
   * Create a new player
   * @param {string} id - The unique identifier for the player
   * @param {string} name - The display name of the player
   * @param {number} chips - The starting chip count
   */
  constructor(id, name, chips = gameConfig.STARTING_CHIPS) {
    this.id = id;
    this.name = name;
    this.chips = chips;
    this.cards = [];
    this.isActive = true;
    this.currentBet = 0;
  }

  /**
   * Add cards to the player's hand
   * @param {Array} cards - Cards to add to the player's hand
   */
  receiveCards(cards) {
    this.cards.push(...cards);
  }

  /**
   * Reset the player's hand
   */
  resetHand() {
    this.cards = [];
    this.isActive = true;
    this.currentBet = 0;
  }

  /**
   * Have the player place a bet
   * @param {number} amount - The amount to bet
   * @returns {number} The actual amount bet
   */
  placeBet(amount) {
    const actualBet = Math.min(amount, this.chips);
    this.chips -= actualBet;
    this.currentBet += actualBet;
    return actualBet;
  }

  /**
   * Make the player fold their hand
   */
  fold() {
    this.isActive = false;
  }

  /**
   * Award chips to the player (e.g., when winning a pot)
   * @param {number} amount - The amount of chips to add
   */
  receiveChips(amount) {
    this.chips += amount;
  }
}

module.exports = Player; 