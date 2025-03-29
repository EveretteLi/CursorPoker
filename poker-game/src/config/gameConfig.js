/**
 * Game configuration settings
 */

module.exports = {
  // Player limits
  MAX_PLAYERS: 9,
  MIN_PLAYERS: 2,
  
  // Default chip values
  STARTING_CHIPS: 1000,
  
  // Blind settings
  SMALL_BLIND: 5,
  BIG_BLIND: 10,
  
  // Game timing (in milliseconds)
  PLAYER_TURN_TIMEOUT: 30000,  // 30 seconds to make a decision
  PHASE_TRANSITION_DELAY: 1000, // 1 second delay between phases
  ROUND_END_DELAY: 5000,       // 5 seconds at the end of a round
  
  // Game phases
  PHASES: {
    WAITING: 'waiting',
    PRE_FLOP: 'pre-flop',
    FLOP: 'flop',
    TURN: 'turn',
    RIVER: 'river',
    SHOWDOWN: 'showdown'
  }
}; 