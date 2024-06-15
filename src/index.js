import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SocketProvider } from './SocketProvider';

const root = document.getElementById('root');
createRoot(root).render(
  <SocketProvider url="https://hi-temp-database.onrender.com">
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </SocketProvider>
);
