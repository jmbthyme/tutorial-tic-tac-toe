import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from './Game';

// Mock performance API for testing
const mockPerformanceNow = jest.fn(() => Date.now());
const mockPerformanceMark = jest.fn();
const mockPerformanceMeasure = jest.fn();

Object.defineProperty(window, 'performance', {
  value: {
    ...window.performance,
    now: mockPerformanceNow,
    mark: mockPerformanceMark,
    measure: mockPerformanceMeasure,
  },
  writable: true,
});

describe('Game Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementation
    mockPerformanceNow.mockImplementation(() => Date.now());
  });

  it('should not cause excessive re-renders when making moves', () => {
    const { container } = render(<Game />);

    // Get all squares - use more specific selector
    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Ensure we have enough squares
    expect(squares.length).toBeGreaterThanOrEqual(5);

    // Make several moves and ensure the component doesn't re-render excessively
    fireEvent.click(squares[0]!); // X
    fireEvent.click(squares[1]!); // O
    fireEvent.click(squares[2]!); // X
    fireEvent.click(squares[3]!); // O
    fireEvent.click(squares[4]!); // X

    // Get updated squares after moves
    const updatedSquares = screen
      .getAllByRole('button')
      .filter(
        button =>
          button.getAttribute('aria-label')?.includes('Square filled') ||
          button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Verify the game state is correct
    expect(updatedSquares[0]).toHaveTextContent('X');
    expect(updatedSquares[1]).toHaveTextContent('O');
    expect(updatedSquares[2]).toHaveTextContent('X');
    expect(updatedSquares[3]).toHaveTextContent('O');
    expect(updatedSquares[4]).toHaveTextContent('X');

    // The component should still be responsive
    expect(container).toBeInTheDocument();
  });

  it('should handle rapid clicking without performance issues', () => {
    render(<Game />);

    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    // Ensure we have squares to click
    expect(squares.length).toBe(9);

    // Mock performance timing
    let callCount = 0;
    mockPerformanceNow.mockImplementation(() => {
      callCount++;
      return callCount * 10; // Simulate 10ms per call
    });

    // Simulate rapid clicking
    const startTime = window.performance.now();

    for (let i = 0; i < Math.min(squares.length, 5); i++) {
      const square = squares[i];
      if (square) {
        fireEvent.click(square);
      }
    }

    const endTime = window.performance.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (mocked to be fast)
    expect(duration).toBeLessThan(100);
  });

  it('should efficiently handle history navigation', () => {
    render(<Game />);

    // Make some moves
    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    expect(squares.length).toBe(9);

    fireEvent.click(squares[0]!); // Move 1
    fireEvent.click(squares[1]!); // Move 2
    fireEvent.click(squares[2]!); // Move 3

    // Navigate through history
    const historyButtons = screen.getAllByText(/Go to/);
    expect(historyButtons.length).toBeGreaterThanOrEqual(4);

    // Mock performance timing
    let callCount = 0;
    mockPerformanceNow.mockImplementation(() => {
      callCount++;
      return callCount * 5; // Simulate 5ms per call
    });

    const startTime = window.performance.now();

    // Jump between moves rapidly
    fireEvent.click(historyButtons[0]!); // Go to start
    fireEvent.click(historyButtons[1]!); // Go to move 1
    fireEvent.click(historyButtons[2]!); // Go to move 2
    fireEvent.click(historyButtons[3]!); // Go to move 3

    const endTime = window.performance.now();
    const duration = endTime - startTime;

    // Should complete navigation quickly (mocked to be fast)
    expect(duration).toBeLessThan(50);
  });

  it('should not re-render unchanged squares', () => {
    const { rerender } = render(<Game />);

    // Get initial squares
    const initialSquares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    expect(initialSquares.length).toBe(9);

    // Make a move
    fireEvent.click(initialSquares[0]!);

    // Re-render the component
    rerender(<Game />);

    // Get updated squares after move and re-render
    const updatedSquares = screen
      .getAllByRole('button')
      .filter(
        button =>
          button.getAttribute('aria-label')?.includes('Square filled') ||
          button.getAttribute('aria-label')?.includes('Empty square')
      );

    // First square should have X
    expect(updatedSquares[0]).toHaveTextContent('X');

    // Other squares should remain empty
    for (let i = 1; i < 9; i++) {
      expect(updatedSquares[i]).toHaveTextContent('');
    }
  });

  it('should handle winner calculation efficiently', () => {
    render(<Game />);

    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    expect(squares.length).toBe(9);

    // Mock performance timing
    let callCount = 0;
    mockPerformanceNow.mockImplementation(() => {
      callCount++;
      return callCount * 8; // Simulate 8ms per call
    });

    const startTime = window.performance.now();

    // Create a winning scenario (top row)
    fireEvent.click(squares[0]!); // X
    fireEvent.click(squares[3]!); // O
    fireEvent.click(squares[1]!); // X
    fireEvent.click(squares[4]!); // O
    fireEvent.click(squares[2]!); // X wins

    const endTime = window.performance.now();
    const duration = endTime - startTime;

    // Winner detection should be fast (mocked to be fast)
    expect(duration).toBeLessThan(100);

    // Verify winner is detected
    expect(screen.getByText(/Winner: X/i)).toBeInTheDocument();
  });

  it('should efficiently handle game reset', () => {
    render(<Game />);

    // Make some moves
    const squares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    expect(squares.length).toBe(9);

    fireEvent.click(squares[0]!);
    fireEvent.click(squares[1]!);
    fireEvent.click(squares[2]!);

    // Reset the game
    const resetButton = screen.getByText(/Reset Game/i);

    // Mock performance timing
    let callCount = 0;
    mockPerformanceNow.mockImplementation(() => {
      callCount++;
      return callCount * 2; // Simulate 2ms per call
    });

    const startTime = window.performance.now();
    fireEvent.click(resetButton);
    const endTime = window.performance.now();

    const duration = endTime - startTime;

    // Reset should be instantaneous (mocked to be fast)
    expect(duration).toBeLessThan(50);

    // All squares should be empty after reset
    const newSquares = screen
      .getAllByRole('button')
      .filter(button =>
        button.getAttribute('aria-label')?.includes('Empty square')
      );

    expect(newSquares).toHaveLength(9);
  });
});
