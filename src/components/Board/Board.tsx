import React, { useCallback, useRef, useEffect } from 'react';
import { BoardProps } from '../../types';
import Square from '../Square';
import styles from './Board.module.css';

const Board: React.FC<BoardProps> = React.memo(
  ({ squares, onSquareClick, winningLine = [], disabled = false }) => {
    const boardRef = useRef<HTMLDivElement | null>(null);
    const [focusedSquare, setFocusedSquare] = React.useState<number>(0);
    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (disabled) return;

        const { key } = event;
        let newFocusedSquare = focusedSquare;

        switch (key) {
          case 'ArrowUp':
            event.preventDefault();
            newFocusedSquare =
              focusedSquare - 3 >= 0 ? focusedSquare - 3 : focusedSquare + 6;
            break;
          case 'ArrowDown':
            event.preventDefault();
            newFocusedSquare =
              focusedSquare + 3 <= 8 ? focusedSquare + 3 : focusedSquare - 6;
            break;
          case 'ArrowLeft':
            event.preventDefault();
            newFocusedSquare = focusedSquare > 0 ? focusedSquare - 1 : 8;
            break;
          case 'ArrowRight':
            event.preventDefault();
            newFocusedSquare = focusedSquare < 8 ? focusedSquare + 1 : 0;
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            if (!squares[focusedSquare]) {
              onSquareClick(focusedSquare);
            }
            break;
          case 'Home':
            event.preventDefault();
            newFocusedSquare = 0;
            break;
          case 'End':
            event.preventDefault();
            newFocusedSquare = 8;
            break;
          default:
            return;
        }

        if (newFocusedSquare !== focusedSquare) {
          setFocusedSquare(newFocusedSquare);
        }
      },
      [disabled, focusedSquare, squares, onSquareClick]
    );

    // Focus management
    useEffect(() => {
      if (boardRef.current && !disabled) {
        const squareButtons = boardRef.current.querySelectorAll('button');
        const targetButton = squareButtons[focusedSquare];
        if (targetButton && document.activeElement !== targetButton) {
          (targetButton as HTMLButtonElement).focus();
        }
      }
    }, [focusedSquare, disabled]);

    const renderSquare = useCallback(
      (index: number): React.ReactElement => {
        const isWinningSquare = winningLine.includes(index);
        const squareValue = squares[index] ?? null;
        const isFocused = index === focusedSquare;

        return (
          <Square
            key={index}
            value={squareValue}
            onClick={() => onSquareClick(index)}
            isWinningSquare={isWinningSquare}
            disabled={disabled}
            isFocused={isFocused}
            onFocus={() => setFocusedSquare(index)}
          />
        );
      },
      [squares, winningLine, onSquareClick, disabled, focusedSquare]
    );

    return (
      <div
        ref={boardRef}
        className={`${styles.board} ${disabled ? styles.disabled : ''}`}
        role="group"
        aria-label="Tic-tac-toe game board, 3 by 3 grid"
        aria-describedby="game-instructions"
        aria-live="polite"
        aria-atomic="false"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div id="game-instructions" className={styles.srOnly}>
          Use arrow keys to navigate the board, Enter or Space to make a move,
          Home to go to first square, End to go to last square.
        </div>
        {squares.map((_, index) => renderSquare(index))}
      </div>
    );
  }
);

Board.displayName = 'Board';

export default Board;
