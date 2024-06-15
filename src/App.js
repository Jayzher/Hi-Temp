// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';
import AppNavBar from './components/AppNavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateNewTask from './navlinks/CreateNewTask';
import Profile from './navlinks/Profile';
import Planner from './navlinks/Planner';
import Employee from './navlinks/Employee';
import Messages from './navlinks/Messages';
import { UserProvider } from './userContext';
import { useNotification } from './NotificationContext'; // Import useNotification
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useSocket } from './SocketProvider'; // Import useSocket

function App() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const socket = useSocket();
  const [user, setUser] = useState({
    id: null,
    Status: null,
    profile: null,
    isAdmin: null,
    role: null,
    name: null,
    department: null,
    Tasks: null,
    changePassword: null
  });

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (newMessage) => {
        if (newMessage.recipientId === user.id) {
          showNotification(newMessage.content);
        }
      });

      return () => {
        socket.off('new_message');
      };
    }
  }, [socket, user.id, showNotification]);

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <AppNavBar />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Logout" element={<Logout />} />
            <Route path="/TasksCreate" element={<CreateNewTask />} />
            {/* Dashboard Routes */}
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Dashboard/:taskId" element={<Dashboard />} />
            <Route path="/Dashboard/profile" element={<Profile />} />
            {/* Employee Routes */}
            <Route path="/Employee" element={<Employee />} />
            <Route path="/Planner" element={<Planner />} />
            <Route path="/Messages" element={<Messages />} />
          </Routes>
        </Container>
      </Router>
    </UserProvider>
  );
}

export default App;
