import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SocketProvider } from './SocketProvider';
import { NotificationProvider } from './NotificationContext';

const root = document.getElementById('root');
createRoot(root).render(
  <SocketProvider url="https://hi-temp-database.onrender.com">
    <NotificationProvider>
      <React.StrictMode>
        <Router>
          <App />
        </Router>
      </React.StrictMode>
    </NotificationProvider>
  </SocketProvider>
);
