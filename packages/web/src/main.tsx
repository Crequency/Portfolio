import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import i18n from './i18n.js';

// Wait for i18n to initialize before rendering to avoid showing keys
i18n.init().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
