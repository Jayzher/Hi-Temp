import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../userContext';

export default function GetReports({ onReportSelect }) {
  const [reports, setReports] = useState([]); // State variable to store reports
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchReports(); // Fetch reports data
  }, [user, onReportSelect]); // Update the effect dependencies

  const fetchReports = () => {
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
        setReports(data); // Update state with fetched reports data
      })
      .catch(error => {
        console.error("Error fetching reports:", error);
      });
  };

  const handleReportClick = (report) => {
    if (typeof onReportSelect === 'function') {
      console.log("onReportSelect:", onReportSelect);
      onReportSelect(report); // Pass selected report data back to the parent component if onReportSelect is a function
    } else {
      console.error("onReportSelect is not a function");
    }
  };

  return (
    <div>
      {reports.map(report => (
        <button key={report._id} onClick={() => handleReportClick(report)}>
          {new Date(report.createdOn).toLocaleString()}
        </button>
      ))}
    </div>
  );
}
