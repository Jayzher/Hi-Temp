import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import UserContext from '../userContext';

export default function GetTaskType({ department }) {
    const [types, setTypes] = useState([]); // Updated state variable to store task types
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch task types data when department changes
        fetchTaskTypes();
    }, [department]); // Fetch data whenever department changes

    const fetchTaskTypes = () => {
        fetch(`${process.env.REACT_APP_API_URL}/users/tasktypes`, { // Use environment variable for API URL
            method: "POST",
            headers: { 
                'Content-Type' : 'application/json'
            }, 
            body: JSON.stringify({
                department: department
            })
        })
        .then(res => res.json())
        .then(data => {
            // Update state with fetched task types data
            setTypes(data.taskTypes.map(item => (
                <option key={item.name} value={item.name}>{item.name}</option>
            )));
        })
        .catch(error => {
            console.error("Error fetching task types:", error);
            // Handle error, e.g., display an error message to the user
        });
    };

    return (
        <>{types}</> // Render task type options
    );
}
