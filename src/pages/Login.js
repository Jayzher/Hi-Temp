import "../components/comp.css";
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
  const [showChange, setShowChange] = useState(false);

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
            text: "Login Successfully!",
            customClass: {
              popup: 'swal-mobile',
            }
          });

          navigate("/Dashboard");
        } else {
          swal.fire({
            title: "Wrong Username or Password!",
            icon: "error",
            text: "Check your Username or Password and try again!",
            customClass: {
              popup: 'swal-mobile',
            }
          });
        }
      })
      .catch(error => {
        console.error('Error logging in:', error);
      });
  };

  function check_user(userName) {
    fetch(`${process.env.REACT_APP_API_URL}/users/user-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userName
      }),
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(errorMessage => {
          throw new Error(errorMessage);
        });
      }
      return response.json();
    })
    .then(data => {
      if (data.changePassword === true) {
        setShowChange(true);
      } else {
        swal.fire({
          title: `Password change is not allowed for ${userName}!`,
          icon: "warning",
          text: "Ask the Administrator for Password Change!",
          customClass: {
            popup: 'swal-mobile',
          }
        });
      }
    })
    .catch(error => {
      console.error('Error changing password:', error.message);
      // Handle error here
    });
  }


 async function changePassword(e) {
  e.preventDefault();
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        newPassword: password,
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.success) {
      swal.fire({
        title: `Password Changed Successfully!`,
        icon: "success",
        text: "You can now log in with your new password!",
        customClass: {
          popup: 'swal-mobile',
        }
      });
      setShowChange(false);
    } else {
      swal.fire({
        title: `Something Went Wrong!`,
        icon: "error", // Changed from "danger" to "error" for a more appropriate icon
        text: "Please try again later!",
        customClass: {
          popup: 'swal-mobile',
        }
      });
      setShowChange(false);
    }
    return data;
  } catch (error) {
    console.error('Error changing password:', error.message);
    swal.fire({
      title: `Error Changing Password`,
      icon: "error",
      text: error.message,
      customClass: {
        popup: 'swal-mobile',
      }
    });
    return { success: false, message: 'Error changing password' };
  }
}


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
          Tasks: data.Tasks,
          changePassword: data.changePassword
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
          {!showChange ?  
            <Form id="login" onSubmit={login} style={{ background: "rgba(0,0,0,0.2)", width: "30%", border: "2px solid black", borderRadius: "10px" }}
              className="col-3 p-3 pt-3 d-flex flex-column align-items-center">
              <h1 className="text-center">LOGIN</h1>
              <Form.Group id="username" style={{ width: '79%' }} className="mb-3" controlId="formBasicEmail2">
                  <Form.Label className="fw-bold">Username</Form.Label>
                  <Form.Control type="text" placeholder="" value={username} onChange={e => { setUsername(e.target.value);}} required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail3">
                <Form.Label className="fw-bold">Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    style={{ width: '40%' }}
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
              <p style={{ cursor: "pointer", color: "blue" }} onClick={() => { check_user(username); }}>Change Password</p>
              <Button variant="primary" type="submit">
                Login
              </Button>
            </Form>
            :
            <Form id="login" onSubmit={changePassword} style={{ background: "rgba(0,0,0,0.2)", width: "30%", border: "2px solid black", borderRadius: "10px" }}
              className="col-3 p-3 pt-3 d-flex flex-column align-items-center">
              <h1 className="text-center">Change Password</h1>
              <Form.Group id="username" style={{ width: '79%' }} className="mb-3" controlId="formBasicEmail2">
                  <Form.Label className="fw-bold">Username</Form.Label>
                  <Form.Control type="text" placeholder="" value={username} onChange={e => { setUsername(e.target.value);}} disabled={true} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail3">
                <Form.Label className="fw-bold">New-Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    style={{ width: '40%' }}
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
                Change
              </Button>
            </Form>
          }
        </div>
      </Container>
  );
}
