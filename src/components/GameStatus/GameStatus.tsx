import React, { useMemo } from 'react';
import { GameStatusProps } from '../../types';
import { GAME_MESSAGES } from '../../constants/game';
import styles from './GameStatus.module.css';

const GameStatus: React.FC<GameStatusProps> = React.memo(
  ({ winner, isDraw, currentPlayer }) => {
    const statusMessage = useMemo((): string => {
      if (winner) {
        return GAME_MESSAGES.WINNER(winner);
      }
      if (isDraw) {
        return GAME_MESSAGES.DRAW;
      }
      return GAME_MESSAGES.NEXT_PLAYER(currentPlayer);
    }, [winner, isDraw, currentPlayer]);

    const ariaLabel = useMemo((): string => {
      if (winner) {
        return `Game over. ${winner} wins the game.`;
      }
      if (isDraw) {
        return 'Game over. The game is a draw.';
      }
      return `Game in progress. It is ${currentPlayer}'s turn.`;
    }, [winner, isDraw, currentPlayer]);

    const isGameOver = useMemo(
      () => winner !== null || isDraw,
      [winner, isDraw]
    );

    return (
      <div
        className={`${styles.gameStatus} ${isGameOver ? styles.gameOver : styles.gameActive}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={ariaLabel}
        id="game-status"
      >
        <span className={styles.statusText} aria-describedby="status-details">
          {statusMessage}
        </span>
        {isGameOver && (
          <span className={styles.gameOverIndicator} aria-hidden="true">
            🎉
          </span>
        )}
        <div id="status-details" className={styles.srOnly}>
          {isGameOver
            ? `Game has ended. ${winner ? `${winner} is the winner.` : 'The game ended in a draw.'} Press Escape or the Reset button to start a new game.`
            : `Game is in progress. Current player is ${currentPlayer}.`}
        </div>
      </div>
    );
  }
);

GameStatus.displayName = 'GameStatus';

export default GameStatus;
