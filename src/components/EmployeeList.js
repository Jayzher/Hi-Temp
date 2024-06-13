import './Style.css';
import React, { useState, useEffect, useContext } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';

export default function EmployeeList({ employee, onUpdateStatus }) {
    const { _id, name, username, department, role, Status, changePassword, isAdmin } = employee;

    const [show, setShow] = useState(false);
    const [employeeName, setEmployeeName] = useState(name);
    const [employeeUserName, setUsername] = useState(username);
    const [employeeDept, setEmployeeDept] = useState(department);
    const [employeeRole, setEmployeeRole] = useState(role);
    const [employeeStatus, setStatus] = useState(Status);
    const [employeeChangePassword, setChangePassword] = useState(changePassword);
    const [employeeIsAdmin, setIsAdmin] = useState(isAdmin);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        setStatus(Status);
    }, [Status]);

    const handleUpdate = () => {
        const updatedEmployee = {
            _id,
            name: employeeName,
            username: employeeUserName,
            department: employeeDept,
            role: employeeRole,
            Status: employeeStatus,
            changePassword: employeeChangePassword,
            isAdmin: employeeIsAdmin
        };
        onUpdateStatus(updatedEmployee); // Call the onUpdateStatus function to update the employee
        handleClose();
    };

    return (
        <>
            <tr>
                <td style={{ fontSize: '0.8rem', width: '30%', maxWidth: '30%' }}>{employeeName}</td>
                <td style={{ fontSize: '0.8rem', width: '20%', maxWidth: '20%' }}>{employeeUserName}</td>
                <td style={{ fontSize: '0.8rem', width: '40%', maxWidth: '40%' }}>{employeeDept}</td>
                <td style={{ fontSize: '0.8rem', width: '20%', maxWidth: '20%' }}>{employeeRole}</td>
                <td style={{ fontSize: '0.8rem', width: '10%', maxWidth: '10%' }} className={`${(employeeStatus) ? 'Green' : 'RedOrange'}`}>{(employeeStatus) ? 'Online' : 'Offline'}</td>
                <td style={{ fontSize: '0.8rem', width: '5%', maxWidth: '5%' }}>
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
                        <Form.Group controlId="formEmployeeUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={employeeUserName}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmployeeDept">
                            <Form.Label>Department</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter department"
                                value={employeeDept}
                                onChange={(e) => setEmployeeDept(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmployeeRole">
                            <Form.Label>Role</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter role"
                                value={employeeRole}
                                onChange={(e) => setEmployeeRole(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmployeeChangePassword">
                            <Form.Label>Change Password</Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Change Password"
                                checked={employeeChangePassword}
                                onChange={(e) => setChangePassword(e.target.checked)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmployeeIsAdmin">
                            <Form.Label>Admin</Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Is Admin"
                                checked={employeeIsAdmin}
                                onChange={(e) => setIsAdmin(e.target.checked)}
                            />
                        </Form.Group>
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
