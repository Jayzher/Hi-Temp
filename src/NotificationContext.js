import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast as _toast, ToastContainer } from 'react-toastify';
import { useSocket } from '../SocketProvider'; // Assuming you have SocketProvider set up
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

  // Effect to handle incoming messages from the socket
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      showNotification(`New message from ${newMessage.sender.name}: ${newMessage.content}`);
    };

    if (socket) {
      socket.on('new_message', handleNewMessage);
    }

    return () => {
      if (socket) {
        socket.off('new_message', handleNewMessage);
      }
    };
  }, [socket]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      <ToastContainer /> {/* The ToastContainer can be rendered here */}
      {children}
    </NotificationContext.Provider>
  );
};
