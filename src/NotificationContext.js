// NotificationContext.js

import React, { createContext, useContext, useState } from 'react';
import { toast as _toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message) => {
    const id = Date.now();
    setNotifications((prevNotifications) => [...prevNotifications, { id, message }]);
    _toast.info(message); // Show toast notification using react-toastify
  };

  const hideNotification = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      <ToastContainer />
      {children}
    </NotificationContext.Provider>
  );
};
