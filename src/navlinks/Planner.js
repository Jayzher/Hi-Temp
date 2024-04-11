import Tabs from '../components/Tab';
import SideNavBar from "../components/SideNavBar";
import DisplayPlanner from "../components/DisplayPlanner";
import UserContext from '../userContext';
import { useContext, useEffect } from "react";
import { Navigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile'; 

export default function Planner() {

	const {user, setUser} = useContext(UserContext);

	return(
		<>
			<SideNavBar />
			<DisplayPlanner />
		</>
	)
}