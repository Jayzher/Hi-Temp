import './comp.css';
import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../userContext';
import { Card, Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useParams, useNavigate } from 'react-router-dom';

export default function DisplayCard({ tasks }) {
    const { _id, tasksId, name, taskType, duration, description, destination, department, travelFunds, expenses, refund, Status, assignedTo, createdOn } = tasks;
    const dashboard = useNavigate();
    const {user, setUser} = useContext(UserContext);
    const [show, setShow] = useState(false);
    const handleClose = () => { setShow(false); dashboard('/dashboard')};
    const handleShow = () => setShow(true); // Function to handle modal show
    const [userData, setUserData] = useState({}); // Corrected useState declaration
    const { taskId } = useParams(); // Get the taskId from URL params

    useEffect(() => {
        // Logic to check if taskId exists and show the modal
        if (taskId === _id) {
            handleShow();
        }
    }, [taskId]); 

    useEffect(() => {
        retrieveUserDetails();
    }, []); // Run once when component mounts

    const retrieveUserDetails = () => {
        fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                name : assignedTo[0].fullName
            })
        })
        .then(res => res.json())
        .then(data => {
            setUserData(data);
        })
        .catch(error => console.error('Error fetching user profile:', error));

    };

    const getStatusColor = (status) => {
        switch (status) {
            case "In Progress":
                return "yellow";
            case "Completed":
                return "lime";
            case "Failed":
                return "orangered";
            case "N/A":
                return "black";
            default:
                return "black"; // default color
        }
    };

	function formatDate(createdOn) {
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
	}


	const formattedDate = formatDate(createdOn);

    return (
        <>
            <Modal id="thisModal" className="" show={show} onHide={handleClose} centered>
                <div style={{background: "peachpuff", width: "100%", borderRadius: "10px"}}>
                    <Modal.Header style={{background: "peachpuff", textAlign: "center", height: "4rem", border: "none"}} className="d-flex flex-column text-center align-items-center" closeButton>
                        <Modal.Title style={{color: "black"}} className="">{taskType}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="modal-body" style={{ background: "peachpuff", maxHeight: "60vh", overflowY: "auto" }}>
                        <Card style={{ width: '100%', background: "rgba(0,0,0,0.1)", height: "fit-content", border: "solid 1px black"}} className="d-flex flex-column pt-3">
                            <Card.Body>
                            	<label style={{fontWeight: "bold", fontSize: "1rem"}}>Task Type:</label>
                                <Card.Title style={{fontSize: "1rem"}}>{taskType}</Card.Title>
                                <label style={{fontWeight: "bold", fontSize: "1rem"}} className="">Destination:</label>
                                <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
                                    {destination}
                                </Card.Text>
                                <label style={{fontWeight: "bold", fontSize: "1rem"}}>Description:</label>
                                <div id="modalDesc" style={{height: "130px", background: "peachpuff", textAlign: "justify", overflowY: "auto", textOverflow: "hidden"}}>
                                    <Card.Text className="ps-3 pe-3 fs-6 pt-2 pb-2" >
                                        {description}
                                    </Card.Text>
                                </div>
                                <label style={{fontWeight: "bold", fontSize: "1rem"}} className="">Department:</label>
                                <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
                                    {department}
                                </Card.Text>
                                <label style={{fontWeight: "bold", fontSize: "1rem"}} className="">Assigned To:</label>
                                <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
                                    {assignedTo[0].fullName}
                                </Card.Text>
                                <div className="d-flex flex-row justify-content-around" style={{background: "rgba(0, 0, 0, 0.2)", border: "solid black 2px"}}>
                                	<div className="d-flex flex-column">
    	                            	<label style={{fontWeight: "bold", fontSize: "1rem"}} className="">Travel Funds:</label>
    		                            <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
    		                                {travelFunds}
    		                            </Card.Text>
    	                            </div>
    	                            <div className="d-flex flex-column">
    	                            	<label style={{fontWeight: "bold", fontSize: "1rem"}} className="">Expenses:</label>
    		                            <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
    		                                {expenses}
    		                            </Card.Text>
    	                            </div>
    	                            <div className="d-flex flex-column">
    	                            	<label style={{fontWeight: "bold", fontSize: "1rem"}} className="">Refund / Return:</label>
    		                            <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
    		                                {refund}
    		                            </Card.Text>
    	                            </div>
                                </div>
                                <label style={{fontWeight: "bold", fontSize: "1rem"}} className="">Status:</label>
                                <Card.Text className={`ps-3 pe-3 fs-6 mb-2 ${getStatusColor(Status)}`}>
    							    {Status}
    							</Card.Text>
                            </Card.Body>
                        </Card>
                    </Modal.Body>
                    <Modal.Footer style={{background: "peachpuff", border: "none"}} className="d-flex flex-row justify-content-center">
                        <Button variant="secondary" style={{border: "solid 2px black"}} className="me-3 pl-3 pr-3" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
            <div style={{width: "fit-content", height: "fit-content", marginTop: '2vh'}}>
                <Card id="task-card" onClick={handleShow} className="d-flex" style={{ height: "200px", width: '500px', border: "solid 1px black", background: "azure", borderRadius: "10px", overflow: "hidden"}}>
                    <div className="d-flex flex-row justify-content-between">	
                    	<div className={`bg-${getStatusColor(Status)}`} style={{height: "210px", width: "3%", borderRadius: "10px"}}></div>
                    	<Card.Body className="w-100 opacity d-block" style={{height: "100%", overflow: "hidden", borderRadius: "10px"}}>
                    		<div className="d-flex p-0" style={{height: "fit-content"}}>
                    			<label style={{fontSize: "2rem", fontWeight: "bold"}} className="">{name}</label>
                    		</div>
                    		<div className="d-flex align-items-center">
		                        <label className="me-2" style={{fontWeight: "bold", fontSize: "1rem"}}>Task Type:</label>
		                        <Card.Text style={{color: "black", fontSize: "0.8rem", marginBottom: "0px"}} className="">
		                            {taskType}
		                        </Card.Text>
		                    </div>
		                    <div className="d-flex align-items-center">
		                        <label className="me-2" style={{fontWeight: "bold", fontSize: "1rem"}}>Assigned To:</label>
		                        <Card.Text style={{color: "black", fontSize: "0.8rem", marginBottom: "0px"}} className="">
		                            {assignedTo[0].fullName}
		                        </Card.Text>
		                    </div>
		                    <div className="d-flex align-items-center">
		                        <label className="me-2" style={{fontWeight: "bold", fontSize: "1rem"}}>Destination:</label>
		                        <Card.Text style={{color: "black", fontSize: "0.8rem", marginBottom: "0px"}} className="">
		                            {destination}
		                        </Card.Text>
		                    </div>
		                    <div className="d-flex align-items-center">
		                        <label className="me-2" style={{fontWeight: "bold", fontSize: "1rem"}}>Due Date:</label>
		                        <Card.Text style={{color: "black", fontSize: "0.8rem", marginBottom: "0px"}} className="">
		                            {duration}
		                        </Card.Text>
		                    </div>
	                        <div className="d-flex align-items-center">
	                        	<label className="me-2" style={{fontWeight: "bold", fontSize: "1rem"}}>Status:</label>
		                        <Card.Text style={{fontSize: "0.8rem", marginBottom: "0px"}} className={`${getStatusColor(Status)}`}>
		                            {Status}
		                        </Card.Text>
	                        </div>
	                    </Card.Body>
	                    <div className="d-flex flex-column pb-2 justify-content-center" style={{height: "200px", width: "150px"}}>
	                    	<img src={`${userData.profile}`} alt="userProfile" className="ms-auto" style={{height: "100px", width:"100px", borderRadius: "10px", border: "solid rgba(0, 0, 0, 0.3) 1px"}} />
	                    	<label style={{fontSize: "0.7rem"}} className="mt-auto">{formattedDate}</label>
	                    </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
