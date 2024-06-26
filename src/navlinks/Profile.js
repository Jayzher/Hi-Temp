import Tabs from '../components/Tab';
import SideNavBar from "../components/SideNavBar";
import UserContext from '../userContext';
import { useContext, useEffect } from "react";
import { Navigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile'; 

export default function Profile() {

	const {user, setUser} = useContext(UserContext);

	return(
		<>
			<SideNavBar />
			<UserProfile />
		</>
	)
}