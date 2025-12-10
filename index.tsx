/**
 * @file This is the entry point of the application.
 * It renders the main App component into the root element of the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Initialize i18n

/**
 * The root element of the application.
 * @type {HTMLElement}
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);