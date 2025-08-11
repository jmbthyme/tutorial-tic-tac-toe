import React from 'react';
import { GameStatusProps } from '../../types';
import { GAME_MESSAGES } from '../../constants/game';
import styles from './GameStatus.module.css';

const GameStatus: React.FC<GameStatusProps> = ({
  winner,
  isDraw,
  currentPlayer,
}) => {
  const getStatusMessage = (): string => {
    if (winner) {
      return GAME_MESSAGES.WINNER(winner);
    }
    if (isDraw) {
      return GAME_MESSAGES.DRAW;
    }
    return GAME_MESSAGES.NEXT_PLAYER(currentPlayer);
  };

  const getAriaLabel = (): string => {
    if (winner) {
      return `Game over. ${winner} wins the game.`;
    }
    if (isDraw) {
      return 'Game over. The game is a draw.';
    }
    return `Game in progress. It is ${currentPlayer}'s turn.`;
  };

  const isGameOver = winner !== null || isDraw;

  return (
    <div
      className={`${styles.gameStatus} ${isGameOver ? styles.gameOver : styles.gameActive}`}
      role="status"
      aria-live="polite"
      aria-label={getAriaLabel()}
    >
      <span className={styles.statusText}>{getStatusMessage()}</span>
      {isGameOver && (
        <span className={styles.gameOverIndicator} aria-hidden="true">
          🎉
        </span>
      )}
    </div>
  );
};

export default GameStatus;
