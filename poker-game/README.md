# Texas Hold'em Poker Game Backend

A real-time Texas Hold'em poker game backend built with Express and Socket.io.

## Features

- Real-time game updates using Socket.io
- Support for multiple game rooms
- Texas Hold'em poker rules implementation
- Player actions (fold, check, call, raise)
- Hand evaluation
- Winner determination

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd poker-game
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PORT=3000
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### WebSocket Events

#### Client to Server
- `createGame`: Create a new game room
- `joinGame`: Join an existing game room
- `playerAction`: Perform a game action (fold, check, call, raise)

#### Server to Client
- `gameCreated`: Emitted when a new game is created
- `playerJoined`: Emitted when a new player joins the game
- `playerFolded`: Emitted when a player folds
- `playerChecked`: Emitted when a player checks
- `playerCalled`: Emitted when a player calls
- `playerRaised`: Emitted when a player raises
- `turnChanged`: Emitted when the current player's turn changes
- `gameEnded`: Emitted when the game ends

## Game Rules

1. Each player starts with 1000 chips
2. Maximum 9 players per game
3. Standard Texas Hold'em rules apply
4. Betting rounds: Pre-flop, Flop, Turn, River
5. Hand evaluation follows standard poker hand rankings

## Example Usage

```javascript
// Client-side connection
const socket = io('http://localhost:3000');

// Create a new game
socket.emit('createGame');

// Join an existing game
socket.emit('joinGame', {
  gameId: 'game-id',
  playerName: 'Player 1'
});

// Perform an action
socket.emit('playerAction', {
  gameId: 'game-id',
  action: 'raise',
  amount: 100
});
``` 