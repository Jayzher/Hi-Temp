import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavBar from './components/AppNavBar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';
import Login from './pages/Login';
import Register from './pages/Register';
import Tabs from './components/Tab';
import { UserProvider } from './userContext';
import { NotificationProvider } from './NotificationContext'; // Ensure correct path

import Profile from './navlinks/Profile';
import Planner from './navlinks/Planner';
import CreateNewTask from './navlinks/CreateNewTask';
import Employee from './navlinks/Employee';
import Messages from './navlinks/Messages';

function App() {
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

  return (
    <UserProvider value={{ user, setUser }}> {/* Providing user context */}
      <NotificationProvider> {/* Providing notification context */}
        <Router>
          <AppNavBar /> {/* Displaying the application navigation bar */}
          <Container> {/* Using Bootstrap Container to wrap content */}
            <Routes>
              <Route path="/" element={<Home />} /> {/* Default Home route */}
              <Route path="/Login" element={<Login />} /> {/* Login route */}
              <Route path="/Logout" element={<Logout />} /> {/* Logout route */}
              <Route path="/TasksCreate" element={<CreateNewTask />} /> {/* Route to create new tasks */}
              {/* Dashboard Routes */}
              <Route path="/Dashboard" element={<Dashboard />} /> {/* Dashboard main route */}
              <Route path="/Dashboard/:taskId" element={<Dashboard />} /> {/* Dashboard route with taskId parameter */}
              <Route path="/Dashboard/profile" element={<Profile />} /> {/* Dashboard profile route */}
              {/* Employee Routes */}
              <Route path="/Employee" element={<Employee />} /> {/* Employee main route */}
              <Route path="/Planner" element={<Planner />} /> {/* Planner route */}
              <Route path="/Messages" element={<Messages />} /> {/* Messages route */}
            </Routes>
          </Container>
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
