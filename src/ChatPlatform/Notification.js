// src/components/Notification.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Notification.css';

const Notification = ({ message, show, handleClose }) => {
  const navigate = useNavigate();

  if (!show) return null;

  const handleNotificationClick = () => {
    handleClose();
    navigate('/Messages'); // Navigate to the Messages page
  };

  return (
    <div className="notification">
      <div className="notification-content" onClick={handleNotificationClick}>
        <span>{message}</span>
        <button onClick={handleClose} className="close-btn">&times;</button>
      </div>
    </div>
  );
};

export default Notification;
