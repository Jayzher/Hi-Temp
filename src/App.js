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
import { ReactProvider } from './ReactContext';
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

  const [contextVar, setContextVar] = useState({
    showUsers: true
  });

  return (
    <UserProvider value={{ user, setUser }}>
      <ReactProvider value={{ contextVar, setContextVar }}>
        <NotificationProvider>
          <Router>
            <AppNavBar /> 
            <Container> 
              <Routes>
                <Route path="/" element={<Login />} /> 
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
        </NotificationProvider>
      </ReactProvider>
    </UserProvider>
  );
}

export default App;