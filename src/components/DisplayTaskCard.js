import './Style.css';
import { Container, Row } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext';
import TaskCard from '../components/TaskCard';
import { io } from 'socket.io-client';
import GetDepartment from './GetDepartment.js'
import GetTaskType from './GetTaskType.js'

// Accessing the REACT_APP_API_URL environment variable
const apiUrl = process.env.REACT_APP_API_URL;
const socket = io(apiUrl); // Using the apiUrl

export default function DisplayTaskCard() {
    const [tasks, setTasks] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState('createdOn');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchName, setSearchName] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);

    useEffect(() => {
        fetchTasksData();
        window.addEventListener('taskCreated', fetchTasksData);
        return () => {
            window.removeEventListener('taskCreated', fetchTasksData);
        };
    }, [user.id]);

    useEffect(() => {
        fetchTasksData();

        socket.on('taskCreated', fetchTasksData);
        socket.on('taskUpdated', fetchTasksData);

        return () => {
            socket.off('taskCreated', fetchTasksData);
            socket.off('taskUpdated', fetchTasksData);
        };
    }, [user.role, user.name]);

    const fetchTasksData = async () => {
        try {
            let response;
            if (user.role === "Admin") {
                response = await fetch(`${apiUrl}/tasks/allTasks`);
            } else {
                response = await fetch(`${apiUrl}/tasks/completed`, {
                    method: "PATCH",
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
            let taskDetails;
            if (user.role === "Admin") {
                taskDetails = data;
            } else {
                taskDetails = await Promise.all(data[0]?.activeTasks.map(obj => getTasks(obj.objectId)));
                console.log(taskDetails);
            }
            console.log(taskDetails);
            setFilteredTasks(taskDetails);
            setTasks(taskDetails.filter(task => task !== null)); // Filter out null values
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const getTasks = async (objectId) => {
        try {
            const response = await fetch(`${apiUrl}/tasks/TaskDetails`, {
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
            return error;
        }
    };

        const sortTasks = () => {
        const sorted = [...filteredTasks];
        sorted.sort((a, b) => {
            const sortByA = getSortValue(a);
            const sortByB = getSortValue(b);
            if (sortByA < sortByB) return sortOrder === 'asc' ? -1 : 1;
            if (sortByA > sortByB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredTasks(sorted);
    };

    const getSortValue = (task) => {
        if (sortBy === 'name') {
            return task.assignedTo && task.assignedTo[0] ? task.assignedTo[0].fullName : '';
        } else if (sortBy === 'dueDate') {
            return new Date(task.duration);
        } else {
            return task[sortBy];
        }
    };

    const handleSort = (sortByColumn) => {
        if (sortByColumn === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(sortByColumn);
            setSortOrder('desc');
        }
        sortTasks();
    };

    const getSortIndicatorClass = (column) => {
        if (sortBy === column) {
            return sortOrder === 'asc' ? 'arrow-up' : 'arrow-down';
        }
        return '';
    };

    const handleFilterByStatus = (status) => {
        setFilterStatus(status);
        if (status === 'Completed' || status === 'In Progress' || status === 'Failed') {
            const filtered = tasks.filter(task => task.Status.toLowerCase() === status.toLowerCase());
            setFilteredTasks(filtered);
        } else {
            setFilteredTasks(tasks);
        }
    };

    const handleFilterByDepartment = (department) => {
        setFilterStatus(department);
        if (department !== '' || department === null) {
            const filtered = tasks.filter(task => task.department.toLowerCase() === department.toLowerCase());
            setFilteredTasks(filtered);
        } else {
            setFilteredTasks(tasks);
        }
    };

    const handleSearchByName = (name) => {
        setSearchName(name.toLowerCase());
        const filtered = tasks.filter(task => task.assignedTo[0].fullName.toLowerCase().includes(name.toLowerCase()));
        setFilteredTasks(filtered);
    };

    const handleSearchByTask = (type) => {
        setFilterStatus(type);
        if (type !== '' || type === null) {
            const filtered = tasks.filter(task => task.taskType.toLowerCase() === type.toLowerCase());
            setFilteredTasks(filtered);
        } else {
            setFilteredTasks(tasks);
        }
    };

    return (
    <div>
        <div id="sorts" className="d-flex flex-row justify-content-around align-items-center" style={{ marginBottom: '10px', width: "100%", height: "fit-content", flexWrap: "wrap"}}>
        {   (user.role === "Admin") ?
            <div className="mb-2">
                <input style={{height: "30px"}}
                    type="text"
                    placeholder="Search by Name"
                    value={searchName}
                    onChange={(e) => handleSearchByName(e.target.value)}
                />
            </div>
            :
            <div className="d-flex flex-column justify-content-center mb-2">
                <label className="" htmlFor="status">By Task Type:</label>
                <select name="taskType" value={filterStatus} onChange={(e) => handleSearchByTask(e.target.value)}>
                    <option value="">All</option>
                    <GetTaskType department={user.department} />
                </select>
            </div>
        }
            <div className="d-flex flex-column justify-content-center mb-2">
                <label className="" htmlFor="status">By Department:</label>
                <select name="department" value={filterStatus} onChange={(e) => handleFilterByDepartment(e.target.value)}>
                    <option value="">All</option>
                    <GetDepartment />
                </select>
            </div>
            <div className="d-flex flex-column justify-content-center mb-2">
                <label className="" htmlFor="status">By Status:</label>
                <select name="status" value={filterStatus} onChange={(e) => handleFilterByStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Failed">Failed</option>
                </select>
            </div>
        </div>
        <div className="d-flex flex-row justify-content-around Card-container" style={{flexWrap: "wrap", width: "100%"}}>
            {filteredTasks.map(task => (
                <TaskCard key={task?._id} tasks={task} />
            ))}
        </div>
    </div>
    );
}
