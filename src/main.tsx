import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Initialize observability (singleton is created on import)
import { observability } from './observability';
import { ObservabilityErrorBoundary } from './observability/ErrorBoundary';

// Log app initialization
observability.info('App initializing', 'main', {
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString(),
});

// Global error handlers
window.onerror = (message, source, lineno, colno, error) => {
  observability.recordError(
    error || new Error(String(message)),
    'window.onerror',
    undefined,
    { source, lineno, colno },
  );
};

window.onunhandledrejection = (event) => {
  const error = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason));
  observability.recordError(error, 'unhandledrejection');
};

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <ObservabilityErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ObservabilityErrorBoundary>
  // </StrictMode>
);
