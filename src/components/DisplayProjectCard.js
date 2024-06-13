import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Form, Modal, Button } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext';
import ProjectCard from '../components/ProjectCard';
import { useSocket } from '../SocketProvider';
import swal from 'sweetalert2';

const apiUrl = process.env.REACT_APP_API_URL;

export default function DisplayProjectCard() {
    const [projects, setProjects] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const socket = useSocket();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [formData2, setFormData2] = useState({
        projectName: '',
        description: '',
        company: '',
        product: '',
        address: '',
        projExpenses: ''
    });

    const fetchProjects = async () => {
        try {
            let response;
            if (user.role === "Admin") {
                response = await fetch(`${apiUrl}/project/allProject`);
            } else {
                response = await fetch(`${apiUrl}/project/active`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fullName: user.name })
                });
            }

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
        window.addEventListener('projectCreated', fetchProjects);

        return () => {
            window.removeEventListener('projectCreated', fetchProjects);
        };
    }, [user.id]);

    useEffect(() => {
        fetchProjects();

        if (socket) {
            socket.on('projectCreated', fetchProjects);
            socket.on('projectUpdated', fetchProjects);

            return () => {
                socket.off('projectCreated', fetchProjects);
                socket.off('projectUpdated', fetchProjects);
            };
        }
    }, [socket, user.name, user.role]);

    function createProject(e) {
        e.preventDefault();

        fetch(`${apiUrl}/project/createProject`, {
            method: "POST",
            headers: {
                'Content-Type': 'Application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                projectName: formData2.projectName,
                company: formData2.company,
                product: formData2.product,
                address: formData2.address,
                description: formData2.description
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            setFormData2({
                projectName: '',
                description: '',
                company: '',
                product: '',
                address: '',
                projExpenses: ''
            });
            swal.fire({
                title: "Project Created",
                icon: "success",
                text: "Project Created Successfully!"
            });
            // Dispatch the custom event to re-fetch projects
            window.dispatchEvent(new Event('projectCreated'));
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle error, e.g., display an error message to the user
        });
    }

    const handleSubmit2 = (e) => {
        e.preventDefault();
        createProject(e);
    };

    const handleChange2 = (e) => {
        const { name, value } = e.target;
        setFormData2({ ...formData2, [name]: value });
    };

    return (
        <Container>
            <Modal size="md" id="thisModal" show={show} onHide={handleClose}>
                <Modal.Body className="d-flex justify-content-center" style={{ background: "peachpuff", borderRadius: "10px"}} closeButton>
                    <Form className="ms-2" onSubmit={handleSubmit2} style={{width: "100%"}}>
                        <div className="d-flex justify-content-center">
                            <h1 className="text-center">Create Project</h1>
                        </div>
                        <Form.Group className="ms-2 me-3 mb-2">
                            <Form.Label>Project Name:</Form.Label>
                            <Form.Control type="text" placeholder="Enter Project Name" name="projectName" value={formData2.projectName} onChange={handleChange2} required />
                        </Form.Group>
                        <Form.Group className="ms-2 me-3 mb-2">
                            <Form.Label>Company:</Form.Label>
                            <Form.Control type="text" placeholder="Enter Company Name" name="company" value={formData2.company} onChange={handleChange2} required />
                        </Form.Group>
                        <Form.Group className="ms-2 me-3 mb-2">
                            <Form.Label>Product:</Form.Label>
                            <Form.Control type="text" placeholder="Enter Product Name" name="product" value={formData2.product} onChange={handleChange2} required />
                        </Form.Group>
                        <Form.Group className="ms-2 me-3 mb-2">
                            <Form.Label>Address:</Form.Label>
                            <Form.Control type="text" name="address" placeholder="Enter Address" value={formData2.address} onChange={handleChange2} />
                        </Form.Group>
                        <Form.Group className="ms-2 me-3 mb-2">
                            <Form.Label>Description:</Form.Label>
                            <Form.Control as="textarea" rows={5} placeholder="Enter description" name="description" value={formData2.description} onChange={handleChange2} required />
                        </Form.Group>
                        <div className="d-flex flex-row mb-2" style={{justifyContent: "center"}}>
                            <Button variant="primary" type="submit" className="me-2">
                                Create
                            </Button>
                            <Button variant="secondary" className="pl-3 pr-3" onClick={handleClose}>
                                Close
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            {(user.role === "Admin") ?
                <div className="mb-3" style={{width: "fit-content"}}>
                    <h5 style={{cursor: "pointer", color: "royalblue"}} onClick={handleShow}>New Project</h5>
                </div>
                :
                <>
                </>
            }
            <Row className="justify-content-center">
                {projects.map(item => (
                    <ProjectCard key={item?._id} proj={item} />
                ))}
            </Row>
        </Container>
    );
}
