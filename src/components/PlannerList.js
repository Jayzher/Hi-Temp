import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext';
import { Button } from 'react-bootstrap';

export default function PlannerList() {
  const [reportList, setReportList] = useState([]);
  const [reportData, setReportData] = useState({
    Monday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
    Tuesday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
    Wednesday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
    Thursday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
    Friday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' }
  });

  const [disable, setDisable] = useState(false);
  const [disable2, setDisable2] = useState(false);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    getReportList();
  }, [user]);

   useEffect(() => {
    const isEmpty = Object.values(reportData).some(day => Object.values(day).some(value => value === ''));
    setDisable2(isEmpty);
  }, []);

  const getWeekDates = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1));

    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      weekDates.push({
        date: currentDate.toISOString().slice(0, 10),
        day: currentDate.toLocaleString('en-us', { weekday: 'long' })
      });
    }
    return weekDates;
  };

  const weekDates = getWeekDates();

  const handleChange = (value, day, field) => {
    setReportData(prevReportData => ({
      ...prevReportData,
      [day]: {
        ...prevReportData[day],
        [field]: value
      }
    }));
  };

    useEffect(() => {
      weekDays.forEach((day, index) => {
        console.log(`${day} - ${weekDates[index].date}`);
        const Reportdate = weekDates[index].date;
        handleChange(Reportdate, day, "Date");
      });
    }, [user])
 

  function getReportList() {
    fetch(`${process.env.REACT_APP_API_URL}/report/MyReports`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee: user.name
      })
    })
    .then(res => res.json())
    .then(data => {
      setReportList(data);
    })
    .catch(error => {
      console.error("Error fetching reports:", error);
    });
  }

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const generateReport = () => {
    // Add the Date field to each report object
    const reportDataWithDate = weekDays.map(day => ({
      ...reportData[day],
      Date: reportData[day].Date // Assuming Date is already properly set in reportData
    }));

    fetch(`${process.env.REACT_APP_API_URL}/report/generateReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(reportDataWithDate) // Send the modified reportData with Date field included
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Report created:', data);
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
    navigate("/Planner");
  };


  function log() {
    console.log(reportData);
  }

  function FindByDate(date) {
    const selectedReport = reportList.find(item => item.createdOn === date);
    if (selectedReport) {
      const newReportData = {
        Monday: {},
        Tuesday: {},
        Wednesday: {},
        Thursday: {},
        Friday: {}
      };

      selectedReport.reports.forEach(report => {
        newReportData[report.day] = report.details;
      });

      setReportData(newReportData);
    } else {
      console.error("Report not found for date:", date);
    }
    setDisable(true);
  }

  function formattedDate(date, includeTime = false) {
    // Adjust to Philippines Standard Time (UTC+8)
    date.setHours(date.getHours());

    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let day = date.getDate();
    day = day < 10 ? '0' + day : day;
    let year = date.getFullYear();

    let formattedDate = month + '-' + day + '-' + year;

    if (includeTime) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Handle midnight (0 hours)
      minutes = minutes < 10 ? '0' + minutes : minutes;
      let timeString = hours + ':' + minutes + ' ' + ampm;
      formattedDate += ' ' + timeString;
    }
    return formattedDate;
  }

  function resetReportData() {
    setReportData({
      Monday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
      Tuesday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
      Wednesday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
      Thursday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
      Friday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' }
    });
    setDisable(false);
  }

  return (
    <div className="d-flex flex-column justify-content-center" style={{height: "fit-content", overflowY: "auto", overflowX: "hidden"}}>
      <div className="me-5 mt-2 d-flex justify-content-center" style={{ border: "2px solid black", width: "100%", height: "70vh"}}>
        <table style={{ width: '84.5vw', borderCollapse: 'collapse', height: "100%", tableLayout: "fixed" }} cellSpacing="0">
          <tbody>
            <tr style={{ height: '5pt' }}>
              <HeaderCell text="Date" />
              <HeaderCell text="Day" />
              <HeaderCell text="Customer" />
              <HeaderCell text="Product" />
              <HeaderCell text="Remarks" />
              <HeaderCell text="Amount" />
            </tr>
            {weekDays.map((day, index) => (
              <tr key={day}>
                <td className="data-cell text-center" style={{border: "solid 1px black"}}>{reportData[day]?.Date }</td>
                <td className="data-cell text-center" style={{border: "solid 1px black"}}>{weekDates[index].day}</td>         
                <td className="data-cell pt-1" style={{border: "solid 1px black"}}>
                  <textarea value={reportData[day]?.Customer || ''} onChange={e => handleChange(e.target.value, day, "Customer")} style={{ width: '100%', height: '100%', border: 'none', outline: 'none', textAlign: 'center' }}/>
                </td>
                <td className="data-cell pt-1" style={{border: "solid 1px black"}}>
                  <textarea value={reportData[day]?.Product || ''} onChange={e => handleChange(e.target.value, day, "Product")} style={{ width: '100%', height: '100%', border: 'none', outline: 'none', textAlign: 'center' }}/>
                </td>
                <td className="data-cell pt-1" style={{border: "solid 1px black"}}>
                  <textarea value={reportData[day]?.Remarks || ''} onChange={e => handleChange(e.target.value, day, "Remarks")} style={{ width: '100%', height: '100%', border: 'none', outline: 'none', textAlign: 'center' }}/>
                </td>
                <td className="data-cell pt-1" style={{border: "solid 1px black"}}>
                  <textarea value={reportData[day]?.Amount || ''} onChange={e => handleChange(e.target.value, day, "Amount")} style={{ width: '100%', height: '100%', border: 'none', outline: 'none', textAlign: 'center' }}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-row justify-content-around mt-3" style={{height: "fit-content", width: "85vw", flexWrap: "wrap"}}>
      {reportList.map(item => {
        console.log(item.reports[0].details); // Log the item here
        return (
          <div className="mb-2">
            <Button key={item._id} onClick={() => FindByDate(item.createdOn)}>
              {`${item.reports[0].details.Date} - ${item.reports[4].details.Date}`}
            </Button>
          </div>
        );
      })}
      </div>
      <div className="d-flex justify-content-center mt-3">
        <Button className="ps-2 pe-2 pt-2 pb-2 me-5" onClick={generateReport} /*disabled={(disable || disable2)}*/>Generate Report</Button>
        <Button className="ps-2 pe-2 pt-2 pb-2" style={{width: "10vw"}} onClick={resetReportData}>Reset</Button>
      </div>
    </div>
  );
}

const HeaderCell = ({ text }) => (
  <td style={{ width: '20%', border: '1px solid black', backgroundColor: '#FF0000', marginBottom: '0', textAlign: 'center' }}>
    <p style={{ paddingTop: '1pt', paddingLeft: '1pt', fontSize: '15px', fontWeight: 'bold', marginBottom: '0' }}>{text}</p>
  </td>
);
