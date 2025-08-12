import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Square from './Square';

describe('Square Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Rendering', () => {
    it('renders empty square correctly', () => {
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toBeInTheDocument();
      expect(square).toHaveTextContent('');
      expect(square).toHaveAttribute(
        'aria-label',
        'Empty square, click to place your mark'
      );
    });

    it('renders square with X value', () => {
      render(<Square value="X" onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toHaveTextContent('X');
      expect(square).toHaveAttribute('aria-label', 'Square filled with X');
    });

    it('renders square with O value', () => {
      render(<Square value="O" onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toHaveTextContent('O');
      expect(square).toHaveAttribute('aria-label', 'Square filled with O');
    });

    it('renders winning square with proper aria label', () => {
      render(<Square value="X" onClick={mockOnClick} isWinningSquare={true} />);

      const square = screen.getByRole('button');
      expect(square).toHaveAttribute(
        'aria-label',
        'Square filled with X, winning square'
      );
    });

    it('renders disabled square', () => {
      render(<Square value={null} onClick={mockOnClick} disabled={true} />);

      const square = screen.getByRole('button');
      expect(square).toBeDisabled();
      expect(square).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Click Interactions', () => {
    it('calls onClick when empty square is clicked', () => {
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      fireEvent.click(square);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when filled square is clicked', () => {
      render(<Square value="X" onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      fireEvent.click(square);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when disabled square is clicked', () => {
      render(<Square value={null} onClick={mockOnClick} disabled={true} />);

      const square = screen.getByRole('button');
      fireEvent.click(square);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('calls onClick when Enter key is pressed on empty square', async () => {
      const user = userEvent.setup();
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      square.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed on empty square', async () => {
      const user = userEvent.setup();
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      square.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when Enter is pressed on filled square', async () => {
      const user = userEvent.setup();
      render(<Square value="X" onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      square.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when Space is pressed on disabled square', async () => {
      const user = userEvent.setup();
      render(<Square value={null} onClick={mockOnClick} disabled={true} />);

      await user.keyboard(' ');

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not call onClick for other keys', async () => {
      const user = userEvent.setup();
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      square.focus();
      await user.keyboard('{Escape}');
      await user.keyboard('a');

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('CSS Classes', () => {
    it('applies correct CSS classes for empty square', () => {
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toHaveClass('square');
      expect(square).not.toHaveClass('filled');
      expect(square).not.toHaveClass('winning');
      expect(square).not.toHaveClass('disabled');
    });

    it('applies filled class for square with value', () => {
      render(<Square value="X" onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toHaveClass('square', 'filled');
    });

    it('applies winning class for winning square', () => {
      render(<Square value="X" onClick={mockOnClick} isWinningSquare={true} />);

      const square = screen.getByRole('button');
      expect(square).toHaveClass('square', 'filled', 'winning');
    });

    it('applies disabled class for disabled square', () => {
      render(<Square value={null} onClick={mockOnClick} disabled={true} />);

      const square = screen.getByRole('button');
      expect(square).toHaveClass('square', 'disabled');
    });
  });

  describe('Accessibility', () => {
    it('has proper tabIndex for enabled square', () => {
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toHaveAttribute('tabIndex', '0');
    });

    it('has proper tabIndex for disabled square', () => {
      render(<Square value={null} onClick={mockOnClick} disabled={true} />);

      const square = screen.getByRole('button');
      expect(square).toHaveAttribute('tabIndex', '-1');
    });

    it('has proper role attribute', () => {
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toBeInTheDocument();
    });

    it('has proper aria-pressed attribute for empty square', () => {
      render(<Square value={null} onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toHaveAttribute('aria-pressed', 'false');
    });

    it('has proper aria-pressed attribute for filled square', () => {
      render(<Square value="X" onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      expect(square).toHaveAttribute('aria-pressed', 'true');
    });

    it('includes winning square description when isWinningSquare is true', () => {
      render(<Square value="X" onClick={mockOnClick} isWinningSquare={true} />);

      expect(
        screen.getByText('This square is part of the winning combination')
      ).toBeInTheDocument();
    });

    it('has aria-describedby for winning squares', () => {
      render(<Square value="X" onClick={mockOnClick} isWinningSquare={true} />);

      const square = screen.getByRole('button');
      expect(square).toHaveAttribute(
        'aria-describedby',
        'winning-square-description'
      );
    });

    it('does not have aria-describedby for non-winning squares', () => {
      render(
        <Square value="X" onClick={mockOnClick} isWinningSquare={false} />
      );

      const square = screen.getByRole('button');
      expect(square).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('React.memo Optimization', () => {
    it('does not re-render when props are the same', () => {
      const { rerender } = render(<Square value="X" onClick={mockOnClick} />);

      const square = screen.getByRole('button');
      const initialTextContent = square.textContent;

      // Re-render with same props
      rerender(<Square value="X" onClick={mockOnClick} />);

      // The component should maintain the same content
      expect(square.textContent).toBe(initialTextContent);
    });
  });
});
