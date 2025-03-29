const cardUtils = require('../services/cardUtils');

describe('CardUtils', () => {
  describe('sortByValue', () => {
    test('should sort empty array', () => {
      expect(cardUtils.sortByValue([])).toEqual([]);
    });

    test('should sort single card', () => {
      const card = { suit: 'hearts', value: 'A' };
      expect(cardUtils.sortByValue([card])).toEqual([card]);
    });

    test('should sort multiple cards by value', () => {
      const cards = [
        { suit: 'hearts', value: '2' },
        { suit: 'diamonds', value: 'A' },
        { suit: 'clubs', value: 'K' }
      ];
      const sorted = cardUtils.sortByValue(cards);
      expect(sorted[0].value).toBe('A');
      expect(sorted[1].value).toBe('K');
      expect(sorted[2].value).toBe('2');
    });

    test('should handle cards with same value', () => {
      const cards = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: 'A' },
        { suit: 'clubs', value: 'A' }
      ];
      const sorted = cardUtils.sortByValue(cards);
      expect(sorted.length).toBe(3);
      expect(sorted.every(card => card.value === 'A')).toBe(true);
    });
  });

  describe('getUniqueValues', () => {
    test('should handle empty array', () => {
      expect(cardUtils.getUniqueValues([])).toEqual([]);
    });

    test('should get unique values from cards', () => {
      const cards = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: 'A' },
        { suit: 'clubs', value: 'K' }
      ];
      const values = cardUtils.getUniqueValues(cards);
      expect(values).toEqual([12, 11]); // A=12, K=11
    });

    test('should handle all same values', () => {
      const cards = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: 'A' },
        { suit: 'clubs', value: 'A' }
      ];
      const values = cardUtils.getUniqueValues(cards);
      expect(values).toEqual([12]);
    });
  });

  describe('groupBySuit', () => {
    test('should handle empty array', () => {
      expect(cardUtils.groupBySuit([])).toEqual({});
    });

    test('should group cards by suit', () => {
      const cards = [
        { suit: 'hearts', value: 'A' },
        { suit: 'hearts', value: 'K' },
        { suit: 'diamonds', value: 'Q' }
      ];
      const groups = cardUtils.groupBySuit(cards);
      expect(groups.hearts.length).toBe(2);
      expect(groups.diamonds.length).toBe(1);
    });
  });

  describe('getValueIndex', () => {
    test('should get correct index for number cards', () => {
      expect(cardUtils.getValueIndex('2')).toBe(0);
      expect(cardUtils.getValueIndex('10')).toBe(8);
    });

    test('should get correct index for face cards', () => {
      expect(cardUtils.getValueIndex('J')).toBe(9);
      expect(cardUtils.getValueIndex('Q')).toBe(10);
      expect(cardUtils.getValueIndex('K')).toBe(11);
    });

    test('should get correct index for Ace', () => {
      expect(cardUtils.getValueIndex('A')).toBe(12);
    });
  });

  describe('isConsecutive', () => {
    test('should handle empty array', () => {
      expect(cardUtils.isConsecutive([])).toBe(false);
    });

    test('should identify consecutive values', () => {
      expect(cardUtils.isConsecutive([12, 11, 10, 9, 8])).toBe(true);
    });

    test('should handle non-consecutive values', () => {
      expect(cardUtils.isConsecutive([12, 10, 8, 6, 4])).toBe(false);
    });
  });

  describe('isAceLowStraight', () => {
    test('should handle empty array', () => {
      expect(cardUtils.isAceLowStraight([])).toBe(false);
    });

    test('should identify Ace-low straight', () => {
      expect(cardUtils.isAceLowStraight([12, 0, 1, 2, 3])).toBe(true);
    });

    test('should handle non-Ace-low straight', () => {
      expect(cardUtils.isAceLowStraight([11, 10, 9, 8, 7])).toBe(false);
    });
  });

  describe('countValues', () => {
    test('should handle empty array', () => {
      expect(cardUtils.countValues([])).toEqual({});
    });

    test('should count card values', () => {
      const cards = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: 'A' },
        { suit: 'clubs', value: 'K' }
      ];
      const counts = cardUtils.countValues(cards);
      expect(counts['A']).toBe(2);
      expect(counts['K']).toBe(1);
    });
  });
}); 