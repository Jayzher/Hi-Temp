import "./comp.css";
import { Form, Button } from 'react-bootstrap';
import UserContext from '../userContext';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert2';
import TaskTable from "./TaskTable";
import TaskList from "./TaskList";
import Modal from 'react-bootstrap/Modal';
import back_arrow_2 from '../images/back-arrow-2.svg';
import back_arrow from '../images/back-arrow.svg';
import Task_svg from '../images/tasks-sv.svg';
import GetTeam from './GetTeam.js';
import GetTaskType from './GetTaskType.js';
import GetDepartment from './GetDepartment.js';
import ProjectTable from './ProjectTable.js';
import GetProjects from './GetProjects.js';

function NewTasks() {
    const { setUser } = useContext(UserContext);
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState("Tasks");
    const navigate = useNavigate();
    const [show, setShow] = useState(true);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [formData, setFormData] = useState({
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

     const [formData2, setFormData2] = useState({
        projectName: '',
        description: '',
        company: '',
        address: '',
        projExpenses: ''
     });

    const [formData3, setFormData3] = useState({
        department: '',
        description: '',
        taskType: ''
     });

    const [formData4, setFormData4] = useState({
        department: ''
    });

    useEffect(() => {
        // Calculate the current date and time adjusted to Philippines time zone
        const currentDate = new Date();
        const philippinesTime = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

        // Format the date to ISO string (YYYY-MM-DD) and set it to duration field
        const formattedDate = philippinesTime.toISOString().split('T')[0];
        setFormData(prevState => ({
            ...prevState,
            duration: formattedDate
        }));
    }, []); 

     function create(e) {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_URL}/tasks/addTask`, {
            method: "POST",
            headers: {
                'Content-Type': 'Application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                projectName: formData.projectName,
                description: formData.description,
                destination: formData.destination,
                duration: formData.duration,
                taskType: formData.taskType,
                department: formData.department,
                travelFunds: formData.travelFunds,
                expenses: formData.expenses,
                refund: formData.refund,
                fullName: formData.fullName
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            handleSuccess();
            assignTask(data._id, formData.fullName);
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle error, e.g., display an error message to the user
        });
    }

    function createProject(e) {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_URL}/project/createProject`, {
            method: "POST",
            headers: {
                'Content-Type': 'Application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                projectName: formData2.projectName,
                company: formData2.company,
                address: formData2.address,
                description: formData2.description
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            setFormData2(prevState => ({
                ...prevState,
                projectName: '',
                description: '',
                company: '',
                address: '',
                projExpenses: ''
            }));
            swal.fire({
                title: "Project Created",
                icon: "success",
                text: "Project Created Successfully!"
            })
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle error, e.g., display an error message to the user
        });
    }

    function handleSuccess() {
        swal.fire({
            title: "Created Successfully",
            icon: "success",
            text: "The Task is now Available"
        });
    }

    function assignTask(Id, fullName) {
        fetch(`${process.env.REACT_APP_API_URL}/tasks/assign`, {
            method: "POST",
            headers: {
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify({
                id : Id,
                fullName: fullName
            })
        })
        .then(res => {
            console.log(res);
            setFormData(prevState => ({
                ...prevState,
                description: '',
                destination: '',
                // Remove the state update for duration here
                taskType: '',
                department: '',
                travelFunds: '',
                expenses: '',
                refund: '',
                fullName: ''
            }));
            window.dispatchEvent(new Event('taskCreated'));
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle error, e.g., display an error message to the user
        });
    }

    function addtaskType(e) {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/tasks/addtasktypes`, {
            method: "PUT",
            headers: {
                'Content-Type':'Application/json'
            },
            body: JSON.stringify ({
                department: formData3.department,
                name: formData3.taskType,
                description: formData3.description
            })
        }).then(res => res.json)
        .then(data => {
            console.log(data);
            setFormData3(prevState => ({
                ...prevState,
                taskType: '',
                department: '',
                description: ''
            }));
            swal.fire({
                title: "Task Type Added",
                icon: "success",
                text: "Task Type Added Successfully!"
            })
        })
        .catch(error => {
            console.error("Error:", error);
            swal.fire({
                title: "Something Went Wrong!",
                icon: "error",
                text: "Task Type Add Failed!"
            })
        });
    }

    function CreateDepartment(e) {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/tasks/adddepartment`, {
            method: "POST",
            headers: {
                'Content-Type':'Application/json'
            },
            body: JSON.stringify ({
                department: formData4.department
            })
        }).then(res => res.json)
        .then(data => {
            console.log(data);
            setFormData4(prevState => ({
                ...prevState,
                department: ''
            }));
            swal.fire({
                title: "Department Created",
                icon: "success",
                text: "Created Department Successfully!"
            })
        })
        .catch(error => {
            console.error("Error:", error);
            swal.fire({
                title: "Something Went Wrong!",
                icon: "error",
                text: "Creating Department Failed!"
            })
        });
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleChange2 = (e) => {
        const { name, value } = e.target;
        setFormData2({ ...formData2, [name]: value });
    };

    const handleChange3 = (e) => {
        const { name, value } = e.target;
        setFormData3({ ...formData3, [name]: value });
    };

    const handleChange4 = (e) => {
        const { name, value } = e.target;
        setFormData4({ ...formData4, [name]: value });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        create(e);
    };    

    const handleSubmit2 = (e) => {
        e.preventDefault();
        createProject(e);
    };

    const handleModal = (e) => {
        setProject(e);
    }

    return (
        <div className="dashboard-container">
            <div className="d-flex flex-row" style={{height: "100vh", minHeight: "100vh", width: "fit-content", marginLeft: "15vw", backgroundImage: "linear-gradient( 92.7deg,  rgba(245,212,212,1) 8.5%, rgba(252,251,224,1) 90.2% )", overflowy: "hidden"}}>
                <div style={{height: "100%", background: "rgba(0, 0, 0, 0.2)"}} className="d-flex flex-row">
                    <div className="d-flex flex-column align-items-center pt-1 task-div ps-0" style={{background: "rgba(0, 0, 0, 0.0)", height: "100vh", borderRight: "solid 2px black", padding: "15px"}}>
                        { project === "Tasks" ? (
                            <>
                                <div className="d-flex flex-row me-auto ms-1">
                                    <img src={back_arrow_2} alt="Back" className="me-auto ms-1 sw-form" style={{height: "50px", width: "50px"}} onClick={e => handleModal("Project")} />
                                    <img src={Task_svg} alt="Back" className="sw-form" style={{height: "50px", width: "50px"}} onClick={e => handleModal("Task Type")} />
                                </div>
                                <Form onSubmit={handleSubmit} style={{width: "35vw"}}>
                                    <div className="d-flex justify-content-center">
                                        <h1 className="text-center">Create Tasks</h1>
                                    </div>
                                     <div className="d-flex flex-row ms-4 me-2 mb-2" style={{justifyContent: "space-around"}}>
                                        <Form.Group style={{width: "40vw"}}>
                                            <Form.Label>Project Sub-Tasks: (Optional)</Form.Label>
                                            <Form.Select onChange={handleChange} name="projectName">
                                                <option value="N/A">Select Project</option>
                                                <GetProjects />
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                    <Form.Group className="ms-4 me-4 mb-2" style={{ width: "32.8vw" }}>
                                        <Form.Label>Department:</Form.Label>
                                        <Form.Select value={formData.department} onChange={handleChange} required name="department">
                                            <option value="">Select Department</option>
                                            <GetDepartment />
                                        </Form.Select>
                                    </Form.Group>
                                    <div className="d-flex flex-row mb-2" style={{justifyContent: "space-around"}}>
                                        <Form.Group style={{width: "20vw"}} className="ms-4 me-2">
                                            <Form.Label>Task Type:</Form.Label>
                                            <Form.Select onChange={handleChange} required name="taskType" required>
                                                <option value="N/A" Selected>Select Task Type</option>
                                                <GetTaskType department={formData.department} />
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group style={{width: "20vw"}} className="ms-4 me-2">
                                            <Form.Label>Due Date:</Form.Label>
                                            <Form.Control type="date" name="duration" value={formData.duration} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                    <Form.Group style={{width: "32.8vw"}} className="ms-4">
                                        <Form.Label>Destination:</Form.Label>
                                        <Form.Control type="text" name="destination" value={formData.destination} onChange={handleChange} />
                                    </Form.Group>
                                    <Form.Group className="ms-4 me-4 mb-2" style={{ width: "32.8vw" }}>
                                        <Form.Label>Description:</Form.Label>
                                        <Form.Control as="textarea" rows={3} placeholder="Enter description" name="description" value={formData.description} onChange={handleChange} required />
                                    </Form.Group>

                                    <Form.Group className="ms-4 me-4 mb-2" style={{ width: "32.8vw" }}>
                                        <Form.Label>Assign To:</Form.Label>
                                        <Form.Select onChange={handleChange} required name="fullName" required>
                                            <option value="">Select Employee</option>
                                            <GetTeam department={formData.department} />
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group style={{width: "32.8vw"}}  className="ms-4 me-4 mb-2">
                                        <Form.Label>Travel Funds:</Form.Label>
                                        <Form.Control type="text" placeholder="Enter travel funds" name="travelFunds" value={formData.travelFunds} onChange={handleChange} required />
                                    </Form.Group>

                                    <div className="d-flex flex-row mb-2" style={{justifyContent: "center"}}>
                                        <Button variant="primary" type="submit">
                                            Create
                                        </Button>
                                    </div>
                                </Form>
                            </>
                        ) : project === "Project" ? (
                            <>  
                                <div className="d-flex flex-row me-auto ms-1">
                                    <img src={back_arrow} alt="Back" className="sw-form me-2" style={{height: "50px", width: "50px"}} onClick={e => handleModal("Tasks")} />
                                    <img src={Task_svg} alt="Back" className="sw-form" style={{height: "50px", width: "50px"}} onClick={e => handleModal("Task Type")} />
                                </div>
                                <Form className="ms-2" onSubmit={handleSubmit2} style={{width: "35vw"}}>
                                    <div className="d-flex justify-content-center">
                                        <h1 className="text-center">Create Project</h1>
                                    </div>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Project Name:</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Project Name" name="projectName" value={formData2.projectName} onChange={handleChange2} required />
                                    </Form.Group>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Company:</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Company Name" name="company" value={formData2.company} onChange={handleChange2} required />
                                    </Form.Group>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Address:</Form.Label>
                                        <Form.Control type="text" name="address" placeholder="Enter Address" value={formData2.address} onChange={handleChange2} />
                                    </Form.Group>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Description:</Form.Label>
                                        <Form.Control as="textarea" rows={5} placeholder="Enter description" name="description" value={formData2.description} onChange={handleChange2} required />
                                    </Form.Group>
                                    <div className="d-flex flex-row mb-2" style={{justifyContent: "center"}}>
                                        <Button variant="primary" type="submit">
                                            Create
                                        </Button>
                                    </div>
                                </Form>
                            </>
                        
                         ) : project === "Task Type" ? (
                            <>  
                                <div className="d-flex flex-row me-auto ms-1">
                                    <img src={back_arrow} alt="Back" className="sw-form me-2" style={{height: "50px", width: "50px"}} onClick={e => handleModal("Tasks")} />
                                    <img src={Task_svg} alt="Back" className="sw-form" style={{height: "50px", width: "50px"}} onClick={e => handleModal("Task Type")} />
                                </div>
                                <Form className="ms-2 mt-3" onSubmit={e => CreateDepartment(e)} style={{width: "35vw"}}>
                                    <div className="d-flex justify-content-center">
                                        <h1 className="text-center">Create New Department</h1>
                                    </div>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Department:</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Department" name="department" value={formData4.department} onChange={handleChange4} required />
                                    </Form.Group>
                                    <div className="d-flex flex-row mb-2" style={{justifyContent: "center"}}>
                                        <Button variant="primary" type="submit">
                                            Create
                                        </Button>
                                    </div>
                                </Form>
                                <Form className="ms-2" onSubmit={e => addtaskType(e)} style={{width: "35vw"}}>
                                    <div className="d-flex justify-content-center">
                                        <h1 className="text-center">Add Tasks Types</h1>
                                    </div>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Department:</Form.Label>
                                        <Form.Select value={formData3.department} onChange={handleChange3} required name="department">
                                            <option value="">Select Department</option>
                                            <GetDepartment />
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Task Type:</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Tasks Type" name="taskType" value={formData3.taskType} onChange={handleChange3} required />
                                    </Form.Group>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Description:</Form.Label>
                                        <Form.Control as="textarea" rows={5} name="description" placeholder="Enter Description" value={formData3.description} onChange={handleChange3} />
                                    </Form.Group>
                                    <div className="d-flex flex-row mb-2" style={{justifyContent: "center"}}>
                                        <Button variant="primary" type="submit">
                                            Add
                                        </Button>
                                    </div>
                                </Form>
                             {/*   <Form className="ms-2" onSubmit={e => createProject(e)} style={{width: "35vw"}}>
                                    <div className="d-flex justify-content-center">
                                        <h1 className="text-center">Add Tasks Types</h1>
                                    </div>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Department:</Form.Label>
                                        <Form.Select value={formData3.department} onChange={handleChange3} required name="department">
                                            <option value="">Select Department</option>
                                            <GetDepartment />
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Task Type:</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Tasks Type" name="taskType" value={formData3.taskType} onChange={handleChange3} required />
                                    </Form.Group>
                                    <Form.Group style={{width: "34vw"}} className="ms-2 me-3 mb-2">
                                        <Form.Label>Description:</Form.Label>
                                        <Form.Control as="textarea" rows={5} name="description" placeholder="Enter Description" value={formData3.description} onChange={handleChange3} />
                                    </Form.Group>
                                    <div className="d-flex flex-row mb-2" style={{justifyContent: "center"}}>
                                        <Button variant="primary" type="submit">
                                            Add
                                        </Button>
                                    </div>
                                </Form>*/}
                            </>
                        ): null}
                    </div>
                    <div style={{height: "100%", width: "100%"}}>
                    {(project === "Tasks") ?
                        <TaskTable />
                        :
                        <ProjectTable />
                    }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewTasks;

