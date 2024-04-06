import { Container, Row } from 'react-bootstrap'; 
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext';
import ProjectCard from '../components/ProjectCard';
import { io } from 'socket.io-client';

// Accessing the REACT_APP_API_URL environment variable
const apiUrl = process.env.REACT_APP_API_URL;
const socket = io(apiUrl); // Using the apiUrl

export default function DisplayProjectCard() {
    const [project, setProject] = useState([]); // Moved useState call here
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasksData = async () => {
            try {
                let response;
                if (user.role === "Admin") {
                    response = await fetch(`${apiUrl}/project/allProject`); // Using the apiUrl
                } else {
                    response = await fetch(`${apiUrl}/project/active`, { // Using the apiUrl
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
                setProject(data); // Update project state
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasksData();

        socket.on('ProjectCreated', fetchTasksData);
        socket.on('ProjectUpdated', fetchTasksData);

        return () => {
            socket.off('ProjectCreated', fetchTasksData);
            socket.off('ProjectUpdated', fetchTasksData);
        };
    }, [user.role, user.name]);

    return (
        <Container>
            <Row className="justify-content-center">
                {project.map(item => {
                    console.log(item);
                    return <ProjectCard key={item?._id} proj={item} />;
                })}
            </Row>
        </Container>
    );
}
