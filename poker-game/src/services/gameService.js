const cardUtils = require('./cardUtils');

/**
 * GameService class handles all poker game logic including deck management,
 * hand evaluation, and game state management.
 */
class GameService {
  constructor() {
    // Define hand rankings and their values
    this.handRankings = {
      ROYAL_FLUSH: { rank: 10, name: 'Royal Flush' },
      STRAIGHT_FLUSH: { rank: 9, name: 'Straight Flush' },
      FOUR_OF_A_KIND: { rank: 8, name: 'Four of a Kind' },
      FULL_HOUSE: { rank: 7, name: 'Full House' },
      FLUSH: { rank: 6, name: 'Flush' },
      STRAIGHT: { rank: 5, name: 'Straight' },
      THREE_OF_A_KIND: { rank: 4, name: 'Three of a Kind' },
      TWO_PAIR: { rank: 3, name: 'Two Pair' },
      ONE_PAIR: { rank: 2, name: 'One Pair' },
      HIGH_CARD: { rank: 1, name: 'High Card' }
    };
  }

  /**
   * Creates and shuffles a new deck of cards
   * @returns {Array} Array of card objects
   */
  createDeck() {
    const deck = [];
    for (const suit of cardUtils.suits) {
      for (const value of cardUtils.values) {
        deck.push({ suit, value });
      }
    }
    return this.shuffleDeck(deck);
  }

  /**
   * Shuffles the deck using Fisher-Yates algorithm
   * @param {Array} deck Array of card objects
   * @returns {Array} Shuffled deck
   */
  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  /**
   * Deals a specified number of cards from the deck
   * @param {Array} deck Array of card objects
   * @param {number} numCards Number of cards to deal
   * @returns {Array} Array of dealt cards
   */
  dealCards(deck, numCards) {
    return deck.splice(0, numCards);
  }

  /**
   * Evaluates a poker hand based on player cards and community cards
   * @param {Array} playerCards Array of player's cards
   * @param {Array} communityCards Array of community cards
   * @returns {Object} Hand ranking and name
   */
  evaluateHand(playerCards, communityCards) {
    const allCards = [...playerCards, ...communityCards];
    return this.getHandRank(allCards);
  }

  /**
   * Determines the best possible hand from a set of cards
   * @param {Array} cards Array of card objects
   * @returns {Object} Hand ranking and name
   */
  getHandRank(cards) {
    // Check for different poker hands in order of rank
    if (this.isRoyalFlush(cards)) return this.handRankings.ROYAL_FLUSH;
    if (this.isStraightFlush(cards)) return this.handRankings.STRAIGHT_FLUSH;
    if (this.isFourOfAKind(cards)) return this.handRankings.FOUR_OF_A_KIND;
    if (this.isFullHouse(cards)) return this.handRankings.FULL_HOUSE;
    if (this.isFlush(cards)) return this.handRankings.FLUSH;
    if (this.isStraight(cards)) return this.handRankings.STRAIGHT;
    if (this.isThreeOfAKind(cards)) return this.handRankings.THREE_OF_A_KIND;
    if (this.isTwoPair(cards)) return this.handRankings.TWO_PAIR;
    if (this.isOnePair(cards)) return this.handRankings.ONE_PAIR;
    return this.handRankings.HIGH_CARD;
  }

  /**
   * Checks for a Royal Flush (Ace-high straight flush)
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is a Royal Flush
   */
  isRoyalFlush(cards) {
    return this.isStraightFlush(cards) && cards[0].value === 'A';
  }

  /**
   * Checks for a Straight Flush (straight of the same suit)
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is a Straight Flush
   */
  isStraightFlush(cards) {
    return this.isFlush(cards) && this.isStraight(cards);
  }

  /**
   * Checks for Four of a Kind
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is Four of a Kind
   */
  isFourOfAKind(cards) {
    const valueCounts = cardUtils.countValues(cards);
    return Object.values(valueCounts).some(count => count >= 4);
  }

  /**
   * Checks for a Full House (three of a kind plus a pair)
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is a Full House
   */
  isFullHouse(cards) {
    const valueCounts = cardUtils.countValues(cards);
    const counts = Object.values(valueCounts);
    return counts.includes(3) && counts.includes(2);
  }

  /**
   * Checks for a Flush (five cards of the same suit)
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is a Flush
   */
  isFlush(cards) {
    const suitGroups = cardUtils.groupBySuit(cards);
    return Object.values(suitGroups).some(suitCards => suitCards.length >= 5);
  }

  /**
   * Checks for a Straight (five consecutive cards)
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is a Straight
   */
  isStraight(cards) {
    const uniqueValues = cardUtils.getUniqueValues(cards);
    return cardUtils.isConsecutive(uniqueValues) || cardUtils.isAceLowStraight(uniqueValues);
  }

  /**
   * Checks for Three of a Kind
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is Three of a Kind
   */
  isThreeOfAKind(cards) {
    const valueCounts = cardUtils.countValues(cards);
    return Object.values(valueCounts).some(count => count >= 3);
  }

  /**
   * Checks for Two Pair
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is Two Pair
   */
  isTwoPair(cards) {
    const valueCounts = cardUtils.countValues(cards);
    const pairs = Object.values(valueCounts).filter(count => count >= 2);
    return pairs.length >= 2;
  }

  /**
   * Checks for One Pair
   * @param {Array} cards Array of card objects
   * @returns {boolean} True if hand is One Pair
   */
  isOnePair(cards) {
    const valueCounts = cardUtils.countValues(cards);
    return Object.values(valueCounts).some(count => count >= 2);
  }

  /**
   * Determines the winner among active players
   * @param {Array} players Array of player objects
   * @param {Array} communityCards Array of community cards
   * @returns {Object} Winning player object
   */
  determineWinner(players, communityCards) {
    let winner = players[0];
    let bestRank = this.evaluateHand(players[0].cards, communityCards);

    for (let i = 1; i < players.length; i++) {
      const currentRank = this.evaluateHand(players[i].cards, communityCards);
      if (currentRank.rank > bestRank.rank) {
        winner = players[i];
        bestRank = currentRank;
      }
    }

    return winner;
  }

  /**
   * Calculates the pot distribution among winners
   * @param {Array} players Array of player objects
   * @param {Array} communityCards Array of community cards
   * @param {number} pot Total pot amount
   * @returns {Object} Distribution of pot to winners
   */
  calculatePotDistribution(players, communityCards, pot) {
    const activePlayers = players.filter(p => p.isActive);
    const winners = this.determineWinners(activePlayers, communityCards);
    
    const shareAmount = pot / winners.length;
    return winners.map(winner => ({
      playerId: winner.id,
      amount: shareAmount
    }));
  }

  /**
   * Determines all winners in case of a tie
   * @param {Array} players Array of player objects
   * @param {Array} communityCards Array of community cards
   * @returns {Array} Array of winning player objects
   */
  determineWinners(players, communityCards) {
    const winners = [];
    let bestRank = { rank: 0 };

    for (const player of players) {
      const currentRank = this.evaluateHand(player.cards, communityCards);
      if (currentRank.rank > bestRank.rank) {
        winners.length = 0;
        winners.push(player);
        bestRank = currentRank;
      } else if (currentRank.rank === bestRank.rank) {
        winners.push(player);
      }
    }

    return winners;
  }
}

module.exports = new GameService(); 