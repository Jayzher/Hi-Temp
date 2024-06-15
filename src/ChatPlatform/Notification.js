// Notification.js
import React, { useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Notification = ({ message, show, handleClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000); // Automatically close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [show, handleClose]);

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast onClose={handleClose} show={show} delay={3000} autohide>
        <Toast.Header>
          <strong className="me-auto">New Message</strong>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default Notification;
