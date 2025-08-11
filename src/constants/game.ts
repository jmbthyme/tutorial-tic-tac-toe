// Winning combinations for tic-tac-toe (indices of squares that form a winning line)
export const WINNING_COMBINATIONS: number[][] = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

// Game configuration constants
export const BOARD_SIZE = 9;
export const INITIAL_PLAYER = 'X' as const;
export const PLAYERS = ['X', 'O'] as const;

// Game messages
export const GAME_MESSAGES = {
  WINNER: (player: string) => `Winner: ${player}`,
  NEXT_PLAYER: (player: string) => `Next player: ${player}`,
  DRAW: 'Game is a draw!',
  RESET: 'Reset Game',
} as const;
