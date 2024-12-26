import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { createRoot } from 'react-dom/client';

// Get the root DOM node
const container = document.getElementById('root');

// Create a React root and render your app
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
