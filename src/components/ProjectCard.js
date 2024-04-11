import './comp.css';
import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../userContext';
import { Card, Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Link, useNavigate } from 'react-router-dom';

export default function ProjectCard({ proj }) {
    const { projectName, company, address, description, DateCompleted, projExpenses, Status, subTasks, createdOn, Remarks } = proj;
    const dashboard = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const [show2, setShow2] = useState(false);
    const handleClose2 = () => { setShow2(false); dashboard('/Dashboard')};
    const handleShow = () => setShow2(true);
    const [userData, setUserData] = useState({});
    const [taskCount, setTaskCount] = useState(0);

    useEffect(() => {
        setTaskCount(subTasks.length); // Update task count when subTasks changes
    }, [subTasks]);

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
            <Modal id="thisModal" className="" show={show2} onHide={handleClose2} centered>
                <div style={{ background: "peachpuff", width: "100%", borderRadius: "10px" }}>
                    <Modal.Header style={{ textAlign: "center", height: "4rem", border: "none" }} className="d-flex flex-column text-center align-items-center" closeButton>
                        <Modal.Title className="">{projectName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="modal-body" style={{ background: "peachpuff", maxHeight: "60vh", overflowY: "auto" }}>
                        <Card style={{ width: '100%', background: "rgba(0,0,0,0.1)", height: "fit-content", border: "solid 1px black" }} className="d-flex flex-column pt-3">
                            <Card.Body>
                                <label style={{ fontWeight: "bold", fontSize: "1rem" }}>Company:</label>
                                <Card.Title style={{ fontSize: "1rem" }} className="ps-3 pe-3 pt-2 pb-2">{company}</Card.Title>
                                <label style={{ fontWeight: "bold", fontSize: "1rem" }} className="">Address:</label>
                                <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
                                    {address}
                                </Card.Text>
                                <label style={{ fontWeight: "bold", fontSize: "1rem" }}>Description:</label>
                                <div id="modalDesc" style={{ height: "130px", background: "peachpuff", textAlign: "justify", overflowY: "auto", textOverflow: "hidden" }}>
                                    <Card.Text className="ps-3 pe-3 fs-6 pt-2 pb-2">
                                        {description}
                                    </Card.Text>
                                </div>
                                <label style={{ fontWeight: "bold", fontSize: "1rem" }}>Progress:</label>
                                {subTasks.map(tasks => (
                                    <Card.Text key={tasks.id} className="ps-3 pe-3 fs-6 mb-2">
                                        <Link to={`/Dashboard/${tasks._id}`} onClick={handleClose2} className="text-decoration-none">
                                            {formatDate(tasks.DateCompleted)} - {tasks.taskType} - {tasks.assignedTo[0].fullName}
                                        </Link>
                                    </Card.Text>
                                ))}
                                <div className="mt-3">
                                    <div className="d-flex flex-column">
                                        <label style={{ fontWeight: "bold", fontSize: "1rem" }} className="">Expenses:</label>
                                        <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
                                            {projExpenses}
                                        </Card.Text>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <label style={{ fontWeight: "bold", fontSize: "1rem" }} className="">Date Completed:</label>
                                        <Card.Text className="ps-3 pe-3 fs-6 mb-2" >
                                            {formatDate(DateCompleted)}
                                        </Card.Text>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <label style={{ fontWeight: "bold", fontSize: "1rem" }} className="">Status:</label>
                                        <Card.Text className={`ps-3 pe-3 fs-6 mb-2 ${getStatusColor(Status)}`}>
                                            {Status}
                                        </Card.Text>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Modal.Body>
                    <Modal.Footer style={{ border: "none" }} className="d-flex flex-row justify-content-center">
                        <Button variant="secondary" style={{ border: "solid 2px black" }} className="me-3 pl-3 pr-3" onClick={handleClose2}>
                            Close
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
            <div style={{ width: "fit-content", height: "fit-content", marginTop: '2vh' }}>
                <Card onClick={handleShow} className="d-flex" style={{ height: "200px", width: '500px', border: "solid 1px black", background: "azure", borderRadius: "10px", overflow: "hidden" }}>
                    <div className="d-flex flex-row justify-content-between">
                        <div className={`bg-${getStatusColor(Status)}`} style={{ height: "210px", width: "3%", borderRadius: "10px" }}></div>
                        <Card.Body className="w-100 opacity d-block" style={{ height: "100%", overflow: "hidden", borderRadius: "10px" }}>
                            <div className="d-flex p-0" style={{ height: "fit-content" }}>
                                <label style={{ fontSize: "1.3rem", fontWeight: "bold" }} className="">{projectName}</label>
                            </div>
                            <div className="d-flex align-items-center">
                                <label className="me-2" style={{ fontWeight: "bold", fontSize: "1rem" }}>Company:</label>
                                <Card.Text style={{ color: "black", fontSize: "0.8rem", marginBottom: "0px" }} className="">
                                    {company}
                                </Card.Text>
                            </div>
                            <div className="d-flex align-items-center">
                                <label className="me-2" style={{ fontWeight: "bold", fontSize: "1rem" }}>Address:</label>
                                <Card.Text style={{ color: "black", fontSize: "0.8rem", marginBottom: "0px" }} className="">
                                    {address}
                                </Card.Text>
                            </div>
                            <div className="d-flex align-items-center">
                                <label className="me-2" style={{ fontWeight: "bold", fontSize: "1rem" }}>Sub Tasks:</label>
                                <Card.Text style={{ color: "black", fontSize: "0.8rem", marginBottom: "0px" }} className="">
                                    {taskCount}
                                </Card.Text>
                            </div>
                            <div className="d-flex align-items-center">
                                <label className="me-2" style={{ fontWeight: "bold", fontSize: "1rem" }}>Status:</label>
                                <Card.Text style={{ fontSize: "0.8rem", marginBottom: "0px" }} className={`${getStatusColor(Status)}`}>
                                    {Status}
                                </Card.Text>
                            </div>
                        </Card.Body>
                        <div className="d-flex flex-column pb-2 justify-content-center" style={{ height: "200px", width: "150px" }}>
                            <img src={`https://cdn-icons-png.flaticon.com/512/4129/4129528.png`} alt="userProfile" className="ms-auto" style={{ height: "100px", width: "100px", borderRadius: "10px", border: "solid rgba(0, 0, 0, 0.3) 1px" }} />
                            <label style={{ fontSize: "0.7rem" }} className="mt-auto">{formattedDate}</label>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
