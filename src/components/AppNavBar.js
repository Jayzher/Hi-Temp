import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useEffect, useContext } from 'react';
import UserContext from '../userContext';
import logo from '../images/logo.png';

export default function AppNavBar() {

  const {user, setUser} = useContext(UserContext);

  return (
      (user.id === null || user.id === undefined) ?
      <>
        <Navbar style={{display: "flex", background: "rgba(1, 1, 1, 0.5)"}} variant="light">
            <img src={logo} style={{height: "80px"}} className="ms-3" />
            {/*<Navbar.Brand href="/" className="ms-3 fw-bolder fs-3">HI-TEMP</Navbar.Brand>*/}
            <Nav className="ms-auto me-5">
              <Nav.Link href="/Login" className="fs-4 fw-bold">Login</Nav.Link>
            </Nav>
        </Navbar>
      </>
      :
      <>
      
      </>
  );
} 