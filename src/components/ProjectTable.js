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

        // Define the event listener function
        const handleProjectCreated = () => {
            // Fetch tasks data again when 'ProjectCreated' event is triggered
            fetchTasksData();
        };

        // Listen for 'ProjectCreated' event and call handleProjectCreated function
        window.addEventListener('ProjectCreated', handleProjectCreated);

        // Clean up event listener
        return () => {
            window.removeEventListener('ProjectCreated', handleProjectCreated);
        };
    }, [user.id]); // Fetch data whenever user.id changes

    const fetchTasksData = () => {
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
    };

    return (
    <div id="project-table" className="ms-2 me-2 pt-3" style={{ height: "100vh", width: "100%", overflow: "auto" }}>
      <Table id="unique-project-table" style={{ background: "peachpuff" }} striped bordered hover className="text-center w-100">
        <thead className="opacity" style={{ position: "sticky", top: "0", zIndex: 1 }}>
          <tr className="opacity">
            <th className="opacity" style={{ width: "30%" }}>Project Name</th>
            <th className="opacity" style={{ width: "26%" }}>Product</th>
            <th style={{ width: "25.6%" }} className="opacity">Company</th>
            <th style={{ width: "12.6%" }} className="opacity">Status</th>
            <th style={{ width: "12.6%" }} className="opacity">Modify</th>
          </tr>
        </thead>
        <tbody style={{ background: "rgba(0,0,0,0.1)" }}>
          {project}
        </tbody>
      </Table>
    </div>
    );
}
