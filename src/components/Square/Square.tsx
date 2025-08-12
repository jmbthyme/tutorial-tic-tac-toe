import React from 'react';
import { SquareProps } from '../../types';
import styles from './Square.module.css';

const Square: React.FC<SquareProps> = React.memo(
  ({
    value,
    onClick,
    isWinningSquare = false,
    disabled = false,
    isFocused = false,
    onFocus,
  }) => {
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

    const handleFocus = React.useCallback(() => {
      if (onFocus) {
        onFocus();
      }
    }, [onFocus]);

    const squareClasses = React.useMemo(
      () =>
        [
          styles.square,
          isWinningSquare ? styles.winning : '',
          value ? styles.filled : '',
          disabled ? styles.disabled : '',
          isFocused ? styles.focused : '',
        ]
          .filter(Boolean)
          .join(' '),
      [isWinningSquare, value, disabled, isFocused]
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
        aria-pressed={value !== null}
        aria-describedby={
          isWinningSquare ? 'winning-square-description' : undefined
        }
        tabIndex={disabled ? -1 : 0}
        onFocus={handleFocus}
      >
        {value}
        {isWinningSquare && (
          <span id="winning-square-description" className={styles.srOnly}>
            This square is part of the winning combination
          </span>
        )}
      </button>
    );
  }
);

Square.displayName = 'Square';

export default Square;
