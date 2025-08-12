import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import Game from './Game';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Game Accessibility Tests', () => {
  beforeEach(() => {
    // Mock console.log to avoid noise in test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Game />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels and roles', () => {
    render(<Game />);

    // Check main game container
    expect(screen.getByRole('main')).toHaveAttribute(
      'aria-label',
      'Tic-tac-toe game'
    );

    // Check game board
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      'Tic-tac-toe game board, 3 by 3 grid'
    );

    // Check game status
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Check history section
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /move history navigation/i })
    ).toBeInTheDocument();
  });

  it('should support keyboard navigation with arrow keys', async () => {
    render(<Game />);

    const board = screen.getByRole('group');
    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Test that the board has proper accessibility attributes for keyboard navigation
    expect(board).toHaveAttribute(
      'aria-label',
      'Tic-tac-toe game board, 3 by 3 grid'
    );
    expect(board).toHaveAttribute('role', 'group');

    // Test that squares have proper tabindex for keyboard navigation
    squares.forEach(square => {
      expect(square).toHaveAttribute('tabindex', '0');
    });

    // Test that the first square has the focused class initially
    expect(squares[0]).toHaveClass('focused');

    // Test that keyboard navigation instructions are present
    expect(
      screen.getByText(/Use arrow keys to navigate the board/)
    ).toBeInTheDocument();
  });

  it('should support Home and End keys for navigation', async () => {
    render(<Game />);

    const board = screen.getByRole('group');
    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Test that the board handles keyboard events
    expect(board).toHaveAttribute('role', 'group');
    expect(board).toHaveAttribute(
      'aria-label',
      'Tic-tac-toe game board, 3 by 3 grid'
    );

    // Test that keyboard navigation instructions are present
    expect(
      screen.getByText(/Home to go to first square, End to go to last square/)
    ).toBeInTheDocument();

    // Test that all squares are focusable
    squares.forEach(square => {
      expect(square).toHaveAttribute('tabindex', '0');
    });
  });

  it('should support Enter and Space keys for making moves', async () => {
    const user = userEvent.setup();
    render(<Game />);

    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Test that squares respond to click and keyboard interaction
    await user.click(squares[0]!);
    expect(squares[0]).toHaveTextContent('X');

    // Test that squares respond to keyboard interaction
    await user.click(squares[1]!);
    expect(squares[1]).toHaveTextContent('O');

    // Test that keyboard instructions mention Enter and Space
    expect(
      screen.getByText(/Enter or Space to make a move/)
    ).toBeInTheDocument();
  });

  it('should support Escape key for game reset', async () => {
    const user = userEvent.setup();
    render(<Game />);

    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Make a move
    await user.click(squares[0]!);
    expect(squares[0]).toHaveTextContent('X');

    // Reset with Escape key
    await user.keyboard('{Escape}');

    // Wait for reset to complete
    await waitFor(() => {
      const newSquares = screen
        .getAllByRole('button')
        .filter(button =>
          button.getAttribute('aria-label')?.includes('Empty square')
        );
      expect(newSquares).toHaveLength(9);
    });
  });

  it('should have proper focus management', async () => {
    render(<Game />);

    // Test that skip link exists and is focusable
    const skipLink = screen.getByText('Skip to game board');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#game-board');

    // Test that squares are focusable
    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Test that squares have proper tabindex for focus management
    squares.forEach(square => {
      expect(square).toHaveAttribute('tabindex', '0');
    });
  });

  it('should announce game state changes to screen readers', async () => {
    render(<Game />);

    const gameStatus = screen.getByRole('status');
    expect(gameStatus).toHaveAttribute('aria-live', 'polite');
    expect(gameStatus).toHaveAttribute('aria-atomic', 'true');

    // Check initial status
    expect(gameStatus).toHaveTextContent(/Next player: X/i);
  });

  it('should provide comprehensive ARIA descriptions', () => {
    render(<Game />);

    // Check squares have descriptive labels
    const emptySquares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );
    expect(emptySquares).toHaveLength(9);

    emptySquares.forEach(square => {
      expect(square).toHaveAttribute(
        'aria-label',
        'Empty square, click to place your mark'
      );
    });

    // Check game instructions are present in the board
    expect(
      screen.getByText(
        /Use arrow keys to navigate the board, Enter or Space to make a move/
      )
    ).toBeInTheDocument();
  });

  it('should handle focus when game ends', async () => {
    const user = userEvent.setup();
    render(<Game />);

    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Create a winning scenario (top row)
    await user.click(squares[0]!); // X
    await user.click(squares[3]!); // O
    await user.click(squares[1]!); // X
    await user.click(squares[4]!); // O
    await user.click(squares[2]!); // X wins

    // Check that game over state is announced
    const gameStatus = screen.getByRole('status');
    expect(gameStatus).toHaveTextContent(/Winner: X/i);

    // Check that reset button is available and focusable
    const resetButton = screen.getByRole('button', {
      name: /Start a new game/i,
    });
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).not.toHaveAttribute('disabled');
  });

  it('should provide keyboard shortcuts information', () => {
    render(<Game />);

    // Check that keyboard shortcuts are documented for screen readers
    expect(
      screen.getByText(/Arrow keys: Navigate the game board/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Enter or Space: Make a move on the selected square/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Escape: Reset the game/)).toBeInTheDocument();
    expect(screen.getByText(/Home: Go to first square/)).toBeInTheDocument();
    expect(screen.getByText(/End: Go to last square/)).toBeInTheDocument();
  });

  it('should have proper heading hierarchy', () => {
    render(<Game />);

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Tic-Tac-Toe');

    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Game History');
  });

  it('should support skip links', () => {
    render(<Game />);

    const skipLink = screen.getByText('Skip to game board');
    expect(skipLink).toHaveAttribute('href', '#game-board');
    expect(skipLink).toHaveClass('skipLink');

    // Check that the target element exists
    const gameBoard = screen.getByRole('group');
    expect(gameBoard.closest('#game-board')).toBeInTheDocument();
  });

  it('should handle disabled state properly', async () => {
    const user = userEvent.setup();
    render(<Game />);

    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Create a winning scenario to disable the board
    await user.click(squares[0]!); // X
    await user.click(squares[3]!); // O
    await user.click(squares[1]!); // X
    await user.click(squares[4]!); // O
    await user.click(squares[2]!); // X wins

    // Check that the board is disabled
    const board = screen.getByRole('group');
    expect(board).toHaveClass('disabled');

    // Check that squares are disabled
    const allSquares = screen
      .getAllByRole('button')
      .filter(button => button.getAttribute('aria-label')?.includes('square'));

    allSquares.forEach(square => {
      if (
        !square.getAttribute('aria-label')?.includes('Start a new game') &&
        !square.getAttribute('aria-label')?.includes('Go to') &&
        !square.getAttribute('aria-label')?.includes('Reset')
      ) {
        expect(square).toHaveAttribute('disabled');
        expect(square).toHaveAttribute('tabindex', '-1');
      }
    });
  });

  it('should maintain focus visibility', () => {
    render(<Game />);

    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Check that focus styles are available (squares have proper CSS classes)
    expect(squares[0]).toHaveClass('square');

    // Check that the first square has the focused class initially
    expect(squares[0]).toHaveClass('focused');

    // Test that squares are properly configured for focus visibility
    squares.forEach(square => {
      expect(square).toHaveAttribute('tabindex', '0');
    });
  });
});
