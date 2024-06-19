import React, { useState, useContext, useEffect } from 'react';
import "./Style.css";
import { Link } from "react-router-dom";
import UserContext from "../userContext";
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useSocket } from '../SocketProvider';
import { useNotification } from '../NotificationContext';

export default function SideNavBar() {
    const { user, setUser } = useContext(UserContext);
    const [activeLink, setActiveLink] = useState("");
    const [profile, setProfile] = useState();
    const [role, setRole] = useState(user.role);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const { showNotification } = useNotification();
    const socket = useSocket();
    
    useEffect(() => {
        if (socket) {
          const handleNewMessage = (newMessage) => {
            const isRecipient = newMessage.recipient.id === user.id;
            const isSender = newMessage.sender.id === user.id;

            if (isRecipient) {
              showNotification(`New message from ${newMessage.sender.name}`);
            }
          };          

          const handleTaskUpdate = (taskUpdate) => {
            const name = taskUpdate.name === user.name;

            if (name) {
              showNotification(`Your Task has been Updated: ${taskUpdate.taskType}`);
            }
          };

          socket.on('new_message', handleNewMessage);
          socket.on('TaskUpdated', handleTaskUpdate);

          return () => {
            socket.off('new_message', handleNewMessage);
            socket.on('TaskUpdated', handleTaskUpdate);
          };
        }
    }, [socket, user.name]);

    useEffect(() => {
        setActiveLink("");
        setProfile(user.profile);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/Login");
        } else {
            retrieveUserDetails(token);
        }
    }, [user.id]);

    const retrieveUserDetails = (Token) => {
        fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
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
            setRole(data.role);
        })
        .catch(error => {
            console.error("Error retrieving user details:", error);
        });
    }

    const handleLinkClick = (aLink) => {
        setActiveLink(aLink);
        setIsSidebarOpen(false); // Close sidebar on link click
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <div className={`burger-menu ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}>
                <div className="burger-bar"></div>
                <div className="burger-bar"></div>
                <div className="burger-bar"></div>
            </div>
            <div id="sidenav" className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{background: "azure", overflowY: "auto"}}>
                <div id="profile">
                    <img
                        style={{ height: "130px", minWidth: "130px", maxWidth: "135px", border: "solid 3px rgba(0, 0, 0, 0.2)", borderRadius: "100px"}}
                        src={profile}
                        alt=""
                    />
                    <p id="name">{user.name}</p>
                </div>
                <nav>
                    <ul id="sidenavlink" className="nav-links">
                        <Link style={{ textDecoration: "none" }} to="/Dashboard" className="nav-link" onClick={() => handleLinkClick("Dashboard")}><li style={{ borderTop: "2px solid black" }} className={`side-link ps-3 ${activeLink === "Dashboard" ? "active" : ""}`}>Dashboard</li></Link>
                        <Link style={{ textDecoration: "none" }} to="/Dashboard/profile" className="nav-link" onClick={() => handleLinkClick("profile")}><li style={{ borderTop: "2px solid black" }} className={`side-link ps-3 ${activeLink === "profile" ? "active" : ""}`}>Profile</li></Link>
                        <Link style={{ textDecoration: "none" }} to="/Planner" className="nav-link" onClick={() => handleLinkClick("planner")}><li className={`side-link ps-3 ${activeLink === "planner" ? "active" : ""}`}>Weekly Report</li></Link>
                        {
                            (role === "Admin") ?
                            <>
                                <Link style={{ textDecoration: "none" }} to="/TasksCreate" className="nav-link" onClick={() => handleLinkClick("TasksCreate")}><li className={`side-link ps-3 ${activeLink === "TasksCreate" ? "active" : ""}`}>Manage Tasks</li></Link>
                                <Link style={{ textDecoration: "none" }} to="/Employee" className="nav-link" onClick={() => handleLinkClick("Employees")}><li className={`side-link ps-3 ${activeLink === "Employees" ? "active" : ""}`}>Employees</li></Link>
                            </>
                            :
                            <>
                                {/* Other links for non-admin users */}
                            </>
                        }
                        <Link style={{ textDecoration: "none" }} to="/Messages" className="nav-link" onClick={() => handleLinkClick("Messages")}><li className={`side-link ps-3 ${activeLink === "Messages" ? "active" : ""}`}>Messages</li></Link>
                        <Link style={{ textDecoration: "none" }} to="/Logout" className="nav-link"><li className="side-link" style={{ border: "1px solid black", bottom: "0", position: "absolute", textAlign: "center" }}>Logout</li></Link>
                    </ul>
                </nav>
            </div>
        </>
    )
}
