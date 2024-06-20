import './Style.css';
import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Form } from "react-bootstrap";
import GetTeam from './GetTeam';
import GetTaskType from './GetTaskType';
import GetDepartment from './GetDepartment';
import UserContext from '../userContext';
import { useSocket } from '../SocketProvider';
import swal from 'sweetalert2';
import { FaEye, FaEyeSlash, FaSyncAlt } from 'react-icons/fa';

export default function ProjectCard({ proj }) {
    const socket = useSocket();
    const { projectName, subTasks, createdOn } = proj;
    const [collapsed, setCollapsed] = useState(true);
    const [taskDetailsList, setTaskDetailsList] = useState([]);
    const { user } = useContext(UserContext);
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const handleClose = () => setShow(false);
    const handleClose2 = () => setShow2(false);
    const handleTaskDetailsClose = () => setShowTaskDetails(false);
    const handleShow = () => setShow(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [taskStatus, setTaskStatus] = useState("Pending");
    const [selected_id, setSelected_id] = useState("");
    const [visibleTasks, setVisibleTasks] = useState([]);
    const [showAllTasks, setShowAllTasks] = useState(false);
    const toggleShowAllTasks = () => setShowAllTasks(!showAllTasks);
    const refreshTasks = async () => {
        await fetchData(); // Fetch the latest tasks
    };
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
        if (socket) {
          const handleTaskUpdate = (taskUpdate) => {
            fetchData();
          };

          socket.on('TaskUpdated', handleTaskUpdate);

          return () => {
            socket.off('TaskUpdated', handleTaskUpdate);
          };
        }
    }, [socket]);

    useEffect(() => {
        const filteredTasks = [];

        if (taskDetailsList.length > 0) {
            // Always show the first task
            filteredTasks.push(taskDetailsList[0]);

            if (taskDetailsList.length > 1) {
                // Only show the second task if its status is "Completed"
                if (taskDetailsList[1].Status === "Completed") {
                    filteredTasks.push(taskDetailsList[1]);

                    // Show subsequent tasks after the second task if it's "Completed"
                    for (let i = 2; i < taskDetailsList.length; i++) {
                        filteredTasks.push(taskDetailsList[i]);
                    }
                }
            }
        }

        setVisibleTasks(filteredTasks);
    }, [taskDetailsList]);

    const fetchData = async () => {
        const detailsList = await Promise.all(subTasks.map(task => fetchTaskDetails(task.TaskId)));
        setTaskDetailsList(detailsList);
    };

    useEffect(() => {
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

    const updateTaskStatus = (e) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/tasks/updateTaskStatus`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: selected_id,
                status: taskStatus
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
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
                    <Form onSubmit={handleSubmit} style={{ width: "100%" }}>
                        <div className="d-flex justify-content-center">
                            <h1 className="text-center">Create Tasks</h1>
                        </div>
                        <div className="d-flex flex-row mb-2" style={{ justifyContent: "space-around" }}>
                            <Form.Group style={{width: "100%"}}>
                                <Form.Label>Project:</Form.Label>
                                <Form.Control type="text" name="projectName" value={projectName} disabled={true} /> 
                            </Form.Group>
                        </div>
                        <Form.Group className="mb-2" style={{width: "100%"}}>
                            <Form.Label>Department:</Form.Label>
                            <Form.Select onChange={handleChange} required name="department">
                                <option value="N/A">Select Department</option>
                                <GetDepartment />
                            </Form.Select>
                        </Form.Group>
                        <div id="project-task-modal" className="d-flex flex-row mb-2" style={{ justifyContent: "space-between" }}>
                            <Form.Group className="me-2" style={{width: "100%"}}>
                                <Form.Label>Task Type:</Form.Label>
                                <Form.Select onChange={handleChange} required name="taskType" required>
                                    <option value="N/A">Select Task Type</option>
                                    <GetTaskType department={formData.department} />
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="" style={{width: "100%"}}>
                                <Form.Label>Due Date:</Form.Label>
                                <Form.Control type="date" name="duration" value={formData.duration} onChange={handleChange} required/>
                            </Form.Group>
                        </div>
                        <Form.Group className="" style={{width: "100%"}}>
                            <Form.Label>Destination:</Form.Label>
                            <Form.Control type="text" name="destination" value={formData.destination} onChange={handleChange} required/>
                        </Form.Group>
                        <Form.Group className="mb-2" style={{width: "100%"}}>
                            <Form.Label>Description:</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Enter description" name="description" value={formData.description} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-2" style={{width: "100%"}}>
                            <Form.Label>Assign To:</Form.Label>
                            <Form.Select onChange={handleChange} name="fullName" required>
                                <option value="">Select Employee</option>
                                <GetTeam department={formData.department} />
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2" style={{width: "100%"}}>
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

            <Modal size="sm" show={show2} onHide={() => setShow2(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Task Status</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{background: "lightgrey"}}>
                    <Form onSubmit={updateTaskStatus} style={{ width: "100%"}}>
                        <Form.Group className="mb-2" style={{width: "100%"}}>
                            <Form.Label>Department:</Form.Label>
                            <Form.Select value={taskStatus} onChange={e => setTaskStatus(e.target.value)} required name="department">
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Failed">Failed</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex flex-row mb-2 mt-3" style={{ justifyContent: "center" }}>
                            <Button variant="primary" type="submit" className="me-2" onClick={handleClose2}>
                                Update
                            </Button>
                            <Button variant="secondary" className="pl-3 pr-3" onClick={handleClose2}>
                                Close
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>


            <div className="ms-2 me-2">
                <div className={collapsed ? "d-flex align-items-center mb-2" : "mb-2"} style={{ minHeight: collapsed ? "10vh" : "auto", width: "100%", background: "azure", border: "2px solid lightgrey", borderRadius: "10px", overflow: "hidden", padding: "0", margin: "0" }}>
                    <div className="d-flex justify-content-between">
                        <div style={{ width: "50vw", cursor: "pointer" }} onClick={toggleCollapse}>
                            <h5 className="p-2">{projectName}</h5>
                        </div>
                        {(user.role === "Admin") ? (
                            <>
                                <div className="d-flex flex-row justify-content-around mt-2" style={{width: "100px"}}>
                                    {showAllTasks ? (
                                        <FaEyeSlash style={{ border: "1px solid lightgrey", height: "24px", width: "30px", cursor: "pointer"}} onClick={toggleShowAllTasks} />
                                    ) : (
                                        <FaEye style={{ border: "1px solid lightgrey", height: "24px", width: "30px", cursor: "pointer"}} onClick={toggleShowAllTasks} />
                                    )}
                                    <FaSyncAlt style={{ border: "1px solid lightgrey", height: "24px", width: "30px", cursor: "pointer" }} onClick={refreshTasks} />
                                </div>
                                <Button style={{ borderRadius: "5px", display: collapsed ? "none" : "inline" }} onClick={handleShow}>
                                    <span style={{ fontSize: "18pt", fontWeight: "bolder" }}>+</span>
                                </Button>   
                            </>
                        ) : (
                            <> </>
                        )}
                    </div>
                    <table className="task-table text-center" style={{ width: "100%", borderCollapse: "collapse", display: collapsed ? "none" : "table" }}>
                        <thead>
                            <tr>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Task</th>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Assigned To</th>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Due Date</th>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Status</th>
                                <th style={{ border: "1px solid lightgrey", padding: "8px" }}>Actions</th> {/* New Actions Column */}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleTasks.map((task, index) => (
                                <tr key={index} style={{ display: index === 1 && !showAllTasks ? "none" : "table-row" }}> {/* Hide second task if showAllTasks is false */}
                                    <td 
                                        style={{ border: "1px solid lightgrey", padding: "8px", cursor: "pointer" }} 
                                        onClick={() => handleTaskTypeClick(task)}
                                    >
                                        {task.taskType}
                                    </td>
                                    <td 
                                        style={{ border: "1px solid lightgrey", padding: "8px", cursor: "pointer" }} 
                                        onClick={() => retrieveUserDetails(task.assignedTo[0].fullName)}
                                    >
                                        {task.assignedTo[0].fullName}
                                    </td>
                                    <td style={{ border: "1px solid lightgrey", padding: "8px" }}>{task.duration}</td>
                                    {user.role === "Employee" ? (
                                        <td style={{ border: "1px solid lightgrey", padding: "8px" }}>{task.Status}</td>
                                    ) : (
                                        <td 
                                            style={{ border: "1px solid lightgrey", padding: "8px", cursor: "pointer" }} 
                                            onClick={() => { setShow2(true); setSelected_id(task._id); }}
                                        >
                                            {task.Status}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

