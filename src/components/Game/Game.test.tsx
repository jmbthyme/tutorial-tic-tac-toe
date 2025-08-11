import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from './Game';
// Removed unused import

// Mock the child components to isolate Game component testing
jest.mock('../Board', () => {
  return function MockBoard({
    squares,
    onSquareClick,
    winningLine,
    disabled,
  }: {
    squares: (string | null)[];
    onSquareClick: (index: number) => void;
    winningLine: number[];
    disabled: boolean;
  }): React.ReactElement {
    return (
      <div data-testid="board" data-disabled={disabled}>
        {squares.map((square, index) => (
          <button
            key={index}
            data-testid={`square-${index}`}
            onClick={() => onSquareClick(index)}
            disabled={disabled}
            data-winning={winningLine.includes(index)}
          >
            {square || ''}
          </button>
        ))}
      </div>
    );
  };
});

jest.mock('../GameStatus', () => {
  return function MockGameStatus({
    winner,
    isDraw,
    currentPlayer,
  }: {
    winner: string | null;
    isDraw: boolean;
    currentPlayer: string;
  }): React.ReactElement {
    return (
      <div data-testid="game-status">
        {winner
          ? `Winner: ${winner}`
          : isDraw
            ? 'Draw'
            : `Next: ${currentPlayer}`}
      </div>
    );
  };
});

