import Tabs from '../components/Tab';
import SideNavBar from "../components/SideNavBar";
import UserContext from '../userContext';
import { useContext, useEffect } from "react";
import { Navigate } from 'react-router-dom'; 

export default function Profile() {

	const {user, setUser} = useContext(UserContext);

	return(
		<>
			<SideNavBar />
			<Tabs />
		</>
	)
}