import Tabs from '../components/Tab';
import SideNavBar from "../components/SideNavBar";
import UserContext from '../userContext';
import { useContext, useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import NewTasks from '../components/NewTasks';

export default function CreateNewTask() {

	const {user, setUser} = useContext(UserContext);
	const navigate = useNavigate();

	return(
		<div style={{margin: "0"}}>
			<SideNavBar />
			<NewTasks />
		</div>
	)
}