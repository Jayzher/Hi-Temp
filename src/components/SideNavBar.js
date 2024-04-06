import React, { useState, useContext, useEffect } from 'react';
import "./comp.css";
import { Link } from "react-router-dom";
import UserContext from "../userContext";
import { useNavigate } from 'react-router-dom';

export default function SideNavBar() {
    const { user, setUser } = useContext(UserContext);
    const [activeLink, setActiveLink] = useState("");
    const [profile, setProfile] = useState();
    const [ role, setRole ] = useState(user.role);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/Login");
        } else {
            retrieveUserDetails(token);
        }
    }, []); // Empty dependency array to run the effect only once on component mount

    useEffect(() => {
        setActiveLink(""); // Reset active link whenever user context changes
        setProfile(user.profile);
    }, [user]);

    const retrieveUserDetails = (Token) => {
        fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}` // Replace Token with localStorage token
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
    };

    return (
        <div style={{borderRight: "3px solid black", borderLeft: "3px solid black", overflowY: "hidden", height: "100vh", width: "15vw", position: "fixed", left: "1px", zIndex: "2", backgroundImage: "linear-gradient( 92.7deg,  rgba(245,212,212,1) 8.5%, rgba(252,251,224,1) 90.2% )"}}>
            <div id="profile">
                <img
                    style={{ height: "130px", minWidth: "130px", maxWidth: "135px", border: "solid 3px rgba(0, 0, 0, 0.2)", borderRadius: "100px"}}
                    src={profile} // Update profile dynamically from user context user.profile
                    alt=""
                />
                <p id="name">{user.name}</p>
            </div>
            <nav>
                <ul id="sidenavlink" className="nav-links">
                    <Link style={{textDecoration: "none"}} to="/Dashboard" className="nav-link" onClick={() => handleLinkClick("Dashboard")}><li style={{borderTop: "2px solid black"}} className={`side-link ps-3 ${activeLink === "Dashboard" ? "active" : ""}`}>Dashboard</li></Link>
                    <Link style={{textDecoration: "none"}} to="/Dashboard/profile" className="nav-link" onClick={() => handleLinkClick("profile")}><li style={{borderTop: "2px solid black"}} className={`side-link ps-3 ${activeLink === "profile" ? "active" : ""}`}>Profile</li></Link>
                    <Link style={{textDecoration: "none"}} to="/" className="nav-link" onClick={() => handleLinkClick("planner")}><li  className={`side-link ps-3 ${activeLink === "planner" ? "active" : ""}`}>My Planner</li></Link>
                    <Link style={{textDecoration: "none"}} to="/" className="nav-link" onClick={() => handleLinkClick("schedule")}><li className={`side-link ps-3 ${activeLink === "schedule" ? "active" : ""}`}>My Schedule</li></Link>
                    {
                        (role === "Admin") ?
                        <>
                            <Link style={{textDecoration: "none"}} to="/TasksCreate" className="nav-link" onClick={() => handleLinkClick("TasksCreate")}><li className={`side-link ps-3 ${activeLink === "TasksCreate" ? "active" : ""}`}>Manage Tasks</li></Link>
                            <Link style={{textDecoration: "none"}} to="/Employee" className="nav-link" onClick={() => handleLinkClick("Employees")}><li className={`side-link ps-3 ${activeLink === "Employees" ? "active" : ""}`}>Employees</li></Link>
                        </>
                        :
                        <>
                            <Link style={{textDecoration: "none"}} to="/" className="nav-link" onClick={() => handleLinkClick("ongoingTasks")}><li className={`side-link ps-3 ${activeLink === "ongoingTasks" ? "active" : ""}`}>Ongoing Tasks</li></Link>
                            <Link style={{textDecoration: "none"}} to="/" className="nav-link" onClick={() => handleLinkClick("taskProgress")}><li className={`side-link ps-3 ${activeLink === "taskProgress" ? "active" : ""}`}>Task Progress</li></Link>
                        </>
                    }
                    <Link style={{textDecoration: "none"}} to="/" className="nav-link" onClick={() => handleLinkClick("completedTasks")}><li className={`side-link ps-3 ${activeLink === "completedTasks" ? "active" : ""}`}>Completed Tasks</li></Link>
                    <Link style={{textDecoration: "none"}} to="/" className="nav-link" onClick={() => handleLinkClick("announcements")}><li className={`side-link ps-3 ${activeLink === "announcements" ? "active" : ""}`}>Announcements</li></Link>
                    <Link style={{textDecoration: "none"}} to="/" className="nav-link" onClick={() => handleLinkClick("account")}><li className={`side-link ps-3 ${activeLink === "account" ? "active" : ""}`} style={{ borderBottom: "2px solid black" }}>Account</li></Link>
                    <Link style={{textDecoration: "none"}} to="/Logout" className="nav-link"><li className="side-link" style={{ border: "1px solid black", bottom: "0", position: "absolute", textAlign: "center" }}>Logout</li></Link>
                </ul>
            </nav>
        </div>
    )
}
