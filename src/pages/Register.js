import React, { useState, useEffect, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2';
import UserContext from '../userContext';
import { useNavigate } from 'react-router-dom';
import Employee_Details from '../components/Employee_Details';
import GetDepartment from '../components/GetDepartment';

export default function Register() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [Password1, setPassword1] = useState("");
  const [Password2, setPassword2] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState();

  useEffect(() => {
    if (username !== '' && Password1 !== '' && Password2 !== '' && name !== '') {
      setIsActive(true);
    } else {
      setIsActive(false);
    }

    if (name !== "") {
      fetch(`${process.env.REACT_APP_API_URL}/users/checkEmail`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data) {
            Swal.fire({
              title: `${name} is already taken`,
              icon: "error",
              text: "Please try again."
            })
            setName(name.slice(0, name.length - 1));
          }
        })
    }
  }, [username, Password1, Password2, name, user.id]);

  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };

  const togglePasswordVisibility2 = () => {
    setShowPassword2(!showPassword2);
  };

  function setIsAdmin(e) {
    if (e === "admin") {
      setRole(true);
    }
    setRole(e);
  }

  function registerUser(e) {
    e.preventDefault();

    // Check if a file is selected for profile upload
    if (file) {
      // Upload image to Cloudinary
      handleProfileUpload(file)
        .then(profileUrl => {
          // Continue with user registration...
          localStorage.setItem("username", username)
          fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name,
              profile: profileUrl,
              department: department,
              role: role,
              username: username,
              password: Password2
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data === true) {
                Swal.fire({
                  title: "Registered!",
                  icon: "success",
                  text: "You have Successfully Registered."
                })
              }
            })
            .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error uploading profile:', error));
    } else {
      // Continue with user registration without profile upload
      localStorage.setItem("username", username)
      fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          department: department,
          role: role,
          username: username,
          password: Password2
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data === true) {
            Swal.fire({
              title: "Registered!",
              icon: "success",
              text: "You have Successfully Registered."
            })
          }
        })
        .catch(error => console.error('Error:', error));
    }

    // Reset form fields
    setName('');
    setUsername('');
    setPassword1('');
    setPassword2('');
  }

  const handleProfileUpload = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'profile_upload'); // Use your Cloudinary upload preset name

    return fetch(`https://api.cloudinary.com/v1_1/dgzhcuwym/image/upload`, {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to upload image to Cloudinary');
        }
        return response.json();
      })
      .then(data => {
        if (data.secure_url) {
          setProfile(data.secure_url); // Update profile state with uploaded image URL
          return data.secure_url;
        }
        throw new Error('No secure URL found in Cloudinary response');
      })
      .catch(error => {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
      });
  }

  return (
    <div className="dashboard-container">
      <div className="d-flex flex-row" style={{ height: "fit-content", marginLeft: "15vw", backgroundImage: "linear-gradient( 92.7deg,  rgba(245,212,212,1) 8.5%, rgba(252,251,224,1) 90.2% )" }}>
        <div style={{ marginTop: "5vh", height: "100vh" }} className="d-flex flex-row justify-content-center ms-3 ">
          <Form onSubmit={registerUser} style={{ width: "30vw", height: "fit-content", background: "rgba(0,0,0,0.2)", border: "2px solid black", borderRadius: "10px" }}
            className="p-3 d-flex flex-column align-items-center">
            <h1 className="text-center mb-2">Add Employee</h1>
            <Form.Group style={{ width: "25vw" }} className="mb-3">
              <Form.Label className="fw-bold">Full Name: </Form.Label>
              <Form.Control type="text" placeholder="Enter Full Name" value={name} onChange={e => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group style={{ width: "25vw" }} className="mb-3">
              <Form.Label className="fw-bold">Username: </Form.Label>
              <Form.Control type="text" placeholder="Enter Username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" required />
            </Form.Group>
            <Form.Group style={{ width: "25vw" }} className="mb-3">
              <Form.Label className="fw-bold">Profile: </Form.Label>
              <Form.Control type="file" onChange={e => setFile(e.target.files[0])} />
            </Form.Group>
            <Form.Group style={{ width: "25vw" }} className="mb-3">
              <Form.Label className="fw-bold">Department: </Form.Label>
              <Form.Select onChange={e => setDepartment(e.target.value)} required>
                <option value="">Select Department</option>
                <option value="CEO">CEO</option>
                <GetDepartment />
              </Form.Select>
            </Form.Group>
            <Form.Group style={{ width: "25vw" }} className="mb-3">
              <Form.Label className="fw-bold">Role: </Form.Label>
              <Form.Select onChange={e => setIsAdmin(e.target.value)} required>
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </Form.Select>
            </Form.Group>
            <Form.Group style={{ width: "25vw" }} className="mb-3">
              <Form.Label className="fw-bold">Password: </Form.Label>
              <div className="d-flex flex-row">
                <Form.Control
                  style={{ width: 'calc(25vw - 40px)' }}
                  type={showPassword1 ? 'text' : 'password'}
                  placeholder="Password"
                  value={Password1}
                  onChange={e => setPassword1(e.target.value)}
                  autoComplete="off" required />
                <Button
                  variant="secondary"
                  onClick={togglePasswordVisibility1}
                >
                  {showPassword1 ? 'Hide' : 'Show'}
                </Button>
              </div>
            </Form.Group>
            <Form.Group style={{ width: "25vw" }} className="mb-3">
              <Form.Label className="fw-bold">Verify Password: </Form.Label>
              <div className="d-flex flex-row">
                <Form.Control
                  style={{ width: 'calc(25vw - 40px)' }}
                  type={showPassword2 ? 'text' : 'password'}
                  placeholder="Verify Password"
                  value={Password2}
                  onChange={e => setPassword2(e.target.value)}
                  autoComplete="off" required />
                <Button
                  variant="secondary"
                  onClick={togglePasswordVisibility2}
                >
                  {showPassword2 ? 'Hide' : 'Show'}
                </Button>
              </div>
            </Form.Group>
            {
              (isActive) ?
                <Button variant="primary" type="submit" id="submitBtn">
                  Submit
                </Button>
                :
                <Button variant="danger" type="submit" id="submitBtn" disabled>
                  Submit
                </Button>
            }
          </Form>
        </div>
        <div>
          <Employee_Details />
        </div>
      </div>
    </div>
  );
}
