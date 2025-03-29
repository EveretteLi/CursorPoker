/**
 * Represents a playing card
 */
class Card {
  /**
   * Create a new card
   * @param {string} suit - The suit of the card (hearts, diamonds, clubs, spades)
   * @param {string} value - The value of the card (2-10, J, Q, K, A)
   */
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  /**
   * Get the display representation of the card
   * @returns {string} The formatted card representation
   */
  toString() {
    return `${this.value} of ${this.suit}`;
  }
}

module.exports = Card; 