import { Container, Row } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext';
import TaskCard from '../components/TaskCard';
import { io } from 'socket.io-client';
import PlannerList from './PlannerList.js';

export default function DisplayPlanner() {

    return (
        <div className="dashboard-container">
            <div className="d-flex flex-row align-items-center" style={{height: "100vh", minHeight: "100vh", width: "85vw", marginLeft: "15vw", backgroundImage: "linear-gradient( 92.7deg,  rgba(245,212,212,1) 8.5%, rgba(252,251,224,1) 90.2% )", overflowy: "hidden"}}>
                <PlannerList />
            </div>
        </div>            
    );
}
