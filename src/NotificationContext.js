import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast as _toast, ToastContainer } from 'react-toastify';
import { useSocket } from './SocketProvider'; // Assuming you have SocketProvider set up
import 'react-toastify/dist/ReactToastify.css';

// Create a context object
const NotificationContext = createContext();

// Custom hook to consume the context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Provider component that wraps around the application
export const NotificationProvider = ({ children }) => {
  const socket = useSocket(); // Get the socket instance using useSocket hook
  const [notifications, setNotifications] = useState([]);

  // Function to show a notification
  const showNotification = (message) => {
    const id = Date.now();
    setNotifications((prevNotifications) => [...prevNotifications, { id, message }]);
    _toast.info(message);
  };

  // Function to hide a notification based on its ID
  const hideNotification = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      <ToastContainer /> {/* The ToastContainer can be rendered here */}
      {children}
    </NotificationContext.Provider>
  );
};
