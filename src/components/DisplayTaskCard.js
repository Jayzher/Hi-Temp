import { Container, Row } from 'react-bootstrap'; 
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext';
import TaskCard from '../components/TaskCard';
import { io } from 'socket.io-client';

// Accessing the REACT_APP_API_URL environment variable
const apiUrl = process.env.REACT_APP_API_URL;
const socket = io(apiUrl); // Using the apiUrl

export default function DisplayTaskCard() {
    const [tasks, setTasks] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasksData = async () => {
            try {
                let response;
                if (user.role === "Admin") {
                    response = await fetch(`${apiUrl}/tasks/allTasks`); // Using the apiUrl
                } else {
                    response = await fetch(`${apiUrl}/tasks/active`, { // Using the apiUrl
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            fullName: user.name
                        })
                    });
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }

                const data = await response.json();
                if (user.role === "Admin") {
                    setTasks(data); // Set tasks directly for 'Admin' role
                } else {
                    const taskDetailsPromises = (data[0]?.activeTasks || []).map(obj => getTasks(obj.objectId));
                    const taskDetails = await Promise.all(taskDetailsPromises);
                    setTasks(taskDetails);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasksData();

        socket.on('taskCreated', fetchTasksData);
        socket.on('taskUpdated', fetchTasksData);

        return () => {
            socket.off('taskCreated', fetchTasksData);
            socket.off('taskUpdated', fetchTasksData);
        };
    }, [user.role, user.name]);

    const getTasks = async (objectId) => {
        console.log(objectId);
        try {
            const response = await fetch(`${apiUrl}/tasks/TaskDetails`, { // Using the apiUrl
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: objectId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch task details');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching task details:', error);
            return null;
        }
    };

    return (
        <Container>
            <Row className="justify-content-center">
                {tasks.map(task => {
                    console.log(task);
                    return <TaskCard key={task?._id} tasks={task} />;
                })}
            </Row>
        </Container>
    );
}