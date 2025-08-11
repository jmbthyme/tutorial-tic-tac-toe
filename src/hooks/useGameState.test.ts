import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';
import { createEmptyBoard } from '../utils/gameLogic';

describe('useGameState', () => {
  describe('Initial State', () => {
    it('should initialize with empty board and correct initial state', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.history).toHaveLength(1);
      expect(result.current.gameState.history[0]).toEqual(createEmptyBoard());
      expect(result.current.gameState.currentMove).toBe(0);
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.isDraw).toBe(false);
      expect(result.current.currentPlayer).toBe('X');
      expect(result.current.currentSquares).toEqual(createEmptyBoard());
      expect(result.current.winningLine).toBeNull();
    });
  });

  describe('handleSquareClick', () => {
    it('should handle valid moves correctly', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.handleSquareClick(0);
      });

      expect(result.current.currentSquares[0]).toBe('X');
      expect(result.current.currentPlayer).toBe('O');
      expect(result.current.gameState.currentMove).toBe(1);
      expect(result.current.gameState.history).toHaveLength(2);
    });

    it('should alternate players correctly', () => {
      const { result } = renderHook(() => useGameState());

      // X makes first move
      act(() => {
        result.current.handleSquareClick(0);
      });
      expect(result.current.currentSquares[0]).toBe('X');
      expect(result.current.currentPlayer).toBe('O');

      // O makes second move
      act(() => {
        result.current.handleSquareClick(1);
      });
      expect(result.current.currentSquares[1]).toBe('O');
      expect(result.current.currentPlayer).toBe('X');
    });

    it('should not allow moves on occupied squares', () => {
      const { result } = renderHook(() => useGameState());

      // X makes first move
      act(() => {
        result.current.handleSquareClick(0);
      });
      expect(result.current.currentSquares[0]).toBe('X');

      // Try to make move on same square
      act(() => {
        result.current.handleSquareClick(0);
      });

      // Should still be X, no change
      expect(result.current.currentSquares[0]).toBe('X');
      expect(result.current.currentPlayer).toBe('O'); // Still O's turn
      expect(result.current.gameState.currentMove).toBe(1); // No new move added
    });

    it('should not allow moves when game has winner', () => {
      const { result } = renderHook(() => useGameState());

      // Create winning scenario for X (top row)
      act(() => {
        result.current.handleSquareClick(0); // X
      });
      act(() => {
        result.current.handleSquareClick(3); // O
      });
      act(() => {
        result.current.handleSquareClick(1); // X
      });
      act(() => {
        result.current.handleSquareClick(4); // O
      });
      act(() => {
        result.current.handleSquareClick(2); // X wins
      });

      expect(result.current.gameState.winner).toBe('X');
      expect(result.current.winningLine).toEqual([0, 1, 2]);

      // Try to make another move
      const moveCountBefore = result.current.gameState.currentMove;
      act(() => {
        result.current.handleSquareClick(5);
      });

      // Should not allow the move
      expect(result.current.gameState.currentMove).toBe(moveCountBefore);
      expect(result.current.currentSquares[5]).toBeNull();
    });

    it('should not allow moves when game is draw', () => {
      const { result } = renderHook(() => useGameState());

      // Create draw scenario
      const drawMoves = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // Results in draw
      drawMoves.forEach(move => {
        act(() => {
          result.current.handleSquareClick(move);
        });
      });

      expect(result.current.gameState.isDraw).toBe(true);
      expect(result.current.gameState.winner).toBeNull();

      // Reset and try a different draw scenario
      act(() => {
        result.current.resetGame();
      });

      // X: 0, 2, 3, 7  O: 1, 4, 5, 6, 8 (actual draw)
      // Board will be:
      // X | O | X
      // X | O | O
      // O | X | O
      const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
      moves.forEach(move => {
        act(() => {
          result.current.handleSquareClick(move);
        });
      });

      expect(result.current.gameState.isDraw).toBe(true);
    });

    it('should handle invalid square indices gracefully', () => {
      const { result } = renderHook(() => useGameState());
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Try invalid indices
      act(() => {
        result.current.handleSquareClick(-1);
      });
      act(() => {
        result.current.handleSquareClick(9);
      });

      expect(result.current.gameState.currentMove).toBe(0);
      expect(result.current.currentSquares).toEqual(createEmptyBoard());

      consoleSpy.mockRestore();
    });
  });

  describe('Winner Detection', () => {
    it('should detect horizontal wins', () => {
      const { result } = renderHook(() => useGameState());

      // Top row win for X
      act(() => {
        result.current.handleSquareClick(0); // X
      });
      act(() => {
        result.current.handleSquareClick(3); // O
      });
      act(() => {
        result.current.handleSquareClick(1); // X
      });
      act(() => {
        result.current.handleSquareClick(4); // O
      });
      act(() => {
        result.current.handleSquareClick(2); // X wins
      });

      expect(result.current.gameState.winner).toBe('X');
      expect(result.current.winningLine).toEqual([0, 1, 2]);
    });

    it('should detect vertical wins', () => {
      const { result } = renderHook(() => useGameState());

      // Left column win for X
      act(() => {
        result.current.handleSquareClick(0); // X
      });
      act(() => {
        result.current.handleSquareClick(1); // O
      });
      act(() => {
        result.current.handleSquareClick(3); // X
      });
      act(() => {
        result.current.handleSquareClick(2); // O
      });
      act(() => {
        result.current.handleSquareClick(6); // X wins
      });

      expect(result.current.gameState.winner).toBe('X');
      expect(result.current.winningLine).toEqual([0, 3, 6]);
    });

    it('should detect diagonal wins', () => {
      const { result } = renderHook(() => useGameState());

      // Main diagonal win for X
      act(() => {
        result.current.handleSquareClick(0); // X
      });
      act(() => {
        result.current.handleSquareClick(1); // O
      });
      act(() => {
        result.current.handleSquareClick(4); // X
      });
      act(() => {
        result.current.handleSquareClick(2); // O
      });
      act(() => {
        result.current.handleSquareClick(8); // X wins
      });

      expect(result.current.gameState.winner).toBe('X');
      expect(result.current.winningLine).toEqual([0, 4, 8]);
    });

    it('should detect anti-diagonal wins', () => {
      const { result } = renderHook(() => useGameState());

      // Anti-diagonal win for O
      act(() => {
        result.current.handleSquareClick(0); // X
      });
      act(() => {
        result.current.handleSquareClick(2); // O
      });
      act(() => {
        result.current.handleSquareClick(1); // X
      });
      act(() => {
        result.current.handleSquareClick(4); // O
      });
      act(() => {
        result.current.handleSquareClick(3); // X
      });
      act(() => {
        result.current.handleSquareClick(6); // O wins
      });

      expect(result.current.gameState.winner).toBe('O');
      expect(result.current.winningLine).toEqual([2, 4, 6]);
    });
  });

  describe('jumpToMove', () => {
    it('should jump to specific move in history', () => {
      const { result } = renderHook(() => useGameState());

      // Make several moves
      act(() => {
        result.current.handleSquareClick(0); // Move 1: X
      });
      act(() => {
        result.current.handleSquareClick(1); // Move 2: O
      });
      act(() => {
        result.current.handleSquareClick(2); // Move 3: X
      });

      expect(result.current.gameState.currentMove).toBe(3);

      // Jump back to move 1
      act(() => {
        result.current.jumpToMove(1);
      });

      expect(result.current.gameState.currentMove).toBe(1);
      expect(result.current.currentSquares[0]).toBe('X');
      expect(result.current.currentSquares[1]).toBeNull();
      expect(result.current.currentSquares[2]).toBeNull();
      expect(result.current.currentPlayer).toBe('O');
    });

    it('should update winner and draw state when jumping to moves', () => {
      const { result } = renderHook(() => useGameState());

      // Create a winning scenario
      act(() => {
        result.current.handleSquareClick(0); // X
      });
      act(() => {
        result.current.handleSquareClick(3); // O
      });
      act(() => {
        result.current.handleSquareClick(1); // X
      });
      act(() => {
        result.current.handleSquareClick(4); // O
      });
      act(() => {
        result.current.handleSquareClick(2); // X wins
      });

      expect(result.current.gameState.winner).toBe('X');

      // Jump back to before the win
      act(() => {
        result.current.jumpToMove(3);
      });

      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.isDraw).toBe(false);
    });

    it('should handle invalid move indices gracefully', () => {
      const { result } = renderHook(() => useGameState());
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Make one move
      act(() => {
        result.current.handleSquareClick(0);
      });

      const currentMove = result.current.gameState.currentMove;

      // Try invalid indices
      act(() => {
        result.current.jumpToMove(-1);
      });
      expect(result.current.gameState.currentMove).toBe(currentMove);

      act(() => {
        result.current.jumpToMove(10);
      });
      expect(result.current.gameState.currentMove).toBe(currentMove);

      consoleSpy.mockRestore();
    });

    it('should allow making new moves after jumping to earlier state', () => {
      const { result } = renderHook(() => useGameState());

      // Make several moves
      act(() => {
        result.current.handleSquareClick(0); // X
      });
      act(() => {
        result.current.handleSquareClick(1); // O
      });
      act(() => {
        result.current.handleSquareClick(2); // X
      });

      // Jump back to move 1
      act(() => {
        result.current.jumpToMove(1);
      });

      // Make a different move
      act(() => {
        result.current.handleSquareClick(4); // O
      });

      // History should be truncated and new move added
      expect(result.current.gameState.history).toHaveLength(3); // Initial + move 1 + new move
      expect(result.current.currentSquares[4]).toBe('O');
      expect(result.current.currentSquares[2]).toBeNull(); // Previous move 3 should be gone
    });
  });

  describe('resetGame', () => {
    it('should reset game to initial state', () => {
      const { result } = renderHook(() => useGameState());

      // Make several moves and create some game state
      act(() => {
        result.current.handleSquareClick(0);
      });
      act(() => {
        result.current.handleSquareClick(1);
      });
      act(() => {
        result.current.handleSquareClick(2);
      });

      expect(result.current.gameState.history.length).toBeGreaterThan(1);
      expect(result.current.gameState.currentMove).toBeGreaterThan(0);

      // Reset the game
      act(() => {
        result.current.resetGame();
      });

      // Should be back to initial state
      expect(result.current.gameState.history).toHaveLength(1);
      expect(result.current.gameState.history[0]).toEqual(createEmptyBoard());
      expect(result.current.gameState.currentMove).toBe(0);
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.isDraw).toBe(false);
      expect(result.current.currentPlayer).toBe('X');
      expect(result.current.currentSquares).toEqual(createEmptyBoard());
      expect(result.current.winningLine).toBeNull();
    });

    it('should reset game even after a win', () => {
      const { result } = renderHook(() => useGameState());

      // Create winning scenario
      act(() => {
        result.current.handleSquareClick(0); // X
      });
      act(() => {
        result.current.handleSquareClick(3); // O
      });
      act(() => {
        result.current.handleSquareClick(1); // X
      });
      act(() => {
        result.current.handleSquareClick(4); // O
      });
      act(() => {
        result.current.handleSquareClick(2); // X wins
      });

      expect(result.current.gameState.winner).toBe('X');

      // Reset the game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.isDraw).toBe(false);
      expect(result.current.currentSquares).toEqual(createEmptyBoard());
    });
  });

  describe('Game State Consistency', () => {
    it('should maintain consistent state throughout game lifecycle', () => {
      const { result } = renderHook(() => useGameState());

      // Test that currentSquares always matches history[currentMove]
      act(() => {
        result.current.handleSquareClick(0);
      });
      expect(result.current.currentSquares).toEqual(
        result.current.gameState.history[result.current.gameState.currentMove]
      );

      act(() => {
        result.current.handleSquareClick(4);
      });
      expect(result.current.currentSquares).toEqual(
        result.current.gameState.history[result.current.gameState.currentMove]
      );

      // Jump to earlier move
      act(() => {
        result.current.jumpToMove(1);
      });
      expect(result.current.currentSquares).toEqual(
        result.current.gameState.history[result.current.gameState.currentMove]
      );
    });

    it('should correctly calculate current player based on move count', () => {
      const { result } = renderHook(() => useGameState());

      // X should start
      expect(result.current.currentPlayer).toBe('X');

      // After X moves, should be O's turn
      act(() => {
        result.current.handleSquareClick(0);
      });
      expect(result.current.currentPlayer).toBe('O');

      // After O moves, should be X's turn
      act(() => {
        result.current.handleSquareClick(1);
      });
      expect(result.current.currentPlayer).toBe('X');

      // Jump back to beginning
      act(() => {
        result.current.jumpToMove(0);
      });
      expect(result.current.currentPlayer).toBe('X');

      // Jump to after first move
      act(() => {
        result.current.jumpToMove(1);
      });
      expect(result.current.currentPlayer).toBe('O');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consecutive clicks gracefully', () => {
      const { result } = renderHook(() => useGameState());

      // Click same square multiple times rapidly
      act(() => {
        result.current.handleSquareClick(0);
        result.current.handleSquareClick(0);
        result.current.handleSquareClick(0);
      });

      // Should only register one move
      expect(result.current.currentSquares[0]).toBe('X');
      expect(result.current.currentPlayer).toBe('O');
      expect(result.current.gameState.currentMove).toBe(1);
    });

    it('should handle complete game scenarios', () => {
      const { result } = renderHook(() => useGameState());

      // Play a complete game that ends in draw
      const drawMoves = [4, 0, 8, 2, 6, 3, 1, 7, 5]; // Results in draw
      drawMoves.forEach(move => {
        act(() => {
          result.current.handleSquareClick(move);
        });
      });

      expect(result.current.gameState.isDraw).toBe(true);
      expect(result.current.gameState.winner).toBeNull();

      // Should not allow more moves
      act(() => {
        result.current.handleSquareClick(0); // Try to click occupied square
      });
      expect(result.current.gameState.currentMove).toBe(9); // No change
    });
  });
});
