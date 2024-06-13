import "./Style.css";
import { Link } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import UserContext from '../userContext';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [ profile, setProfile ] = useState();

    useEffect(() => {
        setProfile(user.profile);
    }, []); // Empty dependency array to run the effect only once on component mount

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && profile !== user.profile) {
            updateProfile(token, profile);
        }
    }, [profile]);

	const updateProfile = (token, newProfile) => {
        fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
		    method: "PUT",
		    headers: {
		        Authorization: `Bearer ${localStorage.getItem('token')}`,
		        'Content-Type': 'application/json',
		    },
		    body: JSON.stringify({
		        profile: newProfile
		    })
		})
		.then(res => {
		    if (!res.ok) {
		        throw new Error('Failed to update user profile on the server');
		    }
		    return res.json();
		})
		.then(updatedUser => {
		    // Handle success or do further operations
		    console.log("User profile updated successfully:", updatedUser);
		    // Assuming you want to update the user context after successful update
		    setUser(prevUser => ({
		        ...prevUser,
		        profile: updatedUser.profile
		    }));
		})
		.catch(error => {
		    console.error('Error updating user profile:', error);
		});
    }

    const handleProfileUpload = (file) => {
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'profile_upload'); // Use your Cloudinary upload preset name

        fetch(`https://api.cloudinary.com/v1_1/dgzhcuwym/image/upload`, {
		    method: 'POST',
		    body: formData
		})
		.then(response => {
		    if (!response.ok) {
		        throw new Error('Failed to upload image to Cloudinary');
		    }
		    return response.json();
		})
		.then(data => {
		    if (data.secure_url) {
		        setProfile(data.secure_url); // Update profile state with uploaded image URL
		    }
		})
		.catch(error => {
		    console.error('Error uploading image to Cloudinary:', error);
		});

    }

	return(

		<div className="dashboard-container" style={{backgroud: "cyan"}}>
			<div className="tab-full" style={{marginLeft: "15vw"}}>
				<div id="profile" style={{backgroundImage: "linear-gradient( 92.7deg,  rgba(245,212,212,1) 8.5%, rgba(252,251,224,1) 90.2% )"}} className="m-0 pt-2">
					<input
					  type="file"
					  id="profileUploadInput"
					  style={{ display: 'none' }}
					  onChange={(e) => handleProfileUpload(e.target.files[0])}
					/>

					<label htmlFor="profileUploadInput" className="d-flex flex-column">
					  <img
					    style={{ height: "150px", width: "150px", borderRadius: "150px", border: "2px solid black", cursor: "pointer" }}
					    src={profile} // Set src to the profile state
					    alt="Profile"
					  />  
					</label>
					<p style={{marginTop: "0", fontSize: "1.7rem"}} id="name">{user.name}</p>
				</div>
				<div id="hr">
				</div>
				<div style={{backgroundImage: "radial-gradient( circle 400px at 6.8% 8.3%,  rgba(255,244,169,1) 0%, rgba(255,244,234,1) 100% )", height: "100%"}} className="d-flex flex-row">
					<div style={{width: "30vw", padding: "15px", height: "100%", width: "100%"}}>
						<h1 className="text-center" style={{fontSize: "1.8rem"}}>Change User Credentials</h1>
						<div style={{marginTop: "10px", height: "100%", paddingBottom: "10vh"}}>
							<Form>
						      <Row>
						        <Col>
						          <label htmlFor="firstname" className="fw-bold fs-6 pb-1">Name: </label>
						          <Form.Control placeholder="First name" defaultValue={user.name} />
						        </Col>
						      </Row>
						      <Row className="pt-2">
						        <Col>
						          <label htmlFor="username" className="fw-bold fs-6 pb-1">Username: </label>
						          <Form.Control placeholder="username" defaultValue={user.username} />
						        </Col>
						      </Row>
						      <div className="w-100 d-flex justify-content-center mt-3">
						      	<Button type="submit">Update</Button>
						      </div>
						    </Form>
						</div>
					</div>
					<div style={{height: "73.7vh"}}>
						
					</div>
				</div>
			</div>
		</div>
	)
}