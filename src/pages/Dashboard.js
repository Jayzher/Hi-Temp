import Tabs from '../components/Tab';
import SideNavBar from "../components/SideNavBar";
import UserContext from '../userContext';
import { useContext, useEffect } from "react";
import "../components/comp.css";
import { useNavigate } from 'react-router-dom';
import Top_Arrow from "../images/top-arrow.png";

export default function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scrolling animation
        });
    }

    return (
        <div style={{background: "azure"}}>
            <SideNavBar />
            <Tabs style={{position: "sticky", top: "0", zIndex: "2"}} />
            <div className="fixed-image" onClick={scrollToTop}>
                <img src={Top_Arrow} alt="Fixed Image" />
            </div>
        </div>
    );
};
