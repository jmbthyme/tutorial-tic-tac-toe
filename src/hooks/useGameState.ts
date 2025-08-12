import { useState, useCallback, useMemo } from 'react';
import { Board, GameState, Player } from '../types/game';
import {
  calculateWinner,
  isDraw,
  isValidMove,
  makeMove,
  createEmptyBoard,
  getCurrentPlayer,
} from '../utils/gameLogic';

/**
 * Return type for the useGameState hook
 */
export interface UseGameStateReturn {
  gameState: GameState;
  currentPlayer: Player;
  currentSquares: Board;
  winningLine: number[] | null;
  handleSquareClick: (index: number) => void;
  jumpToMove: (move: number) => void;
  resetGame: () => void;
}

/**
 * Custom hook for managing tic-tac-toe game state
 * Handles all game logic including moves, history, winner detection, and state transitions
 */
export function useGameState(): UseGameStateReturn {
  // Initialize game state with empty board and starting player
  const [gameState, setGameState] = useState<GameState>(() => ({
    history: [createEmptyBoard()],
    currentMove: 0,
    winner: null,
    isDraw: false,
  }));

  // Memoized current board state
  const currentSquares = useMemo(() => {
    return gameState.history[gameState.currentMove] || createEmptyBoard();
  }, [gameState.history, gameState.currentMove]);

  // Memoized winner calculation with winning line
  const winnerResult = useMemo(() => {
    return calculateWinner(currentSquares);
  }, [currentSquares]);

  // Memoized current player calculation
  const currentPlayer = useMemo(() => {
    return getCurrentPlayer(currentSquares);
  }, [currentSquares]);

  // Memoized game state calculations
  const winner = useMemo(() => winnerResult.winner, [winnerResult.winner]);
  const winningLine = useMemo(
    () => winnerResult.winningLine,
    [winnerResult.winningLine]
  );
  const isGameDraw = useMemo(() => {
    // Only calculate draw if there's no winner to avoid unnecessary computation
    return winner ? false : isDraw(currentSquares);
  }, [currentSquares, winner]);

  /**
   * Handles clicking on a square to make a move
   */
  const handleSquareClick = useCallback(
    (index: number) => {
      // Don't allow moves if game is over or move is invalid
      if (winner || isGameDraw || !isValidMove(currentSquares, index)) {
        return;
      }

      try {
        // Make the move
        const newSquares = makeMove(currentSquares, index, currentPlayer);

        // Calculate new game state
        const newWinner = calculateWinner(newSquares);
        const newIsDraw = isDraw(newSquares);

        // Update history by removing any future moves and adding the new move
        const newHistory = gameState.history.slice(
          0,
          gameState.currentMove + 1
        );
        newHistory.push(newSquares);

        setGameState({
          history: newHistory,
          currentMove: newHistory.length - 1,
          winner: newWinner.winner,
          isDraw: newIsDraw,
        });
      } catch (error) {
        // Handle invalid moves gracefully
        console.warn('Invalid move attempted:', error);
      }
    },
    [
      currentSquares,
      currentPlayer,
      winner,
      isGameDraw,
      gameState.history,
      gameState.currentMove,
    ]
  );

  /**
   * Jumps to a specific move in the game history
   */
  const jumpToMove = useCallback(
    (move: number) => {
      // Validate move index
      if (move < 0 || move >= gameState.history.length) {
        console.warn('Invalid move index:', move);
        return;
      }

      const targetSquares = gameState.history[move];
      if (!targetSquares) {
        console.warn('Invalid move index:', move);
        return;
      }

      const targetWinner = calculateWinner(targetSquares);
      const targetIsDraw = isDraw(targetSquares);

      setGameState(prevState => ({
        ...prevState,
        currentMove: move,
        winner: targetWinner.winner,
        isDraw: targetIsDraw,
      }));
    },
    [gameState.history]
  );

  /**
   * Resets the game to initial state
   */
  const resetGame = useCallback(() => {
    setGameState({
      history: [createEmptyBoard()],
      currentMove: 0,
      winner: null,
      isDraw: false,
    });
  }, []);

  // Return the complete game state and actions
  return {
    gameState: {
      ...gameState,
      winner,
      isDraw: isGameDraw,
    },
    currentPlayer,
    currentSquares,
    winningLine,
    handleSquareClick,
    jumpToMove,
    resetGame,
  };
}
