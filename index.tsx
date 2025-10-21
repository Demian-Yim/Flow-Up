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
    {/* Fix: Resolved TypeScript error by passing <App /> directly as a child to <AppProvider>, which expects a 'children' prop. The unnecessary fragment has been removed. */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);