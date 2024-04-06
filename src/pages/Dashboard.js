import Tabs from '../components/Tab';
import SideNavBar from "../components/SideNavBar";
import UserContext from '../userContext';
import { useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div style={{background: "azure"}}>
            <SideNavBar />
            <Tabs />
        </div>
    );
};
