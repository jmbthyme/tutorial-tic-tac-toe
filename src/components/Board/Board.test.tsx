// React import removed as it's not needed in test files
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from './Board';
import { BoardProps, SquareValue } from '../../types';

// Mock the Square component to isolate Board testing
jest.mock('../Square', () => {
  return function MockSquare({
    value,
    onClick,
    isWinningSquare,
    disabled,
  }: {
    value: SquareValue;
    onClick: () => void;
    isWinningSquare?: boolean;
    disabled?: boolean;
  }): React.ReactElement {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-testid={`square-${value || 'empty'}`}
        data-winning={isWinningSquare}
        data-disabled={disabled}
      >
        {value || ''}
      </button>
    );
  };
});

describe('Board', () => {
  const mockOnSquareClick = jest.fn();

  const defaultProps: BoardProps = {
    squares: Array(9).fill(null),
    onSquareClick: mockOnSquareClick,
  };

  beforeEach(() => {
    mockOnSquareClick.mockClear();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Board {...defaultProps} />);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('renders 9 squares', () => {
      render(<Board {...defaultProps} />);
      const squares = screen.getAllByTestId(/square-/);
      expect(squares).toHaveLength(9);
    });

    it('renders squares with correct values', () => {
      const squares: SquareValue[] = [
        'X',
        'O',
        null,
        'X',
        null,
        'O',
        null,
        null,
        'X',
      ];
      render(<Board {...defaultProps} squares={squares} />);

      expect(screen.getAllByTestId('square-X')).toHaveLength(3);
      expect(screen.getAllByTestId('square-O')).toHaveLength(2);
      expect(screen.getAllByTestId('square-empty')).toHaveLength(4);
    });

    it('renders empty board correctly', () => {
      render(<Board {...defaultProps} />);
      const emptySquares = screen.getAllByTestId('square-empty');
      expect(emptySquares).toHaveLength(9);
    });
  });

  describe('Accessibility', () => {
    it('has proper role attribute', () => {
      render(<Board {...defaultProps} />);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      render(<Board {...defaultProps} />);
      const board = screen.getByRole('group');
      expect(board).toHaveAttribute(
        'aria-label',
        'Tic-tac-toe game board, 3 by 3 grid'
      );
    });

    it('has aria-describedby pointing to instructions', () => {
      render(<Board {...defaultProps} />);
      const board = screen.getByRole('group');
      expect(board).toHaveAttribute('aria-describedby', 'game-instructions');
    });

    it('has proper ARIA live region attributes', () => {
      render(<Board {...defaultProps} />);
      const board = screen.getByRole('group');
      expect(board).toHaveAttribute('aria-live', 'polite');
      expect(board).toHaveAttribute('aria-atomic', 'false');
    });

    it('includes keyboard navigation instructions for screen readers', () => {
      render(<Board {...defaultProps} />);
      expect(
        screen.getByText(/Use arrow keys to navigate the board/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Enter or Space to make a move/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Home to go to first square/)
      ).toBeInTheDocument();
      expect(screen.getByText(/End to go to last square/)).toBeInTheDocument();
    });

    it('includes screen reader instructions', () => {
      render(<Board {...defaultProps} />);
      const instructions = screen.getByText(/Use arrow keys to navigate/);
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveAttribute('id', 'game-instructions');
    });

    it('hides instructions from visual users', () => {
      render(<Board {...defaultProps} />);
      const instructions = screen.getByText(/Use arrow keys to navigate/);
      expect(instructions).toHaveClass('srOnly');
    });
  });

  describe('User Interactions', () => {
    it('calls onSquareClick when square is clicked', () => {
      render(<Board {...defaultProps} />);
      const squares = screen.getAllByTestId(/square-/);

      fireEvent.click(squares[0]!);
      expect(mockOnSquareClick).toHaveBeenCalledWith(0);

      fireEvent.click(squares[4]!);
      expect(mockOnSquareClick).toHaveBeenCalledWith(4);

      fireEvent.click(squares[8]!);
      expect(mockOnSquareClick).toHaveBeenCalledWith(8);
    });

    it('calls onSquareClick with correct index for each square', () => {
      render(<Board {...defaultProps} />);
      const squares = screen.getAllByTestId(/square-/);

      squares.forEach((square, index) => {
        fireEvent.click(square);
        expect(mockOnSquareClick).toHaveBeenCalledWith(index);
      });

      expect(mockOnSquareClick).toHaveBeenCalledTimes(9);
    });

    it('does not call onSquareClick when board is disabled', () => {
      render(<Board {...defaultProps} disabled={true} />);
      const squares = screen.getAllByTestId(/square-/);

      fireEvent.click(squares[0]!);
      expect(mockOnSquareClick).not.toHaveBeenCalled();
    });
  });

  describe('Winning Line Highlighting', () => {
    it('passes isWinningSquare prop to squares in winning line', () => {
      const winningLine = [0, 1, 2];
      render(<Board {...defaultProps} winningLine={winningLine} />);

      const squares = screen.getAllByTestId(/square-/);

      // First three squares should be winning squares
      expect(squares[0]).toHaveAttribute('data-winning', 'true');
      expect(squares[1]).toHaveAttribute('data-winning', 'true');
      expect(squares[2]).toHaveAttribute('data-winning', 'true');

      // Rest should not be winning squares
      for (let i = 3; i < 9; i++) {
        expect(squares[i]).toHaveAttribute('data-winning', 'false');
      }
    });

    it('handles diagonal winning line correctly', () => {
      const winningLine = [0, 4, 8];
      render(<Board {...defaultProps} winningLine={winningLine} />);

      const squares = screen.getAllByTestId(/square-/);

      expect(squares[0]).toHaveAttribute('data-winning', 'true');
      expect(squares[4]).toHaveAttribute('data-winning', 'true');
      expect(squares[8]).toHaveAttribute('data-winning', 'true');

      // Non-winning squares
      [1, 2, 3, 5, 6, 7].forEach(index => {
        expect(squares[index]).toHaveAttribute('data-winning', 'false');
      });
    });

    it('handles empty winning line', () => {
      render(<Board {...defaultProps} winningLine={[]} />);

      const squares = screen.getAllByTestId(/square-/);
      squares.forEach(square => {
        expect(square).toHaveAttribute('data-winning', 'false');
      });
    });

    it('handles undefined winning line', () => {
      render(<Board {...defaultProps} />);

      const squares = screen.getAllByTestId(/square-/);
      squares.forEach(square => {
        expect(square).toHaveAttribute('data-winning', 'false');
      });
    });
  });

  describe('Disabled State', () => {
    it('applies disabled class when disabled prop is true', () => {
      render(<Board {...defaultProps} disabled={true} />);
      const board = screen.getByRole('group');
      expect(board).toHaveClass('disabled');
    });

    it('does not apply disabled class when disabled prop is false', () => {
      render(<Board {...defaultProps} disabled={false} />);
      const board = screen.getByRole('group');
      expect(board).not.toHaveClass('disabled');
    });

    it('does not apply disabled class when disabled prop is undefined', () => {
      render(<Board {...defaultProps} />);
      const board = screen.getByRole('group');
      expect(board).not.toHaveClass('disabled');
    });

    it('passes disabled prop to all squares', () => {
      render(<Board {...defaultProps} disabled={true} />);

      const squares = screen.getAllByTestId(/square-/);
      squares.forEach(square => {
        expect(square).toHaveAttribute('data-disabled', 'true');
      });
    });
  });

  describe('CSS Classes', () => {
    it('always applies base board class', () => {
      render(<Board {...defaultProps} />);
      const board = screen.getByRole('group');
      expect(board).toHaveClass('board');
    });

    it('applies both board and disabled classes when disabled', () => {
      render(<Board {...defaultProps} disabled={true} />);
      const board = screen.getByRole('group');
      expect(board).toHaveClass('board');
      expect(board).toHaveClass('disabled');
    });
  });

  describe('Edge Cases', () => {
    it('handles board with mixed values correctly', () => {
      const mixedSquares: SquareValue[] = [
        'X',
        null,
        'O',
        null,
        'X',
        null,
        'O',
        null,
        'X',
      ];
      render(<Board {...defaultProps} squares={mixedSquares} />);

      expect(screen.getAllByTestId('square-X')).toHaveLength(3);
      expect(screen.getAllByTestId('square-O')).toHaveLength(2);
      expect(screen.getAllByTestId('square-empty')).toHaveLength(4);
    });

    it('handles winning line with invalid indices gracefully', () => {
      const invalidWinningLine = [0, 1, 10]; // Index 10 doesn't exist
      render(<Board {...defaultProps} winningLine={invalidWinningLine} />);

      const squares = screen.getAllByTestId(/square-/);
      expect(squares[0]).toHaveAttribute('data-winning', 'true');
      expect(squares[1]).toHaveAttribute('data-winning', 'true');
      // Should not crash, other squares should be false
      expect(squares[2]).toHaveAttribute('data-winning', 'false');
    });
  });
});
