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
    try {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, message }]);
      _toast.info(message);
    } catch (error) {
      console.error('Error showing notification:', error);
      // Optionally handle or log the error here
    }
  };

  const hideNotification = (id) => {
    try {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    } catch (error) {
      console.error('Error hiding notification:', error);
      // Optionally handle or log the error here
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      <ToastContainer />
      {children}
    </NotificationContext.Provider>
  );
};