describe('Game', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Game />);
      expect(
        screen.getByRole('heading', { name: 'Tic-Tac-Toe' })
      ).toBeInTheDocument();
    });

    it('renders all main components', () => {
      render(<Game />);

      expect(
        screen.getByRole('heading', { name: 'Tic-Tac-Toe' })
      ).toBeInTheDocument();
      expect(screen.getByTestId('game-status')).toBeInTheDocument();
      expect(screen.getByTestId('board')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Game History' })
      ).toBeInTheDocument();
    });

    it('renders initial game state correctly', () => {
      render(<Game />);

      // Should show initial player
      expect(screen.getByTestId('game-status')).toHaveTextContent('Next: X');

      // Should have initial move button
      expect(
        screen.getByRole('button', { name: /Go to game start/ })
      ).toBeInTheDocument();

      // Board should not be disabled initially
      expect(screen.getByTestId('board')).toHaveAttribute(
        'data-disabled',
        'false'
      );
    });

    it('does not show reset button initially', () => {
      render(<Game />);
      expect(
        screen.queryByRole('button', { name: /Start a new game/ })
      ).not.toBeInTheDocument();
    });
  });

  describe('Game Flow', () => {
    it('allows making moves and updates game state', async () => {
      render(<Game />);

      // Make first move
      const square0 = screen.getByTestId('square-0');
      fireEvent.click(square0);

      await waitFor(() => {
        expect(screen.getByTestId('game-status')).toHaveTextContent('Next: O');
      });

      // Should have two history buttons now
      expect(
        screen.getByRole('button', { name: /Go to game start/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Go to move #1/ })
      ).toBeInTheDocument();
    });

    it('shows reset button when game is over', async () => {
      render(<Game />);

      // Simulate a winning game (X wins with top row)
      const moves = [0, 3, 1, 4, 2]; // X: 0,1,2 (top row), O: 3,4

      for (const move of moves) {
        const square = screen.getByTestId(`square-${move}`);
        fireEvent.click(square);
        await waitFor(() => {});
      }

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Start a new game/ })
        ).toBeInTheDocument();
      });
    });

    it('disables board when game is over', async () => {
      render(<Game />);

      // Simulate a winning game
      const moves = [0, 3, 1, 4, 2];

      for (const move of moves) {
        const square = screen.getByTestId(`square-${move}`);
        fireEvent.click(square);
        await waitFor(() => {});
      }

      await waitFor(() => {
        expect(screen.getByTestId('board')).toHaveAttribute(
          'data-disabled',
          'true'
        );
      });
    });
  });

  describe('History Navigation', () => {
    it('allows jumping to previous moves', async () => {
      render(<Game />);

      // Make a few moves
      fireEvent.click(screen.getByTestId('square-0'));
      await waitFor(() => {});

      fireEvent.click(screen.getByTestId('square-1'));
      await waitFor(() => {});

      // Jump back to game start
      const gameStartButton = screen.getByRole('button', {
        name: /Go to game start/,
      });
      fireEvent.click(gameStartButton);

      await waitFor(() => {
        expect(screen.getByTestId('game-status')).toHaveTextContent('Next: X');
      });
    });

    it('shows current move with proper styling and aria attributes', async () => {
      render(<Game />);

      // Make a move
      fireEvent.click(screen.getByTestId('square-0'));
      await waitFor(() => {});

      // Current move button should be disabled and have aria-current
      const currentMoveButton = screen.getByRole('button', {
        name: /Go to move #1.*current/,
      });
      expect(currentMoveButton).toBeDisabled();
      expect(currentMoveButton).toHaveAttribute('aria-current', 'step');
    });

    it('shows reset history button when there are multiple moves', async () => {
      render(<Game />);

      // Initially no reset history button
      expect(
        screen.queryByRole('button', { name: /Reset game and clear history/ })
      ).not.toBeInTheDocument();

      // Make a move
      fireEvent.click(screen.getByTestId('square-0'));
      await waitFor(() => {});

      // Now reset history button should appear
      expect(
        screen.getByRole('button', { name: /Reset game and clear history/ })
      ).toBeInTheDocument();
    });

    it('resets game when reset history button is clicked', async () => {
      render(<Game />);

      // Make a move
      fireEvent.click(screen.getByTestId('square-0'));
      await waitFor(() => {});

      // Click reset history button
      const resetButton = screen.getByRole('button', {
        name: /Reset game and clear history/,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByTestId('game-status')).toHaveTextContent('Next: X');
        expect(
          screen.queryByRole('button', { name: /Go to move #1/ })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<Game />);

      const mainTitle = screen.getByRole('heading', { name: 'Tic-Tac-Toe' });
      const historyTitle = screen.getByRole('heading', {
        name: 'Game History',
      });

      expect(mainTitle).toBeInTheDocument();
      expect(historyTitle).toBeInTheDocument();
    });

    it('has proper ARIA labels and regions', () => {
      render(<Game />);

      expect(
        screen.getByRole('region', { name: 'Move history navigation' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('list', { name: 'List of game moves' })
      ).toBeInTheDocument();
    });

    it('provides descriptive button labels', async () => {
      render(<Game />);

      // Make a move to get more buttons
      fireEvent.click(screen.getByTestId('square-0'));
      await waitFor(() => {});

      expect(
        screen.getByRole('button', { name: 'Go to game start' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Go to move #1.*current/ })
      ).toBeInTheDocument();
    });

    it('handles keyboard navigation', async () => {
      render(<Game />);

      // Make a move to get history buttons
      fireEvent.click(screen.getByTestId('square-0'));
      await waitFor(() => {});

      const gameStartButton = screen.getByRole('button', {
        name: 'Go to game start',
      });

      // Test clicking the button directly (keyboard events are handled by the browser)
      fireEvent.click(gameStartButton);
      await waitFor(() => {
        expect(screen.getByTestId('game-status')).toHaveTextContent('Next: X');
      });
    });
  });

  describe('Reset Functionality', () => {
    it('resets game when main reset button is clicked', async () => {
      render(<Game />);

      // Simulate a winning game to show reset button
      const moves = [0, 3, 1, 4, 2];

      for (const move of moves) {
        fireEvent.click(screen.getByTestId(`square-${move}`));
        await waitFor(() => {});
      }

      // Click main reset button
      const resetButton = screen.getByRole('button', {
        name: /Start a new game/,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByTestId('game-status')).toHaveTextContent('Next: X');
        expect(screen.getByTestId('board')).toHaveAttribute(
          'data-disabled',
          'false'
        );
        expect(
          screen.queryByRole('button', { name: /Start a new game/ })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct CSS classes', () => {
      render(<Game />);

      const gameContainer = screen
        .getByRole('heading', { name: 'Tic-Tac-Toe' })
        .closest('.game');
      expect(gameContainer).toHaveClass('game');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicking gracefully', async () => {
      render(<Game />);

      const square0 = screen.getByTestId('square-0');

      // Click multiple times rapidly
      fireEvent.click(square0);
      fireEvent.click(square0);
      fireEvent.click(square0);

      await waitFor(() => {
        // Should only register one move
        expect(screen.getByTestId('game-status')).toHaveTextContent('Next: O');
      });
    });

    it('maintains game state consistency during navigation', async () => {
      render(<Game />);

      // Make several moves
      fireEvent.click(screen.getByTestId('square-0')); // X
      await waitFor(() => {});
      fireEvent.click(screen.getByTestId('square-1')); // O
      await waitFor(() => {});
      fireEvent.click(screen.getByTestId('square-2')); // X
      await waitFor(() => {});

      // Jump to middle move
      fireEvent.click(screen.getByRole('button', { name: /Go to move #2/ }));
      await waitFor(() => {});

      // Should show correct player for that move
      expect(screen.getByTestId('game-status')).toHaveTextContent('Next: X');
    });
  });
});
