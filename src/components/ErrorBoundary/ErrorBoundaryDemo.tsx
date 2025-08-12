import React, { useState } from 'react';

/**
 * Demo component for testing ErrorBoundary functionality
 * This component is only intended for development/testing purposes
 */
const ErrorBoundaryDemo: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Demo error thrown for ErrorBoundary testing');
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>ErrorBoundary Demo Component</h3>
      <p>This component can be used to test the ErrorBoundary functionality.</p>
      <button
        onClick={() => setShouldThrow(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Throw Error
      </button>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Click the button above to trigger an error and test the ErrorBoundary.
      </p>
    </div>
  );
};

export default ErrorBoundaryDemo;
