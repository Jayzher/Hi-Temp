// src/components/Notification.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

const Notification = ({ message, show, handleClose }) => {
  const navigate = useNavigate();

  if (!show) return null;

  const handleNotificationClick = () => {
    handleClose();
    navigate('/Messages');
  };

  return (
    <div className="notification">
      <div className="notification-content">
        <span>{message}</span>
        <button onClick={handleClose} className="close-btn">&times;</button>
      </div>
      <div className="notification-overlay" onClick={handleNotificationClick}></div>
    </div>
  );
};

export default Notification;
