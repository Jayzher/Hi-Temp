import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeList from '../components/EmployeeList';
import Table from 'react-bootstrap/Table';
import UserContext from '../userContext';
import io from 'socket.io-client'; // Import Socket.IO client library

export default function Employee_Details() {
    const [users, setUsers] = useState([]); // Updated state variable to store users data
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const socket = io(process.env.REACT_APP_API_URL); // Initialize Socket.IO connection using environment variable

    useEffect(() => {
        // Fetch users data
        fetchUsersData();

        // Listen for userStatusChange event
        socket.on('userStatusChange', handleUserStatusChange);

        // Clean up function to remove event listener
        return () => {
            socket.off('userStatusChange', handleUserStatusChange);
            socket.disconnect(); // Disconnect Socket.IO connection when component unmounts
        };
    }, [user.id]); // Fetch data whenever user.id changes

    const fetchUsersData = () => {
        // If the user is not authenticated, redirect to the Login page
        if (!user.id) {
            navigate("/Login");
        } else {
            // Fetch users data using environment variable
            fetch(`${process.env.REACT_APP_API_URL}/users/all`, {
                method: "GET",
                headers: { 
                    'Content-Type' : 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                setUsers(data); // Update state with fetched users data
            })
            .catch(error => {
                console.error("Error fetching users:", error);
                // Handle error, e.g., display an error message to the user
            });
        }
    };

    // Function to handle userStatusChange event
    const handleUserStatusChange = ({ userId, status }) => {
        // Update the status of the corresponding user in the users array
        setUsers(prevUsers => {
            return prevUsers.map(user => {
                if (user._id === userId) {
                    return { ...user, Status: status };
                }
                return user;
            });
        });
    };

    return (
        <div className="ms-4 me-4 pt-3 pb-0 mb-0" style={{ height: "100%", width: "50vw", overflow: "hidden"}}>
            <Table style={{ background: "peachpuff" }} striped bordered hover className="text-center mb-0 pb-0">
                <thead className="opacity" style={{ position: "sticky", top: "0", zIndex: 1}}>
                    <tr className="opacity">
                        <th className="opacity" style={{ width: "19%", maxWidth: '19%', minWidth: '19%'}}>Name</th>
                        <th className="opacity" style={{ width: "19.8%", maxWidth: '19.8%', minWidth: '19.8%'}}>Username</th>
                        <th style={{ width: "19.8%", maxWidth: '19.8%', minWidth: '19.8%'}} className="opacity">Department</th>
                        <th style={{ width: "19.8%", maxWidth: '19.8', minWidth: '19.8%'}} className="opacity">Role</th>
                        <th style={{ width: "10%", maxWidth: '10%', minWidth: '10%'}} className="opacity">Status</th>
                        <th style={{ width: "5%", maxWidth: '5%', minWidth: '5%'}} className="opacity">Modify</th>
                    </tr>
                </thead>
                <tbody style={{ background: "rgba(0,0,0,0.1)" }}>
                    {/* Render user data in the table */}
                    {users.map(user => (
                        <EmployeeList key={user._id} employee={user} />
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
