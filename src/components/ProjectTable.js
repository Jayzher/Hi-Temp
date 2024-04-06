import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from '../components/ProjectList';
import Table from 'react-bootstrap/Table';
import UserContext from '../userContext';

export default function TaskTable() {
    const [project, setproject] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch tasks data
        fetchTasksData();

        // Listen for 'taskCreated' event to refresh tasks data
        window.addEventListener('ProjectCreated', fetchTasksData);

        // Clean up event listener
        return () => {
            window.removeEventListener('ProjectCreated', fetchTasksData);
        };
    }, [user.id]); // Fetch data whenever user.id changes

    const fetchTasksData = () => {
        // If the user is not authenticated, redirect to the Login page
        if (!user.id) {
            navigate("/Login");
        } else {
            // Fetch tasks data
            fetch(`${process.env.REACT_APP_API_URL}/project/allProject`, {
                method: "GET",
                headers: { 
                    'Content-Type' : 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                setproject(data.map(res => {
                    return <ProjectList key={res._id} proj={res} /> ;
                }));
            })
            .catch(error => {
                console.error("Error fetching tasks:", error);
                // Handle error, e.g., display an error message to the user
            });
        }
    };

    return (
        <div className="ms-4 me-4 pt-3" style={{ height: "100vh", width: "45.5vw", overflow: "auto"}}>
            <Table style={{ background: "peachpuff" }} striped bordered hover className="text-center">
                <thead className="opacity" style={{ position: "sticky", top: "0", zIndex: 1}}>
                    <tr className="opacity">
                        <th className="opacity" style={{ width: "30%"}}>Project Name</th>
                        <th className="opacity" style={{ width: "26%"}}>Product</th>
                        <th style={{ width: "14.6%"}} className="opacity">Company</th>
                        <th style={{ width: "14.6%"}} className="opacity">Status</th>
                        <th style={{ width: "12.6%"}} className="opacity">Modify</th>
                    </tr>
                </thead>
                <tbody style={{ background: "rgba(0,0,0,0.1)" }}>
                    {project}
                </tbody>
            </Table>
        </div>
    );
}
