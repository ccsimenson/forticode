import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Initialize the React application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}

// Handle potential errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Log when the renderer process is ready
console.log('Renderer process initialized');
