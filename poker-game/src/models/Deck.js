const Card = require('./Card');

/**
 * Represents a deck of playing cards
 */
class Deck {
  /**
   * Create a new deck of cards
   */
  constructor() {
    this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    this.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.cards = this.createDeck();
  }

  /**
   * Creates a new deck of cards
   * @returns {Array} Array of card objects
   */
  createDeck() {
    const deck = [];
    for (const suit of this.suits) {
      for (const value of this.values) {
        deck.push(new Card(suit, value));
      }
    }
    return this.shuffle(deck);
  }

  /**
   * Shuffles the deck using Fisher-Yates algorithm
   * @param {Array} deck Array of card objects
   * @returns {Array} Shuffled deck
   */
  shuffle(deck = this.cards) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  /**
   * Deals a specified number of cards from the deck
   * @param {number} numCards Number of cards to deal
   * @returns {Array} Array of dealt cards
   */
  dealCards(numCards) {
    return this.cards.splice(0, numCards);
  }

  /**
   * Reset the deck to a full, shuffled state
   */
  reset() {
    this.cards = this.createDeck();
  }

  /**
   * Get the number of cards remaining in the deck
   * @returns {number} Number of cards in the deck
   */
  cardsRemaining() {
    return this.cards.length;
  }
}

module.exports = Deck; 