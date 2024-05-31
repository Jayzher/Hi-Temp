import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext';

export default function GetTeam() {
    const [users, setUsers] = useState([]); // Updated state variable to store users data
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch users data
        fetchUsersData();
    }, []); // Fetch data whenever department changes

    const fetchUsersData = () => {
        fetch(`${process.env.REACT_APP_API_URL}/users/all`, { // Use environment variable for API URL
            method: "GET",
            headers: { 
                'Content-Type' : 'application/json'
            }, 
        })
        .then(res => res.json())
        .then(data => {
            // Update state with fetched users data
            setUsers(data.map(user => (
                <option key={user.name} value={user.name}>{user.name}</option>
            )));
        })
        .catch(error => {
            console.error("Error fetching users:", error);
            // Handle error, e.g., display an error message to the user
        });
    };

    return (
        <>
            {users}
        </>
    );
}
