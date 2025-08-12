import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { useGameState } from '../../hooks/useGameState';
import Board from '../Board';
import GameStatus from '../GameStatus';
import { GAME_MESSAGES } from '../../constants/game';
import styles from './Game.module.css';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const {
    gameState,
    currentPlayer,
    currentSquares,
    winningLine,
    handleSquareClick,
    jumpToMove,
    resetGame,
  } = useGameState();

  const { history, currentMove, winner, isDraw } = gameState;
  const isGameOver = useMemo(() => winner !== null || isDraw, [winner, isDraw]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent): void => {
      // Escape key to reset game
      if (event.key === 'Escape') {
        event.preventDefault();
        resetGame();
        // Focus the board after reset
        setTimeout(() => {
          if (boardRef.current) {
            const firstSquare = boardRef.current.querySelector('button');
            if (firstSquare) {
              (firstSquare as HTMLButtonElement).focus();
            }
          }
        }, 100);
      }

      // R key to reset game (with Ctrl/Cmd)
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        resetGame();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return (): void => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [resetGame]);

  // Focus management for game over state
  useEffect(() => {
    if (isGameOver) {
      // Announce game over to screen readers
      const announcement = winner
        ? `Game over! ${winner} wins the game!`
        : "Game over! It's a draw!";

      // Create a temporary element for screen reader announcement
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);

      // Remove the announcer after a short delay
      setTimeout((): void => {
        document.body.removeChild(announcer);
      }, 1000);
    }
  }, [isGameOver, winner]);

  const renderMoveButton = useCallback(
    (move: number): React.ReactElement => {
      const isCurrentMove = move === currentMove;
      const description =
        move === 0 ? 'Go to game start' : `Go to move #${move}`;

      return (
        <li key={move} className={styles.historyItem}>
          <button
            className={`${styles.historyButton} ${
              isCurrentMove ? styles.currentMove : ''
            }`}
            onClick={() => jumpToMove(move)}
            disabled={isCurrentMove}
            aria-label={`${description}${isCurrentMove ? ' (current)' : ''}`}
            aria-current={isCurrentMove ? 'step' : undefined}
          >
            {description}
          </button>
        </li>
      );
    },
    [currentMove, jumpToMove]
  );

  return (
    <div
      ref={gameRef}
      className={styles.game}
      role="main"
      aria-label="Tic-tac-toe game"
    >
      <div className={styles.gameBoard}>
        <h1 className={styles.title} id="game-title">
          Tic-Tac-Toe
        </h1>

        {/* Skip link for keyboard users */}
        <a href="#game-board" className={styles.skipLink}>
          Skip to game board
        </a>

        <GameStatus
          winner={winner}
          isDraw={isDraw}
          currentPlayer={currentPlayer}
        />

        <div ref={boardRef} id="game-board">
          <Board
            squares={currentSquares}
            onSquareClick={handleSquareClick}
            winningLine={winningLine || []}
            disabled={isGameOver}
          />
        </div>

        {isGameOver && (
          <button
            className={styles.resetButton}
            onClick={resetGame}
            aria-label="Start a new game"
            aria-describedby="reset-instructions"
          >
            {GAME_MESSAGES.RESET}
          </button>
        )}

        <div id="reset-instructions" className={styles.srOnly}>
          Press Escape key or this button to start a new game
        </div>
      </div>

      <aside className={styles.gameInfo} aria-labelledby="history-title">
        <h2 id="history-title" className={styles.historyTitle}>
          Game History
        </h2>
        <div
          className={styles.historyContainer}
          role="region"
          aria-label="Move history navigation"
          aria-describedby="history-instructions"
        >
          <div id="history-instructions" className={styles.srOnly}>
            Use Tab to navigate through move history buttons. Press Enter to
            jump to a specific move.
          </div>
          <ol className={styles.historyList} aria-label="List of game moves">
            {history.map((_, move) => renderMoveButton(move))}
          </ol>
        </div>

        {history.length > 1 && (
          <div className={styles.historyActions}>
            <button
              className={styles.resetHistoryButton}
              onClick={resetGame}
              aria-label="Reset game and clear history"
              aria-describedby="reset-instructions"
            >
              Reset Game
            </button>
          </div>
        )}

        <div
          className={styles.keyboardShortcuts}
          aria-labelledby="shortcuts-title"
        >
          <h3 id="shortcuts-title" className={styles.srOnly}>
            Keyboard Shortcuts
          </h3>
          <div className={styles.srOnly}>
            <ul>
              <li>Arrow keys: Navigate the game board</li>
              <li>Enter or Space: Make a move on the selected square</li>
              <li>Escape: Reset the game</li>
              <li>Home: Go to first square</li>
              <li>End: Go to last square</li>
              <li>Tab: Navigate between game elements</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Game;
