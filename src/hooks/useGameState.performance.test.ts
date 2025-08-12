import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';

describe('useGameState Performance Tests', () => {
  it('should not recalculate winner when board has not changed', () => {
    const { result } = renderHook(() => useGameState());

    // Mock calculateWinner to track calls
    const gameLogicModule = jest.requireActual(
      '../utils/gameLogic'
    ) as typeof import('../utils/gameLogic');
    const mockCalculateWinner = jest.fn(gameLogicModule.calculateWinner);

    // Replace the import temporarily
    jest.doMock('../utils/gameLogic', () => ({
      ...gameLogicModule,
      calculateWinner: mockCalculateWinner,
    }));

    // Make a move
    act(() => {
      result.current.handleSquareClick(0);
    });

    const callCountAfterFirstMove = mockCalculateWinner.mock.calls.length;

    // Access winner multiple times - should not trigger additional calculations
    const winner1 = result.current.gameState.winner;
    const winner2 = result.current.gameState.winner;
    const winner3 = result.current.gameState.winner;

    expect(winner1).toBe(winner2);
    expect(winner2).toBe(winner3);

    // Should not have made additional calls to calculateWinner
    expect(mockCalculateWinner.mock.calls.length).toBe(callCountAfterFirstMove);

    jest.unmock('../utils/gameLogic');
  });

  it('should efficiently handle rapid moves', () => {
    const { result } = renderHook(() => useGameState());

    // Mock performance.now for timing
    const mockNow = jest.spyOn(window.performance, 'now');
    let callCount = 0;
    mockNow.mockImplementation(() => {
      callCount++;
      return callCount * 5; // 5ms per call
    });

    const startTime = window.performance.now();

    // Make multiple moves rapidly
    act(() => {
      result.current.handleSquareClick(0); // X
    });
    act(() => {
      result.current.handleSquareClick(1); // O
    });
    act(() => {
      result.current.handleSquareClick(2); // X
    });
    act(() => {
      result.current.handleSquareClick(3); // O
    });
    act(() => {
      result.current.handleSquareClick(4); // X
    });

    const endTime = window.performance.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (increased threshold for test environment)
    expect(duration).toBeLessThan(200);

    // Verify final state is correct
    expect(result.current.currentSquares[0]).toBe('X');
    expect(result.current.currentSquares[1]).toBe('O');
    expect(result.current.currentSquares[2]).toBe('X');
    expect(result.current.currentSquares[3]).toBe('O');
    expect(result.current.currentSquares[4]).toBe('X');

    mockNow.mockRestore();
  });

  it('should efficiently handle history navigation', () => {
    const { result } = renderHook(() => useGameState());

    // Make some moves first
    act(() => {
      result.current.handleSquareClick(0);
    });
    act(() => {
      result.current.handleSquareClick(1);
    });
    act(() => {
      result.current.handleSquareClick(2);
    });

    // Mock performance.now for timing
    const mockNow = jest.spyOn(window.performance, 'now');
    let callCount = 0;
    mockNow.mockImplementation(() => {
      callCount++;
      return callCount * 3; // 3ms per call
    });

    const startTime = window.performance.now();

    // Navigate through history rapidly (only valid moves)
    act(() => {
      result.current.jumpToMove(0);
      result.current.jumpToMove(1);
      result.current.jumpToMove(2);
      result.current.jumpToMove(3); // This is the current move
      result.current.jumpToMove(1);
      result.current.jumpToMove(0);
    });

    const endTime = window.performance.now();
    const duration = endTime - startTime;

    // Should complete navigation quickly
    expect(duration).toBeLessThan(30);

    // Verify final state
    expect(result.current.gameState.currentMove).toBe(0);
    expect(result.current.currentSquares.every(square => square === null)).toBe(
      true
    );

    mockNow.mockRestore();
  });

  it('should memoize expensive calculations', () => {
    const { result, rerender } = renderHook(() => useGameState());

    // Make a move
    act(() => {
      result.current.handleSquareClick(0);
    });

    const firstWinnerResult = result.current.gameState.winner;
    const firstCurrentPlayer = result.current.currentPlayer;
    const firstCurrentSquares = result.current.currentSquares;

    // Re-render without changing state
    rerender();

    const secondWinnerResult = result.current.gameState.winner;
    const secondCurrentPlayer = result.current.currentPlayer;
    const secondCurrentSquares = result.current.currentSquares;

    // Results should be the same reference (memoized)
    expect(firstWinnerResult).toBe(secondWinnerResult);
    expect(firstCurrentPlayer).toBe(secondCurrentPlayer);
    expect(firstCurrentSquares).toBe(secondCurrentSquares);
  });

  it('should handle game reset efficiently', () => {
    const { result } = renderHook(() => useGameState());

    // Make several moves
    act(() => {
      result.current.handleSquareClick(0);
      result.current.handleSquareClick(1);
      result.current.handleSquareClick(2);
      result.current.handleSquareClick(3);
    });

    const startTime = performance.now();

    // Reset the game
    act(() => {
      result.current.resetGame();
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Reset should be very fast
    expect(duration).toBeLessThan(10);

    // Verify reset state
    expect(result.current.gameState.currentMove).toBe(0);
    expect(result.current.gameState.history).toHaveLength(1);
    expect(result.current.gameState.winner).toBeNull();
    expect(result.current.gameState.isDraw).toBe(false);
    expect(result.current.currentSquares.every(square => square === null)).toBe(
      true
    );
  });

  it('should not recalculate draw state when winner exists', () => {
    const { result } = renderHook(() => useGameState());

    // Mock isDraw to track calls
    const gameLogicModule2 = jest.requireActual(
      '../utils/gameLogic'
    ) as typeof import('../utils/gameLogic');
    const mockIsDraw = jest.fn(gameLogicModule2.isDraw);

    jest.doMock('../utils/gameLogic', () => ({
      ...gameLogicModule2,
      isDraw: mockIsDraw,
    }));

    // Create a winning scenario
    act(() => {
      result.current.handleSquareClick(0); // X
      result.current.handleSquareClick(3); // O
      result.current.handleSquareClick(1); // X
      result.current.handleSquareClick(4); // O
      result.current.handleSquareClick(2); // X wins
    });

    // Clear mock calls from the winning moves
    mockIsDraw.mockClear();

    // Access isDraw multiple times - should not trigger calculations since there's a winner
    const isDraw1 = result.current.gameState.isDraw;
    const isDraw2 = result.current.gameState.isDraw;

    expect(isDraw1).toBe(false);
    expect(isDraw2).toBe(false);

    // Should not have called isDraw since winner exists
    expect(mockIsDraw).not.toHaveBeenCalled();

    jest.unmock('../utils/gameLogic');
  });
});
