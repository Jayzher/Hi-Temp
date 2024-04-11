import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import './comp.css';
import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Swal from 'sweetalert2';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import UserContext from '../userContext';
import GetDepartment from './GetDepartment.js';
import GetTeam from './GetTeam.js';
import GetTaskType from './GetTaskType.js';

export default function TaskList({tasks}) {
	// const {orders, setOrders} = useContext(OrderContext);

	const { projectName, _id, tasksId, taskType, duration, description, destination, department, travelFunds, expenses, refund, Status, assignedTo } = tasks;
	const {user, setUser} = useContext(UserContext);
	const [projName, setProjectName ] = useState('');
	const [Type, setTaskType] = useState("");
	const [taskduration, setDuration] = useState("");
	const [desc, setDescription] = useState("");
	const [dest, setDestination] = useState("");
	const [dept, setDepartment] = useState("");
	const [tFunds, setTravelFunds] = useState("");
	const [taskexpenses, setExpenses] = useState();
	const [taskrefund, setRefund] = useState("");
	const [taskStatus, setStatus] = useState("");
	const [assigned, setAssigned] = useState("");
	const [Label, setLabel] = useState("Refund");
	const [active, setActive] = useState();
	const [ReadOnly, setReadOnly] = useState();
	const [curTask, setCurTask ] = useState();

	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const [ task, setTask ] = useState(0);
	const [ id, setId ] = useState(0);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_URL}/tasks/details`, {
		    method: "POST",
		    headers: { 
		        'Content-Type' : 'application/json'
		    },
		    body: JSON.stringify({
		        tasksId: tasksId
		    })
		})
		.then(res => res.json())
		.then(data => {
		    setTaskType(data.taskType);
		    setDuration(duration);
		    setDescription(data.description);
		    setDestination(data.dest);
		    setDepartment(data.department);
		    setTravelFunds(data.travelFunds);
		    setExpenses(data.expenses);
		    setRefund(data.refund);
		    setStatus(data.Status);
		    setAssigned(data.assignedTo[0].fullName);
		})
	},[tasksId])

	useEffect(() => {
        if (parseFloat(taskrefund) < 0) {
            setLabel("Refund");
        } else {
            setLabel("Return");
        }

        if (taskexpenses == '') {
        	setExpenses(0);
        	setStatus("In Progress");
        }

    }, [taskrefund]);

	function archive(id) {
	    fetch(`${process.env.REACT_APP_API_URL}/tasks/archive/${id}`, {
		    method: "PATCH",
		    headers: { 
		        'Content-Type' : 'application/json',
		        Authorization: `Bearer ${localStorage.getItem('token')}`
		    },
		    body: JSON.stringify({
		        isActive: active
		    })
		}).then(res => res.json())
		.then(data => {
		    console.log(data);
		})
	}

	const formatDate = (dateString) => {
	  const date = new Date(dateString);
	  const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
	  return formattedDate;
	};

	const handleExpensesChange = (e) => {

		setExpenses(e.target.value);
		if (e.target.value == 0) {
			setRefund('');
		} else {
       		setRefund(parseFloat(tFunds) - parseFloat(e.target.value));
		}
    };

    const reset = () => {
    	setExpenses(0);
    	setStatus("In Progress");
    	setRefund('');
    }

	function edit(e) {
	    e.preventDefault();
	    fetch(`http://localhost:4000/tasks/update`, {
	        method: "PUT",
	        headers: {
	            'Content-Type': 'Application/json',
	            Authorization: `Bearer ${localStorage.getItem('token')}`
	        },
	        body: JSON.stringify({
	            tasksId: tasksId,
	            projectName: projName,
	            description: desc,
	            destination: dest,
	            duration: taskduration,
	            taskType: Type,
	            department: dept,
	            assignedTo: assigned,
	            travelFunds: tFunds,
	            expenses: taskexpenses,
	            refund: taskrefund,
	            Status: taskStatus
	        })
	    })
	        .then(res => {
	            if (!res.ok) {
	                throw new Error('Network response was not ok');
	            }
	            Swal.fire({
	                title: "Updated Successfully",
	                icon: "success",
	                text: "The Task is Updated"
	            });
	            assignTask(assigned, _id);
	            setTaskActive();
	            updateSubTask();
	            window.dispatchEvent(new Event('taskCreated'));
	            console.log(res);
	        })
	        .catch(error => {
	            console.error('There was a problem with the fetch operation:', error);
	            // Handle error, e.g., display an error message to the user
	        });
	}

	function setActiveTask(e) {
	    if (e === "Completed") {
	        setStatus("Completed");
	        setActive(false);
	    } else if (e === "In Progress") {
	        setStatus("In Progress");
	        setActive(true);
	    } else if (e === "Failed") {
	        setStatus("Failed");
	        setActive(false);
	    }
	}

	function assignTask(fullName, id) {
        fetch(`http://localhost:4000/tasks/assign`, {
            method: "POST",
            headers: {
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify({
                id : id,
                fullName: fullName,
                active: active
            })
        })
        .then(res => {
            console.log(res);
            window.dispatchEvent(new Event('taskCreated'));
            archive(id);
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle error, e.g., display an error message to the user
        });
    }

    function setTaskActive() {
        fetch(`http://localhost:4000/tasks/active`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify({
            	id: id,
                active: active,
            })
        })
        .then(res => {
            console.log(res);
            window.dispatchEvent(new Event('taskCreated'));
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle error, e.g., display an error message to the user
        });
    }

    function updateSubTask() {
        fetch(`http://localhost:4000/project/updateProjectTasks`, {
            method: "PUT",
            headers: {
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify({
            	tasks: tasks,
            	Status: taskStatus
            })
        })
        .then(res => {
            console.log(res);
            window.dispatchEvent(new Event('ProjectCreated'));
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle error, e.g., display an error message to the user
        });
    }


	function sets(e, id) {
		console.log(e);
		setShow(true);
		setTask(e);
		setId(id);
	}

	return (
	<>	
		<Modal size="lg" id="thisModal" className="" show={show} onHide={handleClose}>
			    <Modal.Header style={{textAlign: "center", height: "4rem"}} className="d-flex flex-column text-center align-items-center" closeButton>
			      <Modal.Title className="">Modify</Modal.Title>
			    </Modal.Header>
			    <Modal.Body className="d-flex justify-content-center" style={{background: "peachpuff"}}>
					<Form onSubmit={e => edit(e)} style={{width: "50vw"}}>
						<Form.Group style={{width: "47vw"}} className="ms-4 me-4">
                            <Form.Label>Project:</Form.Label>
                            <Form.Control type="text" name="projectName" value={projectName} disabled={true} />
                        </Form.Group>
                        <div className="d-flex flex-row mb-2" style={{justifyContent: "space-around"}}>
                            <Form.Group style={{width: "30vw"}} className="ms-4 me-4">
                                <Form.Label>Task Type:</Form.Label>
                                <Form.Select type="text" placeholder="Enter task type" name="taskType" defaultValue={Type} onChange={e => setTaskType(e.target.value)} >
                                	<GetTaskType department={dept} />
                                </Form.Select>
                            </Form.Group>
                            <Form.Group style={{width: "20vw"}} className="ms-4 me-4">
                                <Form.Label>Due Date:</Form.Label>
                                <Form.Control type="date" name="dueDate" value={taskduration} onChange={e => setDuration(e.target.value)} />
                            </Form.Group>
                        </div>
                        <Form.Group style={{width: "47vw"}} className="ms-4 me-4">
                            <Form.Label>Destination:</Form.Label>
                            <Form.Control type="text" placeholder="Enter Destination" name="destination" value={destination} onChange={e => setDestination(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="ms-4 me-4 mb-2" style={{ width: "47vw" }}>
                            <Form.Label>Description:</Form.Label>
                            <Form.Control as="textarea" rows={5} placeholder="Enter description" name="description" value={desc} onChange={e => setDescription(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="ms-4 me-4 mb-2" style={{ width: "47vw" }}>
                            <Form.Label>Department:</Form.Label>
                            <Form.Select defaultValue={dept} onChange={e => setDepartment(e.target.value)} name="department">
                                <GetDepartment />
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="ms-4 me-4 mb-2" style={{ width: "47vw" }}>
                            <Form.Label>Assigned To:</Form.Label>
                            <Form.Select onChange={e => setAssigned(e.target.value)} name="fullName" >
                            	<option value={assignedTo[0].fullName} selected>{assignedTo[0].fullName}</option>
    	 						<GetTeam department={dept}/>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-flex flex-row mb-2" style={{justifyContent: "space-around"}}>
                            <Form.Group style={{width: "30vw"}}  className="ms-4 me-4">
                                <Form.Label>Travel Funds:</Form.Label>
                                <Form.Control type="text" placeholder="Enter travel funds" name="travelFunds" value={tFunds} onChange={e => setTravelFunds(e.target.value)} readOnly/>
                            </Form.Group>
                            <Form.Group style={{width: 'calc(30vw - 40px)'}}  className="ms-4 me-3">
	                            <Form.Label>Expenses:</Form.Label>
	                            <div className="d-flex flex-row align-items-center">
	                            	<Form.Control style={{borderRadius: "0px"}} type="number" placeholder="Enter expenses" value={taskexpenses} onChange={handleExpensesChange} readOnly={taskStatus === "Completed" || taskStatus === "Failed"} />
	                            	<Button style={{borderRadius: "0px", height: "37px"}} onClick={reset}>Reset</Button>
	                            </div>
	                        </Form.Group>
                        </div>
                        <div className="d-flex flex-row mb-2" style={{justifyContent: "space-around"}}>
	                        <Form.Group style={{width: "30vw"}}  className="ms-4 me-4">
	                            <Form.Label>{Label}</Form.Label>
	                            <Form.Control type="text" placeholder="Refund" value={taskrefund} readOnly />
	                        </Form.Group>
	                        <Form.Group style={{width: "30vw"}}  className="ms-4 me-3">
	                            <Form.Label>Status</Form.Label>
	                            <Form.Select defaultValue={taskStatus} onChange={(e) => setActiveTask(e.target.value, _id)} name="Status" disabled={ReadOnly}>
	                                {(taskexpenses == 0) ? <option value="In Progress">In Progress</option> : <></>}
	                                <option value="Completed">Completed</option>
	                                <option value="Failed">Failed</option>
	                            </Form.Select>
	                        </Form.Group>
	                    </div>
                        <div className="d-flex flex-row mt-2=3" style={{justifyContent: "center"}}>
                            <Button variant="primary" className="pl-3 pr-3 me-4" type="submit" onClick={handleClose}>
                                Update
                            </Button>
                            <Button variant="secondary" className="pl-3 pr-3" onClick={handleClose}>
						        Close
						    </Button>
                        </div>
                    </Form>
			    </Modal.Body>
			</Modal>
		<tr className="">
		    <td style={{ width: "26%", height: "50px"}}>
		        <div className="d-flex align-items-top justify-content-center pt-2" style={{width: "100%", height: "100%", overflowY: "auto", textOverflow: "hidden", overflowX: "hidden", fontSize: '0.8rem' }}>
		            {taskType}
		        </div>
		    </td>
		    <td  style={{ width: "30%", height: "50px"}}>
	        	<div className="d-flex align-items-top justify-content-center pt2" style={{ padding: "5px", width: "100%", height: "100%", overflowY: "auto", textOverflow: "hidden", overflowX: "hidden", fontSize: '0.8rem' }}>
		            {assignedTo[0].fullName}
		        </div>
		    </td>
		    <td style={{ width: "17.6%" }}>
		        <div className="d-flex align-items-center justify-content-center" style={{ height: "50px", fontSize: '0.8rem'}}>
		            {formatDate(duration)}
		        </div>
		    </td>
		    <td style={{ width: "16.6%" }}>
		        <div className="d-flex align-items-center justify-content-center" style={{ height: "50px", fontSize: '0.8rem'}}>
		            {Status}
		        </div>
		    </td>
		    <td style={{ width: "12.6%"}}>
		        <div className="d-flex align-items-center ml-auto" style={{ height: "50px", width: "65px", fontSize: '0.8rem'}}>
		            <button id="bt1" style={{ marginLeft: "10px", marginRight: "20px", padding: "5px" }} onClick={() => sets(tasksId, _id)}>Details</button>
		        </div>
		    </td>
		</tr>
	</>
	)
}