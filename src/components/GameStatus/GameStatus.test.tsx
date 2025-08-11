import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameStatus from './GameStatus';
import { GameStatusProps, Player } from '../../types';
import { GAME_MESSAGES } from '../../constants/game';

describe('GameStatus', () => {
  const defaultProps: GameStatusProps = {
    winner: null,
    isDraw: false,
    currentPlayer: 'X',
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<GameStatus {...defaultProps} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('displays next player message when game is active', () => {
      render(<GameStatus {...defaultProps} />);
      expect(
        screen.getByText(GAME_MESSAGES.NEXT_PLAYER('X'))
      ).toBeInTheDocument();
    });

    it('displays next player message for O player', () => {
      render(<GameStatus {...defaultProps} currentPlayer="O" />);
      expect(
        screen.getByText(GAME_MESSAGES.NEXT_PLAYER('O'))
      ).toBeInTheDocument();
    });

    it('displays winner message when X wins', () => {
      render(<GameStatus {...defaultProps} winner="X" />);
      expect(screen.getByText(GAME_MESSAGES.WINNER('X'))).toBeInTheDocument();
    });

    it('displays winner message when O wins', () => {
      render(<GameStatus {...defaultProps} winner="O" />);
      expect(screen.getByText(GAME_MESSAGES.WINNER('O'))).toBeInTheDocument();
    });

    it('displays draw message when game is a draw', () => {
      render(<GameStatus {...defaultProps} isDraw={true} />);
      expect(screen.getByText(GAME_MESSAGES.DRAW)).toBeInTheDocument();
    });

    it('shows game over indicator when there is a winner', () => {
      render(<GameStatus {...defaultProps} winner="X" />);
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    it('shows game over indicator when game is a draw', () => {
      render(<GameStatus {...defaultProps} isDraw={true} />);
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    it('does not show game over indicator during active game', () => {
      render(<GameStatus {...defaultProps} />);
      expect(screen.queryByText('🎉')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper role attribute', () => {
      render(<GameStatus {...defaultProps} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-live attribute for screen readers', () => {
      render(<GameStatus {...defaultProps} />);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('has descriptive aria-label for active game', () => {
      render(<GameStatus {...defaultProps} />);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        "Game in progress. It is X's turn."
      );
    });

    it('has descriptive aria-label for winner', () => {
      render(<GameStatus {...defaultProps} winner="X" />);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        'Game over. X wins the game.'
      );
    });

    it('has descriptive aria-label for draw', () => {
      render(<GameStatus {...defaultProps} isDraw={true} />);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        'Game over. The game is a draw.'
      );
    });

    it('hides decorative emoji from screen readers', () => {
      render(<GameStatus {...defaultProps} winner="X" />);
      const emoji = screen.getByText('🎉');
      expect(emoji).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('CSS Classes', () => {
    it('applies gameActive class during active game', () => {
      render(<GameStatus {...defaultProps} />);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveClass('gameActive');
      expect(statusElement).not.toHaveClass('gameOver');
    });

    it('applies gameOver class when there is a winner', () => {
      render(<GameStatus {...defaultProps} winner="X" />);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveClass('gameOver');
      expect(statusElement).not.toHaveClass('gameActive');
    });

    it('applies gameOver class when game is a draw', () => {
      render(<GameStatus {...defaultProps} isDraw={true} />);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveClass('gameOver');
      expect(statusElement).not.toHaveClass('gameActive');
    });

    it('always applies base gameStatus class', () => {
      render(<GameStatus {...defaultProps} />);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveClass('gameStatus');
    });
  });

  describe('Edge Cases', () => {
    it('prioritizes winner over draw when both are true', () => {
      render(<GameStatus {...defaultProps} winner="X" isDraw={true} />);
      expect(screen.getByText(GAME_MESSAGES.WINNER('X'))).toBeInTheDocument();
      expect(screen.queryByText(GAME_MESSAGES.DRAW)).not.toBeInTheDocument();
    });

    it('handles empty currentPlayer gracefully', () => {
      // TypeScript should prevent this, but testing runtime behavior
      const props = { ...defaultProps, currentPlayer: '' as Player };
      render(<GameStatus {...props} />);
      expect(screen.getByText('Next player:')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('contains status text element', () => {
      render(<GameStatus {...defaultProps} />);
      const statusText = screen.getByText(GAME_MESSAGES.NEXT_PLAYER('X'));
      expect(statusText).toHaveClass('statusText');
    });

    it('contains game over indicator when game ends', () => {
      render(<GameStatus {...defaultProps} winner="X" />);
      const indicator = screen.getByText('🎉');
      expect(indicator).toHaveClass('gameOverIndicator');
    });
  });
});
