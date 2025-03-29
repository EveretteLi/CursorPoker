# Poker Game Test Cases Documentation

## CardUtils Test Cases

### sortByValue
- Empty array
- Single card
- Multiple cards in random order
- Multiple cards with same value
- All cards of same value
- Edge cases (Ace high/low)

### getUniqueValues
- Empty array
- Single card
- Multiple cards with unique values
- Multiple cards with duplicate values
- All cards of same value
- Edge cases (Ace high/low)

### groupBySuit
- Empty array
- Single card
- Multiple cards of same suit
- Multiple cards of different suits
- All cards of same suit
- All cards of different suits

### getValueIndex
- Valid card values (2-10)
- Face cards (J, Q, K)
- Ace
- Invalid value
- Edge cases

### isConsecutive
- Empty array
- Single value
- Two consecutive values
- Three consecutive values
- Four consecutive values
- Five consecutive values
- Non-consecutive values
- Gap in sequence
- Edge cases

### isAceLowStraight
- Empty array
- No Ace
- Ace but no low straight
- Complete Ace-low straight
- Ace-low straight with extra cards
- Edge cases

### countValues
- Empty array
- Single card
- Multiple cards of same value
- Multiple cards of different values
- All cards of same value
- Edge cases

## GameService Test Cases

### createDeck
- Creates complete deck (52 cards)
- All suits present
- All values present
- No duplicate cards
- Correct card structure

### shuffleDeck
- Empty deck
- Single card
- Multiple cards
- All cards present after shuffle
- No duplicate cards after shuffle
- Different shuffles produce different orders

### dealCards
- Empty deck
- Deal 1 card
- Deal multiple cards
- Deal all cards
- Deal more cards than available
- Edge cases

### evaluateHand
- Empty hands
- Single card
- Two cards
- Complete hand (5 cards)
- Complete hand with community cards
- Edge cases

### Hand Evaluation Tests

#### isRoyalFlush
- Empty hand
- Single card
- Straight flush but not royal
- Royal flush
- Royal flush with extra cards
- Edge cases

#### isStraightFlush
- Empty hand
- Single card
- Flush but not straight
- Straight but not flush
- Straight flush
- Straight flush with extra cards
- Edge cases

#### isFourOfAKind
- Empty hand
- Single card
- Two of a kind
- Three of a kind
- Four of a kind
- Four of a kind with extra cards
- Edge cases

#### isFullHouse
- Empty hand
- Single card
- Two of a kind
- Three of a kind
- Full house
- Full house with extra cards
- Edge cases

#### isFlush
- Empty hand
- Single card
- Two cards of same suit
- Four cards of same suit
- Five cards of same suit
- Flush with extra cards
- Edge cases

#### isStraight
- Empty hand
- Single card
- Two consecutive cards
- Four consecutive cards
- Five consecutive cards
- Ace-low straight
- Straight with extra cards
- Edge cases

#### isThreeOfAKind
- Empty hand
- Single card
- Two of a kind
- Three of a kind
- Three of a kind with extra cards
- Edge cases

#### isTwoPair
- Empty hand
- Single card
- One pair
- Two pairs
- Two pairs with extra cards
- Edge cases

#### isOnePair
- Empty hand
- Single card
- One pair
- One pair with extra cards
- Edge cases

### Game Logic Tests

#### determineWinner
- Single player
- Two players with different hands
- Two players with same hand
- Multiple players with different hands
- Multiple players with same hand
- Edge cases

#### calculatePotDistribution
- Single winner
- Multiple winners
- Empty pot
- Large pot
- Edge cases

#### determineWinners
- Single player
- Two players with different hands
- Two players with same hand
- Multiple players with different hands
- Multiple players with same hand
- Edge cases 