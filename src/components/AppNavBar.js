import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import UserContext from '../userContext';
import logo from '../images/logo.png';

export default function AppNavBar() {
  const { user, setUser } = useContext(UserContext);

  return (
    <Navbar style={{ display: "flex", background: "rgba(1, 1, 1, 0.5)" }} variant="light">
      <Link to="/">
        <img src={logo} style={{ height: "80px" }} className="ms-3" alt="Logo" />
      </Link>
      {user.id === null || user.id === undefined ? (
        <Nav className="ms-auto me-5">
          <Link to="/login" className="nav-link fs-4 fw-bold">Login</Link>
        </Nav>
      ) : (
        <>
        </>
      )}
    </Navbar>
  );
}
