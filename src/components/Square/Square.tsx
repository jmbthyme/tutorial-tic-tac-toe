import React from 'react';
import { SquareProps } from '../../types';
import styles from './Square.module.css';

const Square: React.FC<SquareProps> = React.memo(
  ({ value, onClick, isWinningSquare = false, disabled = false }) => {
    const handleClick = React.useCallback(() => {
      if (!disabled && !value) {
        onClick();
      }
    }, [disabled, value, onClick]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      },
      [handleClick]
    );

    const squareClasses = React.useMemo(
      () =>
        [
          styles.square,
          isWinningSquare ? styles.winning : '',
          value ? styles.filled : '',
          disabled ? styles.disabled : '',
        ]
          .filter(Boolean)
          .join(' '),
      [isWinningSquare, value, disabled]
    );

    return (
      <button
        className={squareClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={React.useMemo(
          () =>
            value
              ? `Square filled with ${value}${isWinningSquare ? ', winning square' : ''}`
              : 'Empty square, click to place your mark',
          [value, isWinningSquare]
        )}
        tabIndex={disabled ? -1 : 0}
      >
        {value}
      </button>
    );
  }
);

Square.displayName = 'Square';

export default Square;
