import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Game from './components/Game';

const App: React.FC = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo): void => {
    // Log error for debugging purposes
    console.error(
      'Application error caught by ErrorBoundary:',
      error,
      errorInfo
    );

    // In a real application, you might want to send this to an error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <Game />
    </ErrorBoundary>
  );
};

export default App;
