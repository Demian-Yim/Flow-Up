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
    <AppProvider>
      {/* Fix: Wrapped App in a fragment to resolve a potential typing issue with JSX children. */}
      <>
        <App />
      </>
    </AppProvider>
  </React.StrictMode>
);