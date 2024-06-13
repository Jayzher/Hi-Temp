import React, { useState, useEffect, useContext } from 'react';
import "./Style.css";
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext';
import { Button, Form } from 'react-bootstrap';
import GetAllUsers from './GetAllUsers.js';

export default function PlannerList() {
  const [reportList, setReportList] = useState([]);
  const [reportData, setReportData] = useState({
    Monday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
    Tuesday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
    Wednesday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
    Thursday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' },
    Friday: { Customer: '', Product: '', Remarks: '', Amount: '', Date: '' }
  });
  const [attachment, setAttachment] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [disable, setDisable] = useState(false);
  const [disable2, setDisable2] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role === 'Employee') {
      getReportList(user.name);
    }
  }, [user]);

  useEffect(() => {
    const isEmpty = Object.values(reportData).some(day => Object.values(day).some(value => value === ''));
    setDisable2(isEmpty);
  }, [reportData]);

  useEffect(() => {
    updateReportDataDate();
  }, [user]);

  useEffect(() => {
    // Attach event listeners for focus and blur
    const textareas = document.querySelectorAll('.data-cell textarea');
    textareas.forEach(textarea => {
      textarea.addEventListener('focus', handleFocus);
      textarea.addEventListener('blur', handleBlur);
    });

    return () => {
      // Clean up event listeners
      textareas.forEach(textarea => {
        textarea.removeEventListener('focus', handleFocus);
        textarea.removeEventListener('blur', handleBlur);
      });
    };
  }, [reportData]);

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

  const updateReportDataDate = () => {
    weekDays.forEach((day, index) => {
      const Reportdate = weekDates[index].date;
      handleChange(Reportdate, day, "Date");
    });
  };

  const getReportList = (userName) => {
    fetch(`${process.env.REACT_APP_API_URL}/report/MyReports`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee: userName
      })
    })
    .then(res => res.json())
    .then(data => {
      setReportList(data);
    })
    .catch(error => {
      console.error("Error fetching reports:", error);
    });
  };

  const searchUsers = () => {
    fetch(`${process.env.REACT_APP_API_URL}/users/search`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ searchTerm })
    })
    .then(res => res.json())
    .then(data => {
      setSearchResults(data);
    })
    .catch(error => {
      console.error("Error searching users:", error);
    });
  };

  const handleUserSelect = (userName) => {
    setSelectedUser(userName);
    getReportList(userName);
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const generateReport = () => {
    const reportDataWithDate = weekDays.map(day => ({
      ...reportData[day],
      Date: reportData[day].Date
    }));

    const payload = {
      reportData: reportDataWithDate,
      attachment
    };

    fetch(`${process.env.REACT_APP_API_URL}/report/generateReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
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
    console.log(selectedReport);
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
        console.log(report);
      });

      // Update report data using handleChange function
      Object.keys(newReportData).forEach(day => {
        Object.keys(newReportData[day]).forEach(field => {
          handleChange(newReportData[day][field], day, field);
        });
      });

      setAttachment(selectedReport.attachment || '');
      setAttachmentUrl(selectedReport.attachment || '');
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
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      let timeString = hours + ':' + minutes + ' ' + ampm;
      formattedDate += ' ' + timeString;
    }
    return formattedDate;
  }

  function resetReportData() {
    updateReportDataDate();

    weekDays.forEach(day => {
      handleChange('', day, 'Customer');
      handleChange('', day, 'Product');
      handleChange('', day, 'Remarks');
      handleChange('', day, 'Amount');
    });

    setAttachment('');
    setAttachmentUrl('');
    setDisable(false);
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Upload_Reports');

      fetch(`https://api.cloudinary.com/v1_1/dgzhcuwym/upload`, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        setAttachment(data.secure_url);
        setAttachmentUrl(data.secure_url);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
    }
  };

  const handleFocus = (event) => {
    const row = event.target.closest('tr');
    row.classList.add('enlarged');
  }

  const handleBlur = (event) => {
    const row = event.target.closest('tr');
    row.classList.remove('enlarged');
  }

  return ( 
    <div className="d-flex flex-column justify-content-center bg-container tab-full" style={{ minHeight: "100vh", overflowY: "auto", overflowX: "hidden", backgroundColor: "#f8f9fa"}}>
      {(user.role !== 'Employee') ?
      <>
        <div id="reports-select" className="d-flex flex-row justify-content-around align-items-center mt-4">
          <div className="mt-3 mb-2" style={{ width: "100%" }}>
            <Form.Label className="ms-4 me-4 mb-2">Employee:</Form.Label>
            <Form.Group className="ms-4 me-4 mb-2 d-flex flex-row">
              <Form.Select onChange={e => setSearchTerm(e.target.value)} required>
                <option value="N/A">Select Employee</option>
                <GetAllUsers />
              </Form.Select>
              <Button className="ms-2" onClick={() => handleUserSelect(searchTerm)}>Check</Button>
            </Form.Group>
          </div>
          <div className="d-flex flex-column justify-content-around ms-5 me-5" style={{ height: "fit-content", width: "87%"}}>
            <Form.Label className="me-4 mb-2">Reports:</Form.Label>
            <select onChange={(e) => FindByDate(e.target.value)} className="form-select mb-2">
              <option value="">Select Report</option>
              {reportList.map(item => (
                <option key={item._id} value={item.createdOn}>
                  {`${item.reports[0].details.Date} - ${item.reports[4].details.Date}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </>
      :
        <>
          <div style={{marginTop: "5vh"}} className="d-flex flex-row justify-content-around">
            <div className="d-flex flex-column justify-content-around mt-3 ms-5" style={{ height: "fit-content", width: "60%" }}>
              <Form.Label className="me-4 mb-2">Reports:</Form.Label>
              <select onChange={(e) => FindByDate(e.target.value)} className="form-select mb-2">
                <option value="">Select Report</option>
                {reportList.map(item => (
                  <option key={item._id} value={item.createdOn}>
                    {`${item.reports[0].details.Date} - ${item.reports[4].details.Date}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      }
      <div className="unique-table-container">
        <table className="unique-table" style={{ width: '100%', borderCollapse: 'collapse', height: "100%", tableLayout: "fixed" }} cellSpacing="0">
          <tbody>
            <tr style={{ height: '4pt' }}>
              <HeaderCell text="Date" />
              <HeaderCell text="Day" />
              <HeaderCell text="Customer" />
              <HeaderCell text="Product" />
              <HeaderCell text="Remarks" />
              <HeaderCell text="Amount" />
            </tr>
            {weekDays.map((day, index) => (
              <tr key={day}>
                <td className="data-cell text-center" style={{ border: "solid 1px black" }}>{reportData[day]?.Date}</td>
                <td className="data-cell text-center" style={{ border: "solid 1px black" }}>{weekDates[index].day}</td>
                <td className="data-cell pt-1" style={{ border: "solid 1px black" }}>
                  <textarea value={reportData[day]?.Customer || ''} onChange={e => handleChange(e.target.value, day, "Customer")} style={{ width: '100%', height: '100%', border: 'none', outline: 'none', textAlign: 'center', fontSize: "0.8rem" }} />
                </td>
                <td className="data-cell pt-1" style={{ border: "solid 1px black" }}>
                  <textarea value={reportData[day]?.Product || ''} onChange={e => handleChange(e.target.value, day, "Product")} style={{ width: '100%', height: '100%', border: 'none', outline: 'none', textAlign: 'center', fontSize: "0.8rem" }} />
                </td>
                <td className="data-cell pt-1" style={{ border: "solid 1px black" }}>
                  <textarea value={reportData[day]?.Remarks || ''} onChange={e => handleChange(e.target.value, day, "Remarks")} style={{ width: '100%', height: '100%', border: 'none', outline: 'none', textAlign: 'center', fontSize: "0.8rem" }} />
                </td>
                <td className="data-cell pt-1" style={{ border: "solid 1px black" }}>
                  <textarea value={reportData[day]?.Amount || ''} onChange={e => handleChange(e.target.value, day, "Amount")} style={{ width: '100%', height: '100%', border: 'none', outline: 'none', textAlign: 'center', fontSize: "0.8rem" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user.role === "Employee" && (
        <div className="d-flex justify-content-center mt-3" style={{ width: "fit-content" }}>
          <input type="file" onChange={handleFileChange} style={{ marginBottom: '10px' }} />
        </div>
      )}
      <div className="d-flex justify-content-center mt-3 mb-5">
        <div id="attachment-link" className="mt-3 d-flex ms-4" style={{marginRight: "auto"}}>
          <p className="me-2" >File Uploaded:</p>
          <a href={attachmentUrl} target="_blank" style={{ textAlign: "center", whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word" }}>{attachmentUrl}</a>
        </div>
      </div>
      {user.role === "Employee" && (
        <div className="d-flex justify-content-center mt-3 mb-5">
          <div id="report-buttons" style={{width: "20vw"}} className="d-flex flex-column justify-content-center mt-3 mb-5">
            <Button className="ps-2 pe-2 pt-2 pb-2 mb-3" onClick={generateReport} disabled={disable || disable2}>Generate Report</Button>
            <Button className="ps-2 pe-2 pt-2 pb-2" onClick={resetReportData}>Reset</Button>
          </div>
        </div>
      )}
    </div>
  );
}

const HeaderCell = ({ text }) => (
  <td style={{ width: '20%', border: '1px solid black', backgroundColor: '#FF0000', marginBottom: '0', textAlign: 'center' }}>
    <p style={{ paddingTop: '1pt', paddingLeft: '1pt', fontSize: '15px', fontWeight: 'bold', marginBottom: '0' }}>{text}</p>
  </td>
);
