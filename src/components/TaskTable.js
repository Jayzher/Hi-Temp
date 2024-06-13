import './Style.css';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import TaskList from '../components/TaskList';
import UserContext from '../userContext';
import GetDepartment from './GetDepartment';

export default function TaskTable() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState('createdOn');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        fetchTasksData();
        window.addEventListener('taskCreated', fetchTasksData);
        return () => {
            window.removeEventListener('taskCreated', fetchTasksData);
        };
    }, [user.id]);

    const fetchTasksData = () => {
        if (!user.id) {
            navigate("/Login");
        } else {
            fetch(`${process.env.REACT_APP_API_URL}/tasks/allTasks`, {
                method: "GET",
                headers: {
                    'Content-Type' : 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                setTasks(data);
                setFilteredTasks(data);
            })
            .catch(error => {
                console.error("Error fetching tasks:", error);
            });
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

    return (
        <div id="tasktable-cont" className="ms-4 me-4 pt-3" style={{ height: "100vh", width: "45.5vw", overflow: "hidden"}}>
            <div className="d-flex flex-row justify-content-around align-items-center" style={{ marginBottom: '10px', flexWrap: "wrap"}}>
                <div>
                    <input style={{height: "30px", width: "100%"}}
                        className="me-5"
                        type="text"
                        placeholder="Search by Name"
                        value={searchName}
                        onChange={(e) => handleSearchByName(e.target.value)}
                    />
                </div>
                <div className="d-flex justify-content-around align-items-center">
                    <div className="d-flex flex-column me-4 justify-content-center">
                        <label className="me-2" htmlFor="status">By Department:</label>
                        <select name="department" value={filterStatus} onChange={(e) => handleFilterByDepartment(e.target.value)}>
                            <option value="">All</option>
                            <GetDepartment />
                        </select>
                    </div>
                    <div className="d-flex flex-column justify-content-center">
                        <label className="me-2" htmlFor="status">By Status:</label>
                        <select name="status" value={filterStatus} onChange={(e) => handleFilterByStatus(e.target.value)}>
                            <option value="">All</option>
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>
            </div>
            <div id="tasktable" style={{ height: "88vh", width: "100%", overflow: "auto", margin: "0", padding: "0"}}>
                <Table className="unique-task-table text-center m-0 w-100" style={{ background: "peachpuff"}} striped bordered hover>
                  <thead className="opacity p-0 m-0" style={{ position: "sticky", top: "0", zIndex: 1}}>
                    <tr className="opacity m-0 p-0">
                      <th className={`opacity ${getSortIndicatorClass('taskType')}`} style={{ width: "30%"}} onClick={() => handleSort('taskType')}>Task Type</th>
                      <th className={`opacity ${getSortIndicatorClass('name')}`} style={{ width: "26%"}} onClick={() => handleSort('name')}>Name</th>
                      <th className={`opacity hide-on-small-screen ${getSortIndicatorClass('dueDate')}`} style={{ width: "16.6%"}} onClick={() => handleSort('dueDate')}>Due Date</th>
                      <th style={{ width: "16.6%"}}>Status</th>
                      <th style={{ width: "80px"}} onClick={() => handleSort('modify')}>Modify</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: "rgba(0,0,0,0.1)"}}>
                    {filteredTasks.map((task, index) => (
                      <TaskList key={index} tasks={task} />
                    ))}
                  </tbody>
                </Table>
            </div>
        </div>
    );
}
