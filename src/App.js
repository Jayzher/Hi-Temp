import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';
import AppNavBar from './components/AppNavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Tabs from './components/Tab';
import { UserProvider } from './userContext';
import {useState, useEffect} from 'react';
import Profile from './navlinks/Profile';
import CreateNewTask from './navlinks/CreateNewTask';
import Employee from './navlinks/Employee';


function App() {
  const [user, setUser] = useState({
    id: null,
    Status: null,
    profile: null,
    isAdmin: null,
    role: null,
    name: null,
    department: null,
    Tasks: null
  });

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <AppNavBar />
        <Container>
          <Routes>
            <Route path="/Hi-Temp" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Logout" element={<Logout />} />
            <Route path="/TasksCreate" element={<CreateNewTask />} />
            {/* Dashboard Routes */}
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Dashboard/:taskId" element={<Dashboard />} />
            <Route path="/Dashboard/profile" element={<Profile />} />
            {/* Employee Routes */}
            <Route path="/Employee" element={<Employee />} />
          </Routes>
        </Container>
      </Router>
    </UserProvider>
  );
}


export default App;
