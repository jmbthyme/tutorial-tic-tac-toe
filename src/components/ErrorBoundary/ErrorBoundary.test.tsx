import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from './ErrorBoundary';

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll((): void => {
  console.error = jest.fn();
});

afterAll((): void => {
  console.error = originalError;
});

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = false,
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that throws an error in useEffect (currently unused but kept for future testing)
// const ThrowErrorInEffect: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
//   React.useEffect(() => {
//     if (shouldThrow) {
//       throw new Error('Effect error');
//     }
//   }, [shouldThrow]);
//
//   return <div>No error in effect</div>;
// };

describe('ErrorBoundary', () => {
  beforeEach((): void => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', (): void => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws an error', (): void => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We're sorry, but something unexpected happened/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset the game and try again/i })
    ).toBeInTheDocument();
  });

  it('renders custom fallback UI when provided', (): void => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(
      screen.queryByText('Oops! Something went wrong')
    ).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', (): void => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('logs error to console when error occurs', (): void => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('resets error state when reset button is clicked', (): void => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error UI should be visible
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Click reset button
    fireEvent.click(
      screen.getByRole('button', { name: /reset the game and try again/i })
    );

    // Re-render with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should show normal content again
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows error details in development mode', (): void => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText('Error Details (Development Only)')
    ).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(screen.getByText('Error Details (Development Only)'));

    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText('Component Stack:')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', (): void => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.queryByText('Error Details (Development Only)')
    ).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('has proper accessibility attributes', (): void => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();

    const resetButton = screen.getByRole('button', {
      name: /reset the game and try again/i,
    });
    expect(resetButton).toHaveAttribute(
      'aria-label',
      'Reset the game and try again'
    );
    expect(resetButton).toHaveAttribute('type', 'button');
  });

  it('handles keyboard navigation properly', (): void => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = screen.getByRole('button', {
      name: /reset the game and try again/i,
    });

    // Button should be focusable
    resetButton.focus();
    expect(resetButton).toHaveFocus();

    // Should respond to Enter key
    fireEvent.keyDown(resetButton, { key: 'Enter', code: 'Enter' });
    // Note: The actual reset behavior would need to be tested with a full component tree
  });

  it('maintains error state across re-renders until reset', (): void => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error UI should be visible
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Re-render with same error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should still show error UI
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not catch errors in event handlers', (): void => {
    // This test verifies that ErrorBoundary only catches render errors,
    // not errors in event handlers (which is the expected React behavior)
    const ErrorInHandler: React.FC = () => {
      const handleClick = () => {
        throw new Error('Event handler error');
      };

      return <button onClick={handleClick}>Click me</button>;
    };

    render(
      <ErrorBoundary>
        <ErrorInHandler />
      </ErrorBoundary>
    );

    const button = screen.getByRole('button', { name: 'Click me' });

    // This should not trigger the error boundary
    expect(() => {
      fireEvent.click(button);
    }).toThrow('Event handler error');

    // Error boundary should not be triggered
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles multiple error scenarios', (): void => {
    const MultipleErrors: React.FC<{ errorType: 'render' | 'none' }> = ({
      errorType,
    }): React.JSX.Element => {
      if (errorType === 'render') {
        throw new Error('Render error');
      }
      return <div>No error</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <MultipleErrors errorType="none" />
      </ErrorBoundary>
    );

    // Initially no error
    expect(screen.getByText('No error')).toBeInTheDocument();

    // Trigger error
    rerender(
      <ErrorBoundary>
        <MultipleErrors errorType="render" />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Reset
    fireEvent.click(
      screen.getByRole('button', { name: /reset the game and try again/i })
    );

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <MultipleErrors errorType="none" />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});
