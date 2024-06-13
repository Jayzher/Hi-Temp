import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeList from '../components/EmployeeList';
import Table from 'react-bootstrap/Table';
import UserContext from '../userContext';
import { useSocket } from '../SocketProvider';
import Swal from 'sweetalert2';

export default function Employee_Details() {
    const [users, setUsers] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const socket = useSocket();

    useEffect(() => {
        const fetchUsersData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/users/all`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users data');
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        const handleUserStatusChange = ({ userId, status }) => {
            setUsers(prevUsers => {
                return prevUsers.map(user => {
                    if (user._id === userId) {
                        return { ...user, Status: status };
                    }
                    return user;
                });
            });
        };

        if (!user.id) {
            navigate("/Login");
        } else {
            fetchUsersData();
            socket.on('userStatusChange', handleUserStatusChange);
        }

        return () => {
            socket.off('userStatusChange', handleUserStatusChange);
        };
    }, [user.id, socket, navigate]);

    const handleUpdateStatus = async (updatedEmployee) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update-employee`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedEmployee)
            });

            const result = await response.json();
            if (result.success) {
                setUsers(prevUsers => prevUsers.map(user => user._id === updatedEmployee._id ? result.user : user));
                Swal.fire('Success', 'Employee updated successfully', 'success');
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            Swal.fire('Error', 'Error updating employee', 'error');
        }
    };

    return (
        <div id="employee-table" className="ms-4 pt-3 pb-0 mb-0" style={{ height: "100%", width: "100%", overflow: "hidden" }}>
            <Table style={{ background: "peachpuff", width: "95%" }} striped bordered hover className="text-center mb-0 pb-0">
                <thead className="opacity" style={{ position: "sticky", top: "0", zIndex: 1 }}>
                    <tr className="opacity">
                        <th className="opacity" style={{fontSize: '0.8rem'}}>Name</th>
                        <th className="opacity" style={{fontSize: '0.8rem', width: "19.8%", maxWidth: '19.8%', minWidth: '19.8%' }}>Username</th>
                        <th style={{fontSize: '0.8rem' }} className="opacity">Department</th>
                        <th style={{fontSize: '0.8rem' }} className="opacity">Role</th>
                        <th style={{ fontSize: '0.8rem', width: "80px"}} className="opacity">Status</th>
                        <th style={{fontSize: '0.8rem', width: "100px", maxWidth: '100px', minWidth: '100px' }} className="opacity">Modify</th>
                    </tr>
                </thead>
                <tbody style={{ background: "rgba(0,0,0,0.1)" }}>
                    {users.map(user => (
                        <EmployeeList key={user._id} employee={user} onUpdateStatus={handleUpdateStatus} />
                    ))}
                </tbody>
            </Table>
        </div>

    );
}
