import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import { NotificationProvider, useNotification } from './NotificationContext';
import { SocketProvider, useSocket } from './SocketProvider';

function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <SocketProvider>
          <Router>
            <AppNavBar />
            <AppContent />
          </Router>
        </SocketProvider>
      </NotificationProvider>
    </UserProvider>
  );
}

function AppContent() {
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
    changePassword: null,
  });

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        if (newMessage.recipientId === user.id) {
          showNotification(newMessage.content);
          navigate('/Messages');
        }
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, user.id, showNotification, navigate]);

  return (
    <Container>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Logout" element={<Logout />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/TasksCreate" element={<CreateNewTask />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Dashboard/:taskId" element={<Dashboard />} />
        <Route path="/Dashboard/profile" element={<Profile />} />
        <Route path="/Employee" element={<Employee />} />
        <Route path="/Planner" element={<Planner />} />
        <Route path="/Messages" element={<Messages />} />
      </Routes>
    </Container>
  );
}

export default App;
