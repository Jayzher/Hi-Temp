import './comp.css';
import React, { useState, useEffect, useContext } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';

export default function EmployeeList({ employee, onUpdateStatus }) {
    const { _id, name, username, department, role, Status } = employee;

    const [show, setShow] = useState(false);
    const [employeeName, setEmployeeName] = useState(name);
    const [employeeUserName, setUsername] = useState(username);
    const [employeedept, setEmployeedept] = useState(department);
    const [employeerole, setEmployeerole] = useState(role);
    const [employeeStatus, setStatus] = useState(Status);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        setStatus(Status); // Update the status when it changes
    }, [Status]);

    const handleUpdate = () => {
        // Implement update logic here
        onUpdateStatus(_id, employeeStatus); // Call the onUpdateStatus function to update status
        handleClose();
    };

    return (
        <>
            <tr>
                <td style={{fontSize: '0.8rem', width: '19%', maxWidth: '19%'}}>{employeeName}</td>
                <td style={{fontSize: '0.8rem', width: '20%', maxWidth: '20%'}}>{employeeUserName}</td>
                <td style={{fontSize: '0.8rem', width: '20%', maxWidth: '20%'}}>{employeedept}</td>
                <td style={{fontSize: '0.8rem', width: '20%', maxWidth: '20%'}}>{employeerole}</td>
                <td style={{fontSize: '0.8rem', width: '10%', maxWidth: '10%'}} className={`${(employeeStatus) ? 'Green' : 'RedOrange'}`}>{(employeeStatus) ? 'Online' : 'Offline'}</td>
                <td style={{fontSize: '0.8rem', width: '5%', maxWidth: '5%'}}>
                    <Button variant="primary" onClick={handleShow}>
                        Edit
                    </Button>
                </td>
            </tr>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formEmployeeName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmployeeName">
                            <Form.Label>Department</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Department"
                                value={employeedept}
                                onChange={(e) => setEmployeedept(e.target.value)}
                            />
                        </Form.Group>
                        {/* Add more form fields as needed */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdate}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
