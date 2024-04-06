import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import UserContext from '../userContext';

export default function GetDepartment() {
    const [department, setDepartment] = useState([]); // Updated state variable to store department data
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch department data
        fetchDepartmentData();
    }, []); // Fetch data once when the component mounts

    const fetchDepartmentData = () => {
        fetch(`${process.env.REACT_APP_API_URL}/users/getdepartment`, { // Use environment variable for API URL
            method: "GET",
            headers: { 
                'Content-Type' : 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            // Update state with fetched department data
            setDepartment(data.map(item => (
                <option key={item.department} value={item.department}>{item.department}</option>
            )));
        })
        .catch(error => {
            console.error("Error fetching departments:", error);
            // Handle error, e.g., display an error message to the user
        });
    };

    return (
        <>{department}</> // Render department options
    );
}
