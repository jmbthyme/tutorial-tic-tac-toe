import React from 'react';
import { SquareProps } from '../../types';
import styles from './Square.module.css';

const Square: React.FC<SquareProps> = React.memo(
  ({ value, onClick, isWinningSquare = false, disabled = false }) => {
    const handleClick = () => {
      if (!disabled && !value) {
        onClick();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    };

    const squareClasses = [
      styles.square,
      isWinningSquare ? styles.winning : '',
      value ? styles.filled : '',
      disabled ? styles.disabled : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        className={squareClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={
          value
            ? `Square filled with ${value}${isWinningSquare ? ', winning square' : ''}`
            : 'Empty square, click to place your mark'
        }
        tabIndex={disabled ? -1 : 0}
      >
        {value}
      </button>
    );
  }
);

Square.displayName = 'Square';

export default Square;
