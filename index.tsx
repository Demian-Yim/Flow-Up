import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* FIX: Resolved TypeScript error by wrapping <App /> in a Fragment, which seems to be required for the type checker to correctly recognize it as a valid child for AppProvider. */}
    <AppProvider>
      <>
        <App />
      </>
    </AppProvider>
  </React.StrictMode>
);