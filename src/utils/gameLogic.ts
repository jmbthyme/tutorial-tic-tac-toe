import { Board, Player } from '../types/game';
import { WINNING_COMBINATIONS, BOARD_SIZE } from '../constants/game';

/**
 * Result of winner calculation including winner and winning line
 */
export interface WinnerResult {
  winner: Player | null;
  winningLine: number[] | null;
}

/**
 * Calculates the winner of the game and returns the winning line
 * @param squares - Current board state
 * @returns Object containing winner and winning line indices
 */
export function calculateWinner(squares: Board): WinnerResult {
  for (const line of WINNING_COMBINATIONS) {
    const [a, b, c] = line;

    if (
      a !== undefined &&
      b !== undefined &&
      c !== undefined &&
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return {
        winner: squares[a] as Player,
        winningLine: line,
      };
    }
  }

  return {
    winner: null,
    winningLine: null,
  };
}

/**
 * Checks if the game is a draw (all squares filled with no winner)
 * @param squares - Current board state
 * @returns True if the game is a draw
 */
export function isDraw(squares: Board): boolean {
  const { winner } = calculateWinner(squares);
  return !winner && squares.every(square => square !== null);
}

/**
 * Checks if a move is valid (square is empty and within bounds)
 * @param squares - Current board state
 * @param index - Square index to check
 * @returns True if the move is valid
 */
export function isValidMove(squares: Board, index: number): boolean {
  return index >= 0 && index < BOARD_SIZE && squares[index] === null;
}

/**
 * Creates a new board with a move applied
 * @param squares - Current board state
 * @param index - Square index to place the move
 * @param player - Player making the move
 * @returns New board state with the move applied
 */
export function makeMove(squares: Board, index: number, player: Player): Board {
  if (!isValidMove(squares, index)) {
    throw new Error(`Invalid move: square ${index} is not available`);
  }

  const newSquares = [...squares];
  newSquares[index] = player;
  return newSquares;
}

/**
 * Creates an empty board
 * @returns New empty board
 */
export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(null);
}

/**
 * Gets the next player
 * @param currentPlayer - Current player
 * @returns Next player
 */
export function getNextPlayer(currentPlayer: Player): Player {
  return currentPlayer === 'X' ? 'O' : 'X';
}

/**
 * Validates that a board has the correct structure
 * @param squares - Board to validate
 * @returns True if the board is valid
 */
export function isValidBoard(squares: unknown): squares is Board {
  return (
    Array.isArray(squares) &&
    squares.length === BOARD_SIZE &&
    squares.every(square => square === null || square === 'X' || square === 'O')
  );
}

/**
 * Counts the number of moves made on the board
 * @param squares - Current board state
 * @returns Number of moves made
 */
export function getMoveCount(squares: Board): number {
  return squares.filter(square => square !== null).length;
}

/**
 * Determines the current player based on move count
 * @param squares - Current board state
 * @returns Current player who should make the next move ('X' starts first)
 */
export function getCurrentPlayer(squares: Board): Player {
  const moveCount = getMoveCount(squares);
  return moveCount % 2 === 0 ? 'X' : 'O';
}
