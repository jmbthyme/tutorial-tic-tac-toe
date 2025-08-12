# ErrorBoundary Component

A React Error Boundary component that catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI instead of the component tree that crashed.

## Features

- **Error Catching**: Catches errors during rendering, in lifecycle methods, and in constructors of the whole tree below them
- **Graceful Fallback**: Displays user-friendly error messages instead of crashing the entire application
- **Error Recovery**: Provides a reset mechanism to recover from errors
- **Development Support**: Shows detailed error information in development mode
- **Accessibility**: Includes proper ARIA attributes and keyboard navigation
- **Customizable**: Supports custom fallback UI and error handling callbacks

## Usage

### Basic Usage

```tsx
import ErrorBoundary from './components/ErrorBoundary';
import MyComponent from './MyComponent';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Error Handler

```tsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to error reporting service
    console.error('Application error:', error, errorInfo);
    // Send to monitoring service
    // errorReportingService.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback UI

```tsx
import ErrorBoundary from './components/ErrorBoundary';

const customFallback = (
  <div>
    <h2>Something went wrong</h2>
    <p>Please refresh the page or contact support.</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary fallback={customFallback}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Props

| Prop       | Type                                                 | Default     | Description                                        |
| ---------- | ---------------------------------------------------- | ----------- | -------------------------------------------------- |
| `children` | `ReactNode`                                          | -           | The child components to wrap with error boundary   |
| `fallback` | `ReactNode`                                          | `undefined` | Custom fallback UI to display when an error occurs |
| `onError`  | `(error: Error, errorInfo: React.ErrorInfo) => void` | `undefined` | Callback function called when an error is caught   |

## Error Information

In development mode, the ErrorBoundary displays detailed error information including:

- Error message and stack trace
- Component stack trace showing which components were involved in the error

This information is hidden in production to avoid exposing sensitive details to users.

## Error Recovery

The ErrorBoundary provides a "Reset Game" button that allows users to recover from errors by:

1. Clearing the error state
2. Re-rendering the child components
3. Allowing the application to continue functioning

## Limitations

Error Boundaries do **not** catch errors for:

- Event handlers (use try-catch for these)
- Asynchronous code (e.g., setTimeout or requestAnimationFrame callbacks)
- Errors thrown during server-side rendering
- Errors thrown in the error boundary itself (rather than its children)

## Accessibility Features

- Uses `role="alert"` to announce errors to screen readers
- Provides descriptive `aria-label` attributes for interactive elements
- Supports keyboard navigation
- Maintains proper focus management

## Styling

The component uses CSS Modules with the design system variables. The styles are responsive and follow accessibility guidelines for color contrast and touch targets.

## Testing

The ErrorBoundary component includes comprehensive unit tests covering:

- Normal rendering without errors
- Error catching and fallback UI display
- Custom fallback UI rendering
- Error callback invocation
- Reset functionality
- Development vs production mode behavior
- Accessibility features
- Keyboard navigation

## Development Testing

Use the `ErrorBoundaryDemo` component to test the ErrorBoundary functionality during development:

```tsx
import ErrorBoundary from './components/ErrorBoundary';
import ErrorBoundaryDemo from './components/ErrorBoundary/ErrorBoundaryDemo';

function App() {
  return (
    <ErrorBoundary>
      <ErrorBoundaryDemo />
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Best Practices

1. **Place Error Boundaries Strategically**: Use them at multiple levels of your component tree
2. **Don't Overuse**: Don't wrap every component; focus on key boundaries
3. **Log Errors**: Always implement error logging for debugging and monitoring
4. **Provide Recovery Options**: Give users a way to recover from errors
5. **Test Error Scenarios**: Regularly test error boundary functionality
6. **Monitor in Production**: Use error reporting services to track errors in production

## Integration with Tic-Tac-Toe Game

In the tic-tac-toe application, the ErrorBoundary wraps the main Game component to:

- Catch any errors in game logic or rendering
- Provide a way to reset the game if something goes wrong
- Maintain a good user experience even when errors occur
- Log errors for debugging purposes

This ensures that users can continue playing even if unexpected errors occur in the game components.
