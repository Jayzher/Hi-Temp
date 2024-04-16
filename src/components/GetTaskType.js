import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import UserContext from '../userContext';

export default function GetTaskType({ department }) {
    const [types, setTypes] = useState([]); // Updated state variable to store task types
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch task types data when department is not null or an empty string
        if (department) {
            fetchTaskTypes();
        }
    }, [department]); // Fetch data whenever department changes

    const fetchTaskTypes = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/taskTypes`, { // Use environment variable for API URL
                method: "POST",
                headers: { 
                    'Content-Type' : 'application/json'
                }, 
                body: JSON.stringify({
                    department: department
                })
            });

            // Check if response status is OK
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            // Update state with fetched task types data
            setTypes(data.taskTypes.map(item => (
                <option key={item.name} value={item.name}>{item.name}</option>
            )));
        } catch (error) {
            // Check if error is "Unexpected end of JSON input" and handle it gracefully
            if (error.message === 'Unexpected end of JSON input') {
                console.error('Received empty response from server');
                // Optionally, you can set a default state or display a message to the user
            } else {
                console.error("Error fetching task types:", error);
                // Handle other errors as needed
            }
        }
    };

    return (
        <>{types}</> // Render task type options
    );
}
