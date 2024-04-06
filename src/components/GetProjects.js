import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import UserContext from '../userContext';

export default function GetProjects() {
    const [projects, setProjects] = useState([]); // Updated state variable to store project data
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch project data
        fetchProjectsData();
    }, []); // Fetch data once when the component mounts

    const fetchProjectsData = () => {
        fetch(`${process.env.REACT_APP_API_URL}/project/allProject`, { // Use environment variable for API URL
            method: "GET",
            headers: { 
                'Content-Type' : 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            // Update state with fetched project data
            setProjects(data.map(proj => (
                <option key={proj.projectName} value={proj.projectName}>{proj.projectName}</option>
            )));
        })
        .catch(error => {
            console.error("Error fetching projects:", error);
            // Handle error, e.g., display an error message to the user
        });
    };

    return (
        <>{projects}</> // Render project options
    );
}
