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

export default function ProjectList({proj}) {
	// // const {orders, setOrders} = useContext(OrderContext);

	const {projectName, company, address, description, DateCompleted, projExpenses, Status, subTasks, createdOn, Remarks} = proj;
	const {user, setUser} = useContext(UserContext);
	const [Name, setName] = useState(projectName);
	const [projCompany, setProjCompany] = useState(company);
	const [projAddress, setProjAddress] = useState(address);
	const [projDescription, setDescription] = useState(description);
	const [projDateCompleted, setDateCompleted] = useState(new Date());
	const [Expenses, setProjExpenses] = useState(projExpenses);
	const [projStatus, setStatus] = useState(Status);
	const [projRemarks, setRemarks] = useState(Remarks);

	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const [ projName, setProjName ] = useState(projectName);
	const [ id, setId ] = useState(0);

	// useEffect(() => {
	// 	fetch(`http://localhost:4000/tasks/details`, {
	// 		method: "POST",
	// 		headers: { 
	// 			'Content-Type' : 'application/json'
	// 		},
	// 		body: JSON.stringify({
	// 			tasksId: tasksId
	// 		})
	// 	})
	// 	.then(res => res.json())
	// 	.then(data => {
	// 		setName(data.name);
	// 		setTaskType(data.taskType);
	// 		setDuration(duration);
	// 		setDescription(data.description);
	// 		setDestination(data.dest);
	// 		setDepartment(data.department);
	// 		setTravelFunds(data.travelFunds);
	// 		setExpenses(data.expenses);
	// 		setRefund(data.refund);
	// 		setStatus(data.Status);
	// 		setAssigned(data.assignedTo[0].fullName);
	// 	})
	// },[tasksId])

    // function setActiveTask(e) {
    // 	setStatus(e);
    // 	if (e == "Completed"){
    // 		setStatus("Completed");
    // 	} else if (e == "In Progress") {
    // 		setStatus("In Progress");
    // 	} else if (e == "Failed") {
    // 		setActive(false);
    // 	}
    // }

	const formatDate = () => {
	    const date = new Date();
	    const options = {
	        timeZone: 'Asia/Manila',
	        year: 'numeric',
	        month: '2-digit',
	        day: '2-digit',
	        hour: '2-digit',
	        minute: '2-digit',
	        second: '2-digit',
	    };
	    const formattedDate = date.toLocaleString('en-PH', options);
	    return formattedDate;
	};

	function edit(e) {
	    fetch(`http://localhost:4000/project/updateProject`, {
	        method: "PATCH",
	        headers: {
	            'Content-Type' : 'application/json',
	            Authorization: `Bearer ${localStorage.getItem('token')}`
	        },
	        body: JSON.stringify({
	            projectName: projName,
	            description: projDescription,
	            company: projCompany,
	            address: projAddress,
	            Status: projStatus,
	            Remarks: projRemarks,
	            DateCompleted: DateCompleted
	        })
	    })
	    .then(res => {
	        if (!res.ok) {
	            throw new Error('Network response was not ok');
	        }
	         Swal.fire({
	            title: "Updated Successfully",
	            icon: "success",
	            text: "The Project is Updated"
	        });
	        window.dispatchEvent(new Event('ProjectCreated'));
	    })
	    .catch(error => {
	        console.error('There was a problem with the fetch operation:', error);
	        // Handle error, e.g., display an error message to the user
	    });
	}


	// function assignTask(Id, fullName) {
    //     fetch(`http://localhost:4000/tasks/assign`, {
    //         method: "POST",
    //         headers: {
    //             'Content-Type': 'Application/json'
    //         },
    //         body: JSON.stringify({
    //             id : Id,
    //             fullName: fullName,
    //             active: active
    //         })
    //     })
    //     .then(res => {
    //         console.log(res);
    //         window.dispatchEvent(new Event('taskCreated'));
    //     })
    //     .catch(error => {
    //         console.error("Error:", error);
    //         // Handle error, e.g., display an error message to the user
    //     });
    // }

    // function setTaskActive() {
    //     fetch(`http://localhost:4000/tasks/setActive`, {
    //         method: "PUT",
    //         headers: {
    //             'Content-Type': 'Application/json'
    //         },
    //         body: JSON.stringify({
    //         	id: id,
    //             active: active
    //         })
    //     })
    //     .then(res => {
    //         console.log(res);
    //         window.dispatchEvent(new Event('taskCreated'));
    //     })
    //     .catch(error => {
    //         console.error("Error:", error);
    //         // Handle error, e.g., display an error message to the user
    //     });
    // }


	function sets(projName) {
		console.log(projName);
		setShow(true);
	}

	return (
	<>	
		<Modal size="lg" id="thisModal" className="" show={show} onHide={handleClose}>
		    <Modal.Header style={{textAlign: "center", height: "4rem"}} className="d-flex flex-column text-center align-items-center" closeButton>
		      <Modal.Title className="">Modify</Modal.Title>
		    </Modal.Header>
		    <Modal.Body className="d-flex justify-content-center" style={{background: "peachpuff"}}>
				<Form onSubmit={e => edit(e)} style={{width: "50vw"}}>
                    <div className="d-flex flex-row ms-4 me-4 mb-2" style={{justifyContent: "space-around"}}>
                        <Form.Group style={{width: "50vw"}}>
                            <Form.Label className="ms-1">Project Name:</Form.Label>
                            <Form.Control type="text" placeholder="Enter Project Name" name="projectName" disabled={true} value={Name} onChange={e => setName(e.target.value)} />
                        </Form.Group>
                    </div>
                    <div className="d-flex flex-row mb-2" style={{justifyContent: "space-around"}}>
                        <Form.Group style={{width: "47vw"}}>
                            <Form.Label className="ms-1">Company / Client:</Form.Label>
                            <Form.Control type="text" placeholder="Enter task type" name="company" value={projCompany} onChange={e => setProjCompany(e.target.value)} />
                        </Form.Group>
                    </div>
                    <Form.Group style={{width: "47vw"}} className="ms-4 me-4">
                        <Form.Label className="ms-1">Address:</Form.Label>
                        <Form.Control type="text" placeholder="Enter Address" name="address" value={projAddress} onChange={e => setProjAddress(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="ms-4 me-4 mb-2" style={{ width: "47vw" }}>
                        <Form.Label className="ms-1">Description:</Form.Label>
                        <Form.Control as="textarea" rows={5} placeholder="Enter description" name="description" value={projDescription} onChange={e => setDescription(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="ms-4 me-4 mb-2" style={{ width: "47vw" }}>
                        <Form.Label className="ms-1">Status:</Form.Label>
                        <Form.Select type="text" placeholder="Enter Status" name="Status" value={projStatus} onChange={e => setStatus(e.target.value)} >
                        	<option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="ms-4 me-4 mb-2" style={{ width: "47vw" }}>
                        <Form.Label className="ms-1">Remarks:</Form.Label>
                        <Form.Control as="textarea" rows={5} placeholder="Enter Remarks" name="Remarks" value={projRemarks} onChange={e => setRemarks(e.target.value)} />
                    </Form.Group>
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
		            {projectName}
		        </div>
		    </td>
		    <td  style={{ width: "30%", height: "50px"}}>
	        	<div className="d-flex align-items-top justify-content-center pt2" style={{ padding: "5px", width: "100%", height: "100%", overflowY: "auto", textOverflow: "hidden", overflowX: "hidden", fontSize: '0.8rem' }}>
		            {company}
		        </div>
		    </td>
		    <td style={{ width: "14.6%" }}>
		        <div className="d-flex align-items-center justify-content-center" style={{ height: "50px", fontSize: '0.8rem'}}>
		            {formatDate(createdOn)}
		        </div>
		    </td>
		    <td style={{ width: "14.6%" }}>
		        <div className="d-flex align-items-center justify-content-center" style={{ height: "50px", fontSize: '0.8rem'}}>
		            {Status}
		        </div>
		    </td>
		    <td style={{ width: "12.6%"}}>
		        <div className="d-flex align-items-center ml-auto" style={{ height: "50px", width: "76px", fontSize: '0.8rem'}}>
		            <button id="bt1" style={{ marginLeft: "20px", marginRight: "20px", padding: "5px" }} onClick={() => sets(projectName)}>Details</button>
		        </div>
		    </td>
		</tr>
	</>
	)
}