/**
 * Utility class for common card operations
 */
class CardUtils {
  constructor() {
    this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    this.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  }

  /**
   * Sorts cards by value in descending order
   * @param {Array} cards Array of card objects
   * @returns {Array} Sorted cards array
   */
  sortByValue(cards) {
    return [...cards].sort((a, b) => this.values.indexOf(b.value) - this.values.indexOf(a.value));
  }

  /**
   * Gets unique card values in descending order
   * @param {Array} cards Array of card objects
   * @returns {Array} Array of unique value indices
   */
  getUniqueValues(cards) {
    return [...new Set(cards.map(card => this.values.indexOf(card.value)))].sort((a, b) => b - a);
  }

  /**
   * Groups cards by suit
   * @param {Array} cards Array of card objects
   * @returns {Object} Object with suits as keys and arrays of cards as values
   */
  groupBySuit(cards) {
    const suitGroups = {};
    cards.forEach(card => {
      if (!suitGroups[card.suit]) {
        suitGroups[card.suit] = [];
      }
      suitGroups[card.suit].push(card);
    });
    return suitGroups;
  }

  /**
   * Gets the numeric value of a card
   * @param {string} value Card value (2-10, J, Q, K, A)
   * @returns {number} Numeric value of the card
   */
  getValueIndex(value) {
    return this.values.indexOf(value);
  }

  /**
   * Checks if a set of values forms a straight
   * @param {Array} values Array of numeric values
   * @returns {boolean} True if values form a straight
   */
  isConsecutive(values) {
    for (let i = 0; i <= values.length - 5; i++) {
      if (values[i] - values[i + 4] === 4) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if a set of values forms an Ace-low straight
   * @param {Array} values Array of numeric values
   * @returns {boolean} True if values form an Ace-low straight
   */
  isAceLowStraight(values) {
    if (values.includes(12)) { // Ace is at index 12
      const lowStraight = [12, 0, 1, 2, 3];
      return lowStraight.every(val => values.includes(val));
    }
    return false;
  }

  /**
   * Counts occurrences of each value in a set of cards
   * @param {Array} cards Array of card objects
   * @returns {Object} Object with card values as keys and counts as values
   */
  countValues(cards) {
    const counts = {};
    cards.forEach(card => {
      counts[card.value] = (counts[card.value] || 0) + 1;
    });
    return counts;
  }
}

module.exports = new CardUtils(); 