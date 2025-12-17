import { useState, useEffect } from "react";
import api from "../../api";
import Sidebar from "./Sidebar";
import "./reportDashboard.css";

function ReportDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/reports/list/");
      setReports(res.data);
    } catch (error) {
      console.log("Fetching reports error", error);
    }
  };

  const generateReport = async (type) => {
    setLoading(true);
    try {
      let url = "";

      if (type === "daily") {
        url = `/api/reports/daily/?date=${selectedDate}`;
      }
      if (type === "monthly") {
        url = `/api/reports/monthly/?date=${selectedDate}`;
      }
      if (type === "books") url = "/api/reports/popular-books/";
      if (type === "members") url = "/api/reports/active-members/";

      await api.get(url);
      fetchReports();
    } catch (error) {
      console.log("Generate report error", error);
    }
    setLoading(false);
  };

  const deleteReport = async (id) => {
    try {
      await api.delete(`/api/reports/delete/${id}/`);
      fetchReports();
    } catch (error) {
      console.log("Delete report error", error);
    }
  };

  const exportCSV = (id) => {
    window.open(
      `http://127.0.0.1:8000/api/reports/export/csv/${id}/`,
      "_blank"
    );
  };

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="report-content">
        <h2 className="page-title">📊 Reports & Analytics</h2>

        <div className="date-filter">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="report-actions">
          <button onClick={() => generateReport("daily")}>
            Daily Report
          </button>
          <button onClick={() => generateReport("monthly")}>
            Monthly Report
          </button>
          <button onClick={() => generateReport("books")}>
            Book Popularity
          </button>
          <button onClick={() => generateReport("members")}>
            Active Members
          </button>
        </div>

        {loading && <p className="loading-text">Generating report...</p>}

        <div className="card">
          <h3>Generated Reports</h3>

          {reports.length === 0 ? (
            <p>No reports generated yet</p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.title}</td>
                    <td>{r.report_type}</td>
                    <td>{r.date}</td>
                    <td className="action-buttons">
                      <button
                        className="btn csv"
                        onClick={() => exportCSV(r.id)}
                      >
                        CSV
                      </button>
                      <button
                        className="btn delete"
                        onClick={() => deleteReport(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportDashboard;
