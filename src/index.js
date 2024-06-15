// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SocketProvider } from './SocketProvider';
import { NotificationProvider } from './NotificationContext';

const root = document.getElementById('root');
createRoot(root).render(
  <React.StrictMode>
    <NotificationProvider>
      <SocketProvider url="https://hi-temp-database.onrender.com">
        <App />
      </SocketProvider>
    </NotificationProvider>
  </React.StrictMode>
);
