import React, { useCallback } from 'react';
import { BoardProps } from '../../types';
import Square from '../Square';
import styles from './Board.module.css';

const Board: React.FC<BoardProps> = React.memo(
  ({ squares, onSquareClick, winningLine = [], disabled = false }) => {
    const renderSquare = useCallback(
      (index: number): React.ReactElement => {
        const isWinningSquare = winningLine.includes(index);
        const squareValue = squares[index] ?? null;

        return (
          <Square
            key={index}
            value={squareValue}
            onClick={() => onSquareClick(index)}
            isWinningSquare={isWinningSquare}
            disabled={disabled}
          />
        );
      },
      [squares, winningLine, onSquareClick, disabled]
    );

    return (
      <div
        className={`${styles.board} ${disabled ? styles.disabled : ''}`}
        role="grid"
        aria-label="Tic-tac-toe game board"
        aria-describedby="game-instructions"
      >
        <div id="game-instructions" className={styles.srOnly}>
          Use arrow keys to navigate the board and Enter or Space to make a
          move.
        </div>
        {squares.map((_, index) => renderSquare(index))}
      </div>
    );
  }
);

Board.displayName = 'Board';

export default Board;
