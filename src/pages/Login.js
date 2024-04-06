import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Form, InputGroup, Button, Container } from 'react-bootstrap';
import swal from 'sweetalert2';
import UserContext from '../userContext';
import io from 'socket.io-client';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const login = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(res => res.json())
    .then(data => {
      if (typeof data.access !== "undefined") {
        localStorage.setItem('token', data.access)
        retrieveUserDetails(data.access);

        swal.fire({
          title: "Authentication Successful",
          icon: "success",
          text: "Login Successfully!"
        });

        navigate("/Dashboard");
      } else {
        swal.fire({
          title: "Wrong Username or Password!",
          icon: "error",
          text: "Check your Username or Password and try again!"
        });
      }
    })
    .catch(error => {
      console.error('Error logging in:', error);
    });
  };

  const retrieveUserDetails = (token) => {
    fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      return response.json();
    })
    .then(data => {
      setUser({
        id: data._id,
        Status: data.Status,
        profile: data.profile,
        isAdmin: data.isAdmin,
        role: data.role,
        department: data.department,
        name: data.name,
        Tasks: data.Tasks
      });

      // Establish WebSocket connection
      const socket = io(process.env.REACT_APP_API_URL);

      // Listen for connection open
      socket.onopen = () => {
        // Emit userStatusChanged event
        socket.send(JSON.stringify({ userId: data._id, status: true }));
      };
    })
    .catch(error => {
      console.error('Error fetching user details:', error);
    });
  };

  return (
    (user.id !== undefined && user.id !== null) ?
      <Navigate to="/Dashboard" />
      :
      <Container style={{ height: "87vh" }}>
        <div style={{ marginTop: "5vh", marginBottom: "15.5vh" }} className="d-flex flex-row justify-content-center">
          <Form onSubmit={login} style={{ background: "rgba(0,0,0,0.2)", width: "30vw", border: "2px solid black", borderRadius: "10px" }}
            className="col-3 p-5 pt-3 m-5 d-flex flex-column align-items-center">
            <h1 className="text-center">LOGIN</h1>
            <Form.Group className="mb-3" controlId="formBasicEmail2">
              <Form.Label className="fw-bold">Username</Form.Label>
              <Form.Control style={{ width: "21.5vw" }} type="text" placeholder="" value={username} onChange={e => setUsername(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail3">
              <Form.Label className="fw-bold">Password</Form.Label>
              <InputGroup>
                <Form.Control
                  style={{ width: 'calc(20vw - 40px)' }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </InputGroup>
            </Form.Group>
            <Button variant="primary" type="submit">
              Login
            </Button>
          </Form>
        </div>
      </Container>
  );
}
