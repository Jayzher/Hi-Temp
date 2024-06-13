import './Style.css';
import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Form } from "react-bootstrap";
import GetTeam from './GetTeam';
import GetTaskType from './GetTaskType';
import GetDepartment from './GetDepartment';
import UserContext from '../userContext';
import swal from 'sweetalert2';

export default function ProjectCard({ proj }) {
    const { projectName, subTasks, createdOn } = proj;
    const [collapsed, setCollapsed] = useState(true);
    const [taskDetailsList, setTaskDetailsList] = useState([]);
    const { user } = useContext(UserContext);
    const [show, setShow] = useState(false);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const handleClose = () => setShow(false);
    const handleTaskDetailsClose = () => setShowTaskDetails(false);
    const handleShow = () => setShow(true);
    const [showImageModal, setShowImageModal] = useState(false);

    const [formData, setFormData] = useState({
        projectName: projectName,
        description: '',
        destination: '',
        duration: '',
        taskType: '',
        department: '',
        travelFunds: '',
        expenses: '',
        refund: '',
        fullName: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            const detailsList = await Promise.all(subTasks.map(task => fetchTaskDetails(task.TaskId)));
            setTaskDetailsList(detailsList);
        };
        fetchData();
    }, [subTasks]);

    const fetchTaskDetails = async (taskID) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks/TaskDetails`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: taskID })
        });
        const data = await response.json();
        return data;
    };

    const retrieveUserDetails = (name) => {
        fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                name : name
            })
        })
        .then(res => res.json())
        .then(data => {
            handleImageClick(data.profile);
        })
        .catch(error => console.error('Error fetching user profile:', error));

    };

    const formatDate = (createdOn) => {
        const date = new Date(createdOn);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const formattedHours = hours.toString().padStart(2, '0');
        return `${month}-${day}-${year} ${formattedHours}:${minutes} ${ampm}`;
    };

    const formattedDate = formatDate(createdOn);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const create = (e) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/tasks/addTask`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            handleSuccess();
            // Update state with the new task data
            setTaskDetailsList([...taskDetailsList, data]);
            assignTask(data._id, formData.fullName);
            updateSubTask(data._id, formData.projectName);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    };


    const updateSubTask = (newTaskId, projName) => {
        if (!projName) {
            console.log("Tasks contain items with no projectName or invalid projectName. Skipping fetch request.");
            return;
        }
        fetch(`${process.env.REACT_APP_API_URL}/project/updateProjectTasks`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tasksId: newTaskId,
                projectName: projName
            })
        })
        .then(res => {
            console.log(res);
            window.dispatchEvent(new Event('ProjectCreated'));
        })
        .catch(error => {
            console.error("Error:", error);
        });
    };

    const handleSuccess = () => {
        swal.fire({
            title: "Created Successfully",
            icon: "success",
            text: "The Task is now Available"
        });
    };

    const assignTask = (Id, fullName) => {
        fetch(`${process.env.REACT_APP_API_URL}/tasks/assigns`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: Id,
                name: fullName,
                active: true
            })
        })
        .then(res => {
            console.log(res);
            setFormData({
                projectName: '',
                description: '',
                destination: '',
                duration: '',
                taskType: '',
                department: '',
                travelFunds: '',
                expenses: '',
                refund: '',
                fullName: ''
            });
            window.dispatchEvent(new Event('taskCreated'));
        })
        .catch(error => {
            console.error("Error:", error);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        create(e);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTaskTypeClick = (task) => {
        setSelectedTask(task);
        setShowTaskDetails(true);
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    return (
        <>
            <Modal size="md" id="thisModal" show={show} onHide={handleClose}>
                <Modal.Body className="d-flex justify-content-center" style={{ background: "peachpuff", borderRadius: "10px"}}>
                    <Form onSubmit={handleSubmit} style={{ width: "36vw" }}>
                        <div className="d-flex justify-content-center">
                            <h1 className="text-center">Create Tasks</h1>
                        </div>
                        <div className="d-flex flex-row mb-2" style={{ justifyContent: "space-around" }}>
                            <Form.Group style={{ width: "32.8vw" }}>
                                <Form.Label>Project:</Form.Label>
                                <Form.Control type="text" name="projectName" value={projectName} disabled={true}/> 
                            </Form.Group>
                        </div>
                        <Form.Group className="ms-4 me-4 mb-2" style={{ width: "32.8vw" }}>
                            <Form.Label>Department:</Form.Label>
                            <Form.Select onChange={handleChange} required name="department">
                                <option value="N/A">Select Department</option>
                                <GetDepartment />
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex flex-row mb-2" style={{ justifyContent: "space-between" }}>
                            <Form.Group style={{ width: "20vw" }} className="ms-4 me-2">
                                <Form.Label>Task Type:</Form.Label>
                                <Form.Select onChange={handleChange} required name="taskType">
                                    <option value="N/A">Select Task Type</option>
                                    <GetTaskType department={formData.department} />
                                </Form.Select>
                            </Form.Group>
                            <Form.Group style={{ width: "20vw" }} className="me-4">
                                <Form.Label>Due Date:</Form.Label>
                                <Form.Control type="date" name="duration" value={formData.duration} onChange={handleChange} />
                            </Form.Group>
                        </div>
                        <Form.Group style={{ width: "32.8vw" }} className="ms-4">
                            <Form.Label>Destination:</Form.Label>
                            <Form.Control type="text" name="destination" value={formData.destination} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="ms-4 me-4 mb-2" style={{ width: "32.8vw" }}>
                            <Form.Label>Description:</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Enter description" name="description" value={formData.description} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="ms-4 me-4 mb-2" style={{ width: "32.8vw" }}>
                            <Form.Label>Assign To:</Form.Label>
                            <Form.Select onChange={handleChange} required name="fullName">
                                <option value="">Select Employee</option>
                                <GetTeam department={formData.department} />
                            </Form.Select>
                        </Form.Group>
                        <Form.Group style={{ width: "32.8vw" }} className="ms-4 me-4 mb-2">
                            <Form.Label>Travel Funds:</Form.Label>
                            <Form.Control type="text" placeholder="Enter travel funds" name="travelFunds" value={formData.travelFunds} onChange={handleChange} required />
                        </Form.Group>
                        <div className="d-flex flex-row mb-2" style={{ justifyContent: "center" }}>
                            <Button variant="primary" type="submit" className="me-2" onClick={handleClose}>
                                Create
                            </Button>
                            <Button variant="secondary" className="pl-3 pr-3" onClick={handleClose}>
                                Close
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            
            <Modal size="lg" show={showTaskDetails} onHide={handleTaskDetailsClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Task Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTask && (
                        <div>
                            <p><strong>Task Type:</strong> {selectedTask.taskType}</p>
                            <p><strong>Description:</strong> {selectedTask.description}</p>
                            <p><strong>Assigned To:</strong> <span onClick={() => handleImageClick(selectedTask.assignedTo[0].profile)} style={{ cursor: 'pointer' }}>{selectedTask.assignedTo[0].fullName}</span></p>
                            <p><strong>Due Date:</strong> {selectedTask.duration}</p>
                            <p><strong>Status:</strong> {selectedTask.Status}</p>
                            <p><strong>Department:</strong> {selectedTask.department}</p>
                            <p><strong>Destination:</strong> {selectedTask.destination}</p>
                            <p><strong>Travel Funds:</strong> {selectedTask.travelFunds}</p>
                            <p><strong>Expenses:</strong> {selectedTask.expenses}</p>
                            <p><strong>Refund:</strong> {selectedTask.refund}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleTaskDetailsClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal size="sm" show={showImageModal} onHide={() => setShowImageModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>User Profile Image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <img src={selectedImage} alt="User Profile" style={{ maxWidth: '100%' }} />
                </Modal.Body>
            </Modal>

            <div className="ms-2 me-2">
                <div className={collapsed ? "d-flex align-items-center mb-2" : "mb-2"} style={{ minHeight: collapsed ? "10vh" : "auto", width: "100%", background: "azure", border: "2px solid lightgrey", borderRadius: "10px", overflow: "hidden", padding: "0", margin: "0" }}>
                    <div className="d-flex justify-content-between">
                        <div style={{ width: "50vw", cursor: "pointer" }} onClick={toggleCollapse}>
                            <h5 className="p-2">{projectName}</h5>
                        </div>
                         {(user.role === "Admin") ?
                            <Button style={{ borderRadius: "5px", display: collapsed ? "none" : "inline" }} onClick={handleShow}>
                                <span style={{ fontSize: "18pt", fontWeight: "bolder" }}>+</span>
                            </Button>
                        :
                            <>                        
                            </>
                        }
                    </div>
                    <table className="text-center" style={{ width: "100%", borderCollapse: "collapse", display: collapsed ? "none" : "table" }}>
                        <thead>
                            <tr>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Task</th>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Assigned To</th>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Due Date</th>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskDetailsList.map((task, index) => (
                                <tr key={index}>
                                    <td style={{ border: "1px solid lightgrey", padding: "8px", cursor: "pointer" }} onClick={() => handleTaskTypeClick(task)}>{task.taskType}</td>
                                    <td style={{ border: "1px solid lightgrey", padding: "8px", cursor: "pointer" }} onClick={() => retrieveUserDetails(task.assignedTo[0].fullName)}>{task.assignedTo[0].fullName}</td>
                                    <td style={{ border: "1px solid lightgrey", padding: "8px" }}>{task.duration}</td>
                                    <td style={{ border: "1px solid lightgrey", padding: "8px" }}>{task.Status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

