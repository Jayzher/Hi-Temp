import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Tasks from './Tasks.js';
import DisplayTaskCard from './DisplayTaskCard.js';
import DisplayProjectCard from './DisplayProjectCard.js';
// import Calendar from './Calendar.js';
import { useEffect } from 'react';

function JustifiedExample() {

  return (
    <Tabs defaultActiveKey="home" id="justify-tab-example" style={{paddingLeft: "", width: "84vw", left: "15.1vw", right: "0", position: "absolute"}} className="" justify>
      <Tab style={{ marginTop: "4.5vh", left: "15.1vw", position: "absolute", backgroundColor: "radial-gradient( circle 311px at 8.6% 27.9%, rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )", height: "100%", width: "84vw" }} eventKey="home" title="Tasks">
        <div className="d-flex flex-row justify-content-around pt-5 pb-5" style={{ backgroundImage: "radial-gradient(circle farthest-corner at 10% 50%, rgba(62,147,252,0.7) 0%, rgba(239,183,192,0.3) 90%)", height: "fit-content", width: "100%", minHeight: "100vh" }}>
            <DisplayTaskCard />
        </div>
      </Tab>
      <Tab style={{marginTop: "4.5vh", left: "15.1vw", position: "absolute", backgroundColor: "yellow"}} eventKey="profile" title="Schedules">
        <div style={{backgroundImage: "linear-gradient( 184.1deg,  rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2% )", height: "95.5vh", width: "84vw"}}></div>
      </Tab>
      <Tab style={{marginTop: "4.5vh", left: "15.1vw", position: "absolute", backgroundColor: "lightgreen"}} eventKey="Calendar" title="Calendar">
        <div style={{backgroundImage: "radial-gradient( circle farthest-corner at 10% 20%,  rgba(97,186,255,1) 0%, rgba(166,239,253,1) 90.1% )", height: "95.5vh", width: "84vw"}}>
          {/*<Calendar />*/}
        </div>
      </Tab>
      <Tab style={{marginTop: "4.5vh", left: "15.1vw", position: "absolute", backgroundColor: "burlywood"}} eventKey="progress" title="Project Progress">
        <div className="d-flex flex-row justify-content-around pt-5 pb-5" style={{backgroundImage: "linear-gradient( 90.5deg,  rgba(255,207,139,1) 1.1%, rgba(255,207,139,0.5) 81.3% )", height: "95.5vh", width: "84vw"}}>
          <DisplayProjectCard />
        </div>
      </Tab>
    </Tabs>
  );
}

export default JustifiedExample;