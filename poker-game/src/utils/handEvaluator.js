const cardUtils = require('./cardUtils');

/**
 * Hand rankings enum
 */
const HandRankings = {
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

/**
 * Evaluates a poker hand based on player cards and community cards
 * @param {Array} playerCards Array of player's cards
 * @param {Array} communityCards Array of community cards
 * @returns {Object} Hand ranking and name
 */
const evaluateHand = (playerCards, communityCards) => {
  const allCards = [...playerCards, ...communityCards];
  return getHandRank(allCards);
};

/**
 * Determines the best possible hand from a set of cards
 * @param {Array} cards Array of card objects
 * @returns {Object} Hand ranking and name
 */
const getHandRank = (cards) => {
  // Check for different poker hands in order of rank
  if (isRoyalFlush(cards)) return HandRankings.ROYAL_FLUSH;
  if (isStraightFlush(cards)) return HandRankings.STRAIGHT_FLUSH;
  if (isFourOfAKind(cards)) return HandRankings.FOUR_OF_A_KIND;
  if (isFullHouse(cards)) return HandRankings.FULL_HOUSE;
  if (isFlush(cards)) return HandRankings.FLUSH;
  if (isStraight(cards)) return HandRankings.STRAIGHT;
  if (isThreeOfAKind(cards)) return HandRankings.THREE_OF_A_KIND;
  if (isTwoPair(cards)) return HandRankings.TWO_PAIR;
  if (isOnePair(cards)) return HandRankings.ONE_PAIR;
  return HandRankings.HIGH_CARD;
};

/**
 * Checks for a Royal Flush (Ace-high straight flush)
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is a Royal Flush
 */
const isRoyalFlush = (cards) => {
  const sortedCards = cardUtils.sortByValue(cards);
  return isStraightFlush(cards) && sortedCards[0].value === 'A';
};

/**
 * Checks for a Straight Flush (straight of the same suit)
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is a Straight Flush
 */
const isStraightFlush = (cards) => {
  const suitGroups = cardUtils.groupBySuit(cards);
  
  for (const suit in suitGroups) {
    if (suitGroups[suit].length >= 5) {
      const uniqueValues = cardUtils.getUniqueValues(suitGroups[suit]);
      if (cardUtils.isConsecutive(uniqueValues) || cardUtils.isAceLowStraight(uniqueValues)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Checks for Four of a Kind
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is Four of a Kind
 */
const isFourOfAKind = (cards) => {
  const valueCounts = cardUtils.countValues(cards);
  return Object.values(valueCounts).some(count => count >= 4);
};

/**
 * Checks for a Full House (three of a kind plus a pair)
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is a Full House
 */
const isFullHouse = (cards) => {
  const valueCounts = cardUtils.countValues(cards);
  const counts = Object.values(valueCounts);
  const hasThreeOfKind = counts.some(count => count >= 3);
  const hasPair = counts.some(count => count >= 2 && count < 3) || counts.filter(count => count >= 3).length > 1;
  
  return hasThreeOfKind && hasPair;
};

/**
 * Checks for a Flush (five cards of the same suit)
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is a Flush
 */
const isFlush = (cards) => {
  const suitGroups = cardUtils.groupBySuit(cards);
  return Object.values(suitGroups).some(suitCards => suitCards.length >= 5);
};

/**
 * Checks for a Straight (five consecutive cards)
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is a Straight
 */
const isStraight = (cards) => {
  const uniqueValues = cardUtils.getUniqueValues(cards);
  return cardUtils.isConsecutive(uniqueValues) || cardUtils.isAceLowStraight(uniqueValues);
};

/**
 * Checks for Three of a Kind
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is Three of a Kind
 */
const isThreeOfAKind = (cards) => {
  const valueCounts = cardUtils.countValues(cards);
  return Object.values(valueCounts).some(count => count >= 3);
};

/**
 * Checks for Two Pair
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is Two Pair
 */
const isTwoPair = (cards) => {
  const valueCounts = cardUtils.countValues(cards);
  const pairs = Object.values(valueCounts).filter(count => count >= 2);
  return pairs.length >= 2;
};

/**
 * Checks for One Pair
 * @param {Array} cards Array of card objects
 * @returns {boolean} True if hand is One Pair
 */
const isOnePair = (cards) => {
  const valueCounts = cardUtils.countValues(cards);
  return Object.values(valueCounts).some(count => count >= 2);
};

/**
 * Determines the winner among active players
 * @param {Array} players Array of player objects
 * @param {Array} communityCards Array of community cards
 * @returns {Array} Array of winning player objects (may be multiple in case of a tie)
 */
const determineWinners = (players, communityCards) => {
  if (!players || players.length === 0) return [];
  if (players.length === 1) return [players[0]];
  
  const activePlayers = players.filter(player => player.isActive);
  if (activePlayers.length === 0) return [];
  if (activePlayers.length === 1) return [activePlayers[0]];
  
  // Evaluate hands for all active players
  const playerRankings = activePlayers.map(player => ({
    player,
    handRank: evaluateHand(player.cards, communityCards)
  }));
  
  // Find the highest hand rank
  const highestRank = Math.max(...playerRankings.map(pr => pr.handRank.rank));
  
  // Filter players with the highest hand rank
  const winners = playerRankings
    .filter(pr => pr.handRank.rank === highestRank)
    .map(pr => pr.player);
  
  // TODO: Handle tiebreakers based on high card, kickers, etc.
  
  return winners;
};

/**
 * Calculate how the pot should be distributed among winners
 * @param {Array} players Array of all players
 * @param {Array} communityCards Array of community cards
 * @param {number} pot Total pot amount
 * @returns {Array} Array of {player, amount} showing pot distribution
 */
const calculatePotDistribution = (players, communityCards, pot) => {
  const winners = determineWinners(players, communityCards);
  if (winners.length === 0) return [];
  
  const amountPerWinner = Math.floor(pot / winners.length);
  const remainder = pot % winners.length;
  
  return winners.map((player, index) => ({
    player,
    amount: amountPerWinner + (index < remainder ? 1 : 0)
  }));
};

module.exports = {
  HandRankings,
  evaluateHand,
  getHandRank,
  isRoyalFlush,
  isStraightFlush,
  isFourOfAKind,
  isFullHouse,
  isFlush,
  isStraight,
  isThreeOfAKind,
  isTwoPair,
  isOnePair,
  determineWinners,
  calculatePotDistribution
}; 