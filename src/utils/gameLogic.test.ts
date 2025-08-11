import {
  calculateWinner,
  isDraw,
  isValidMove,
  makeMove,
  createEmptyBoard,
  getNextPlayer,
  isValidBoard,
  getMoveCount,
  getCurrentPlayer,
  WinnerResult,
} from './gameLogic';
import { Board } from '../types/game';

describe('gameLogic utilities', () => {
  describe('calculateWinner', () => {
    it('should return null winner for empty board', () => {
      const board: Board = Array(9).fill(null);
      const result: WinnerResult = calculateWinner(board);

      expect(result.winner).toBeNull();
      expect(result.winningLine).toBeNull();
    });

    it('should detect winner in top row', () => {
      const board: Board = ['X', 'X', 'X', null, null, null, null, null, null];
      const result = calculateWinner(board);

      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([0, 1, 2]);
    });

    it('should detect winner in middle row', () => {
      const board: Board = [null, null, null, 'O', 'O', 'O', null, null, null];
      const result = calculateWinner(board);

      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual([3, 4, 5]);
    });

    it('should detect winner in bottom row', () => {
      const board: Board = [null, null, null, null, null, null, 'X', 'X', 'X'];
      const result = calculateWinner(board);

      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([6, 7, 8]);
    });

    it('should detect winner in left column', () => {
      const board: Board = ['O', null, null, 'O', null, null, 'O', null, null];
      const result = calculateWinner(board);

      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual([0, 3, 6]);
    });

    it('should detect winner in middle column', () => {
      const board: Board = [null, 'X', null, null, 'X', null, null, 'X', null];
      const result = calculateWinner(board);

      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([1, 4, 7]);
    });

    it('should detect winner in right column', () => {
      const board: Board = [null, null, 'O', null, null, 'O', null, null, 'O'];
      const result = calculateWinner(board);

      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual([2, 5, 8]);
    });

    it('should detect winner in main diagonal', () => {
      const board: Board = ['X', null, null, null, 'X', null, null, null, 'X'];
      const result = calculateWinner(board);

      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([0, 4, 8]);
    });

    it('should detect winner in anti-diagonal', () => {
      const board: Board = [null, null, 'O', null, 'O', null, 'O', null, null];
      const result = calculateWinner(board);

      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual([2, 4, 6]);
    });

    it('should return null for incomplete winning line', () => {
      const board: Board = ['X', 'X', null, null, null, null, null, null, null];
      const result = calculateWinner(board);

      expect(result.winner).toBeNull();
      expect(result.winningLine).toBeNull();
    });

    it('should return null when no winner exists', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      const result = calculateWinner(board);

      expect(result.winner).toBeNull();
      expect(result.winningLine).toBeNull();
    });
  });

  describe('isDraw', () => {
    it('should return false for empty board', () => {
      const board: Board = Array(9).fill(null);
      expect(isDraw(board)).toBe(false);
    });

    it('should return false when there is a winner', () => {
      const board: Board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(isDraw(board)).toBe(false);
    });

    it('should return true when board is full with no winner', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(isDraw(board)).toBe(true);
    });

    it('should return false when board is not full and no winner', () => {
      const board: Board = ['X', 'O', 'X', 'O', null, 'O', 'O', 'X', 'O'];
      expect(isDraw(board)).toBe(false);
    });
  });

  describe('isValidMove', () => {
    const board: Board = ['X', null, 'O', null, null, null, null, null, null];

    it('should return true for empty square', () => {
      expect(isValidMove(board, 1)).toBe(true);
      expect(isValidMove(board, 3)).toBe(true);
      expect(isValidMove(board, 8)).toBe(true);
    });

    it('should return false for occupied square', () => {
      expect(isValidMove(board, 0)).toBe(false);
      expect(isValidMove(board, 2)).toBe(false);
    });

    it('should return false for out of bounds indices', () => {
      expect(isValidMove(board, -1)).toBe(false);
      expect(isValidMove(board, 9)).toBe(false);
      expect(isValidMove(board, 10)).toBe(false);
    });
  });

  describe('makeMove', () => {
    it('should create new board with move applied', () => {
      const board: Board = Array(9).fill(null);
      const newBoard = makeMove(board, 0, 'X');

      expect(newBoard[0]).toBe('X');
      expect(newBoard).not.toBe(board); // Should be a new array
      expect(board[0]).toBeNull(); // Original should be unchanged
    });

    it('should throw error for invalid move on occupied square', () => {
      const board: Board = [
        'X',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];

      expect(() => makeMove(board, 0, 'O')).toThrow(
        'Invalid move: square 0 is not available'
      );
    });

    it('should throw error for out of bounds move', () => {
      const board: Board = Array(9).fill(null);

      expect(() => makeMove(board, -1, 'X')).toThrow(
        'Invalid move: square -1 is not available'
      );
      expect(() => makeMove(board, 9, 'X')).toThrow(
        'Invalid move: square 9 is not available'
      );
    });
  });

  describe('createEmptyBoard', () => {
    it('should create board with 9 null values', () => {
      const board = createEmptyBoard();

      expect(board).toHaveLength(9);
      expect(board.every(square => square === null)).toBe(true);
    });

    it('should create new instance each time', () => {
      const board1 = createEmptyBoard();
      const board2 = createEmptyBoard();

      expect(board1).not.toBe(board2);
      expect(board1).toEqual(board2);
    });
  });

  describe('getNextPlayer', () => {
    it('should return O when current player is X', () => {
      expect(getNextPlayer('X')).toBe('O');
    });

    it('should return X when current player is O', () => {
      expect(getNextPlayer('O')).toBe('X');
    });
  });

  describe('isValidBoard', () => {
    it('should return true for valid empty board', () => {
      const board = Array(9).fill(null);
      expect(isValidBoard(board)).toBe(true);
    });

    it('should return true for valid board with moves', () => {
      const board = ['X', 'O', null, 'X', null, 'O', null, null, null];
      expect(isValidBoard(board)).toBe(true);
    });

    it('should return false for non-array', () => {
      expect(isValidBoard('not an array')).toBe(false);
      expect(isValidBoard(null)).toBe(false);
      expect(isValidBoard(undefined)).toBe(false);
      expect(isValidBoard({})).toBe(false);
    });

    it('should return false for wrong length array', () => {
      expect(isValidBoard(Array(8).fill(null))).toBe(false);
      expect(isValidBoard(Array(10).fill(null))).toBe(false);
    });

    it('should return false for invalid values', () => {
      const invalidBoard = ['X', 'Y', null, null, null, null, null, null, null];
      expect(isValidBoard(invalidBoard)).toBe(false);
    });

    it('should return false for array with invalid types', () => {
      const invalidBoard = ['X', 1, null, null, null, null, null, null, null];
      expect(isValidBoard(invalidBoard)).toBe(false);
    });
  });

  describe('getMoveCount', () => {
    it('should return 0 for empty board', () => {
      const board: Board = Array(9).fill(null);
      expect(getMoveCount(board)).toBe(0);
    });

    it('should return correct count for partially filled board', () => {
      const board: Board = ['X', 'O', null, 'X', null, null, null, null, null];
      expect(getMoveCount(board)).toBe(3);
    });

    it('should return 9 for full board', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(getMoveCount(board)).toBe(9);
    });
  });

  describe('getCurrentPlayer', () => {
    it('should return X for empty board (X starts first)', () => {
      const board: Board = Array(9).fill(null);
      expect(getCurrentPlayer(board)).toBe('X');
    });

    it('should return O after one move', () => {
      const board: Board = [
        'X',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(getCurrentPlayer(board)).toBe('O');
    });

    it('should return X after two moves', () => {
      const board: Board = ['X', 'O', null, null, null, null, null, null, null];
      expect(getCurrentPlayer(board)).toBe('X');
    });

    it('should return O after three moves', () => {
      const board: Board = ['X', 'O', 'X', null, null, null, null, null, null];
      expect(getCurrentPlayer(board)).toBe('O');
    });

    it('should handle full board correctly', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      // Count: X=5, O=4, so 9 total moves. After 9 moves (odd), next should be O
      expect(getCurrentPlayer(board)).toBe('O'); // 9 moves made, O would be next
    });
  });
});
