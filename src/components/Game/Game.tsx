import React from 'react';
import { useGameState } from '../../hooks/useGameState';
import Board from '../Board';
import GameStatus from '../GameStatus';
import { GAME_MESSAGES } from '../../constants/game';
import styles from './Game.module.css';

const Game: React.FC = () => {
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
  const isGameOver = winner !== null || isDraw;

  const renderMoveButton = (move: number): React.ReactElement => {
    const isCurrentMove = move === currentMove;
    const description = move === 0 ? 'Go to game start' : `Go to move #${move}`;

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
  };

  return (
    <div className={styles.game}>
      <div className={styles.gameBoard}>
        <h1 className={styles.title}>Tic-Tac-Toe</h1>

        <GameStatus
          winner={winner}
          isDraw={isDraw}
          currentPlayer={currentPlayer}
        />

        <Board
          squares={currentSquares}
          onSquareClick={handleSquareClick}
          winningLine={winningLine || []}
          disabled={isGameOver}
        />

        {isGameOver && (
          <button
            className={styles.resetButton}
            onClick={resetGame}
            aria-label="Start a new game"
          >
            {GAME_MESSAGES.RESET}
          </button>
        )}
      </div>

      <div className={styles.gameInfo}>
        <h2 className={styles.historyTitle}>Game History</h2>
        <div
          className={styles.historyContainer}
          role="region"
          aria-label="Move history navigation"
        >
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
            >
              Reset Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
