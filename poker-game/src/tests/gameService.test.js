const gameService = require('../services/gameService');

describe('GameService', () => {
  describe('createDeck', () => {
    test('should create complete deck', () => {
      const deck = gameService.createDeck();
      expect(deck.length).toBe(52);
    });

    test('should have all suits', () => {
      const deck = gameService.createDeck();
      const suits = new Set(deck.map(card => card.suit));
      expect(suits.size).toBe(4);
    });

    test('should have all values', () => {
      const deck = gameService.createDeck();
      const values = new Set(deck.map(card => card.value));
      expect(values.size).toBe(13);
    });
  });

  describe('shuffleDeck', () => {
    test('should maintain deck size', () => {
      const deck = gameService.createDeck();
      const shuffled = gameService.shuffleDeck([...deck]);
      expect(shuffled.length).toBe(deck.length);
    });

    test('should contain all cards', () => {
      const deck = gameService.createDeck();
      const shuffled = gameService.shuffleDeck([...deck]);
      const deckSet = new Set(deck.map(card => `${card.suit}-${card.value}`));
      const shuffledSet = new Set(shuffled.map(card => `${card.suit}-${card.value}`));
      expect(deckSet).toEqual(shuffledSet);
    });
  });

  describe('dealCards', () => {
    test('should deal correct number of cards', () => {
      const deck = gameService.createDeck();
      const dealt = gameService.dealCards(deck, 5);
      expect(dealt.length).toBe(5);
      expect(deck.length).toBe(47);
    });

    test('should handle empty deck', () => {
      const deck = [];
      const dealt = gameService.dealCards(deck, 5);
      expect(dealt.length).toBe(0);
    });
  });

  describe('Hand Evaluation', () => {
    describe('isRoyalFlush', () => {
      test('should identify royal flush', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'hearts', value: 'K' },
          { suit: 'hearts', value: 'Q' },
          { suit: 'hearts', value: 'J' },
          { suit: 'hearts', value: '10' }
        ];
        expect(gameService.isRoyalFlush(cards)).toBe(true);
      });

      test('should reject non-royal flush', () => {
        const cards = [
          { suit: 'hearts', value: 'K' },
          { suit: 'hearts', value: 'Q' },
          { suit: 'hearts', value: 'J' },
          { suit: 'hearts', value: '10' },
          { suit: 'hearts', value: '9' }
        ];
        expect(gameService.isRoyalFlush(cards)).toBe(false);
      });
    });

    describe('isStraightFlush', () => {
      test('should identify straight flush', () => {
        const cards = [
          { suit: 'hearts', value: '9' },
          { suit: 'hearts', value: '8' },
          { suit: 'hearts', value: '7' },
          { suit: 'hearts', value: '6' },
          { suit: 'hearts', value: '5' }
        ];
        expect(gameService.isStraightFlush(cards)).toBe(true);
      });

      test('should reject non-straight flush', () => {
        const cards = [
          { suit: 'hearts', value: '9' },
          { suit: 'hearts', value: '8' },
          { suit: 'hearts', value: '7' },
          { suit: 'hearts', value: '6' },
          { suit: 'diamonds', value: '5' }
        ];
        expect(gameService.isStraightFlush(cards)).toBe(false);
      });
    });

    describe('isFourOfAKind', () => {
      test('should identify four of a kind', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'A' },
          { suit: 'spades', value: 'A' },
          { suit: 'hearts', value: 'K' }
        ];
        expect(gameService.isFourOfAKind(cards)).toBe(true);
      });

      test('should reject non-four of a kind', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'A' },
          { suit: 'spades', value: 'K' },
          { suit: 'hearts', value: 'Q' }
        ];
        expect(gameService.isFourOfAKind(cards)).toBe(false);
      });
    });

    describe('isFullHouse', () => {
      test('should identify full house', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'A' },
          { suit: 'spades', value: 'K' },
          { suit: 'hearts', value: 'K' }
        ];
        expect(gameService.isFullHouse(cards)).toBe(true);
      });

      test('should reject non-full house', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'A' },
          { suit: 'spades', value: 'K' },
          { suit: 'hearts', value: 'Q' }
        ];
        expect(gameService.isFullHouse(cards)).toBe(false);
      });
    });

    describe('isFlush', () => {
      test('should identify flush', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'hearts', value: '8' },
          { suit: 'hearts', value: '6' },
          { suit: 'hearts', value: '4' },
          { suit: 'hearts', value: '2' }
        ];
        expect(gameService.isFlush(cards)).toBe(true);
      });

      test('should reject non-flush', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'hearts', value: '8' },
          { suit: 'hearts', value: '6' },
          { suit: 'hearts', value: '4' },
          { suit: 'diamonds', value: '2' }
        ];
        expect(gameService.isFlush(cards)).toBe(false);
      });
    });

    describe('isStraight', () => {
      test('should identify straight', () => {
        const cards = [
          { suit: 'hearts', value: '9' },
          { suit: 'diamonds', value: '8' },
          { suit: 'clubs', value: '7' },
          { suit: 'spades', value: '6' },
          { suit: 'hearts', value: '5' }
        ];
        expect(gameService.isStraight(cards)).toBe(true);
      });

      test('should identify Ace-low straight', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: '2' },
          { suit: 'clubs', value: '3' },
          { suit: 'spades', value: '4' },
          { suit: 'hearts', value: '5' }
        ];
        expect(gameService.isStraight(cards)).toBe(true);
      });
    });

    describe('isThreeOfAKind', () => {
      test('should identify three of a kind', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'A' },
          { suit: 'spades', value: 'K' },
          { suit: 'hearts', value: 'Q' }
        ];
        expect(gameService.isThreeOfAKind(cards)).toBe(true);
      });

      test('should reject non-three of a kind', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'K' },
          { suit: 'spades', value: 'Q' },
          { suit: 'hearts', value: 'J' }
        ];
        expect(gameService.isThreeOfAKind(cards)).toBe(false);
      });
    });

    describe('isTwoPair', () => {
      test('should identify two pair', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'K' },
          { suit: 'spades', value: 'K' },
          { suit: 'hearts', value: 'Q' }
        ];
        expect(gameService.isTwoPair(cards)).toBe(true);
      });

      test('should reject non-two pair', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'K' },
          { suit: 'spades', value: 'Q' },
          { suit: 'hearts', value: 'J' }
        ];
        expect(gameService.isTwoPair(cards)).toBe(false);
      });
    });

    describe('isOnePair', () => {
      test('should identify one pair', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'A' },
          { suit: 'clubs', value: 'K' },
          { suit: 'spades', value: 'Q' },
          { suit: 'hearts', value: 'J' }
        ];
        expect(gameService.isOnePair(cards)).toBe(true);
      });

      test('should reject non-pair', () => {
        const cards = [
          { suit: 'hearts', value: 'A' },
          { suit: 'diamonds', value: 'K' },
          { suit: 'clubs', value: 'Q' },
          { suit: 'spades', value: 'J' },
          { suit: 'hearts', value: '10' }
        ];
        expect(gameService.isOnePair(cards)).toBe(false);
      });
    });
  });

  describe('Game Logic', () => {
    describe('determineWinner', () => {
      test('should determine winner with different hands', () => {
        const players = [
          { id: 1, cards: [
            { suit: 'hearts', value: 'A' },
            { suit: 'diamonds', value: 'A' }
          ]},
          { id: 2, cards: [
            { suit: 'clubs', value: 'K' },
            { suit: 'spades', value: 'K' }
          ]}
        ];
        const communityCards = [
          { suit: 'hearts', value: 'Q' },
          { suit: 'diamonds', value: 'J' },
          { suit: 'clubs', value: '10' }
        ];
        const winner = gameService.determineWinner(players, communityCards);
        expect(winner.id).toBe(1);
      });
    });

    describe('calculatePotDistribution', () => {
      test('should distribute pot among winners', () => {
        const players = [
          { id: 1, cards: [
            { suit: 'hearts', value: 'A' },
            { suit: 'diamonds', value: 'A' }
          ], isActive: true },
          { id: 2, cards: [
            { suit: 'clubs', value: 'A' },
            { suit: 'spades', value: 'A' }
          ], isActive: true }
        ];
        const communityCards = [
          { suit: 'hearts', value: 'Q' },
          { suit: 'diamonds', value: 'J' },
          { suit: 'clubs', value: '10' }
        ];
        const distribution = gameService.calculatePotDistribution(players, communityCards, 100);
        expect(distribution.length).toBe(2);
        expect(distribution[0].amount).toBe(50);
        expect(distribution[1].amount).toBe(50);
      });
    });
  });
}); 