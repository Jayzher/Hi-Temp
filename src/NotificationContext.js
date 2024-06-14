// src/NotificationContext.js
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: '', show: false });

  const showNotification = (message) => {
    setNotification({ message, show: true });
  };

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, closeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
