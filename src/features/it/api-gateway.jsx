import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Search, 
  Clock, 
  AlertCircle, 
  Activity, 
  Zap, 
  CheckCircle2, 
  ShieldAlert
} from "lucide-react";
import ItSidebar from "../../components/it-sidebar.jsx";
import Header from "../../components/Header.jsx";
import "./api-gateway.css";

const INITIAL_LOGS = [
  { id: 1, time: "14:02:11", method: "GET", endpoint: "/api/employee/leave-balance", status: 200, latency: "45ms" },
  { id: 2, time: "14:01:55", method: "POST", endpoint: "/api/ml/forecast/workforce", status: 200, latency: "820ms" },
  { id: 3, time: "14:01:12", method: "POST", endpoint: "/api/ml/anomaly-detect", status: 200, latency: "1.2s" },
  { id: 4, time: "13:59:44", method: "PUT", endpoint: "/api/profile/update", status: 403, latency: "12ms" },
  { id: 5, time: "13:55:10", method: "GET", endpoint: "/api/reports/department/D02", status: 200, latency: "110ms" },
  { id: 6, time: "13:50:22", method: "DELETE", endpoint: "/api/admin/cache", status: 200, latency: "85ms" },
];

export default function ApiGateway({ onLogout, user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [liveLogs, setLiveLogs] = useState(INITIAL_LOGS);

  // Simulate real-time API Gateway traffic every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLogs(prevLogs => {
        const endpoints = [
          "/api/leave-applications/department", 
          "/api/employees", 
          "/api/attendance/summary", 
          "/api/login", 
          "/api/departments"
        ];
        const methods = ["GET", "POST", "PUT"];
        const statuses = [200, 200, 200, 200, 201, 401, 500, 403, 404]; // Weighted for success
        
        const now = new Date();
        const newLog = {
          id: Date.now(),
          time: now.toLocaleTimeString('en-GB', { hour12: false }), // HH:MM:SS format
          method: methods[Math.floor(Math.random() * methods.length)],
          endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          latency: `${Math.floor(Math.random() * 150) + 15}ms`
        };
        
        // Keep only the 15 most recent logs to prevent memory bloat
        return [newLog, ...prevLogs].slice(0, 15);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = liveLogs.filter((log) =>
    log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toString().includes(searchTerm)
  );

  const totalRequests = liveLogs.length;
  // Guard against division by zero just in case
  const successRate = totalRequests > 0 
    ? ((liveLogs.filter(l => l.status === 200 || l.status === 201).length / totalRequests) * 100).toFixed(0) 
    : 0;
  
  // Calculate a dynamic average latency from the live data
  const avgLatencyMs = liveLogs.reduce((acc, log) => {
    let ms = parseInt(log.latency);
    if (log.latency.includes('s') && !log.latency.includes('ms')) ms *= 1000;
    return acc + ms;
  }, 0) / (totalRequests || 1);

  return (
    <div className="apig-container">
      {/* SIDEBAR */}
      <ItSidebar user={user} />

      {/* MAIN CONTENT AREA */}
      <main className="apig-main-content fade-in-up">
        
        {/* STANDARDIZED HEADER BLOCK */}
        <header className="tr-header">
          <div className="tr-header-title">
            <span className="tr-header-badge">
              <span className="tr-badge-dot"></span> IT OPERATIONS PORTAL
            </span>
            <h2>
              <span className="tr-title-dark">API Gateway </span>
              <span className="tr-title-maroon">Traffic Log</span>
            </h2>
          </div>

          <Header user={user} onLogout={onLogout} />
        </header>

        {/* METRICS ROW */}
        <div className="apig-stat-row">
          <div className="apig-stat-card">
            <div className="apig-stat-icon-box maroon">
              <Activity size={20} />
            </div>
            <div className="apig-stat-info">
              <span className="apig-stat-label">TOTAL TRAFFIC</span>
              <span className="apig-stat-value">{totalRequests} Req/min</span>
              <span className="apig-stat-sub">Active gateway connections</span>
            </div>
          </div>

          <div className="apig-stat-card">
            <div className="apig-stat-icon-box green">
              <CheckCircle2 size={20} />
            </div>
            <div className="apig-stat-info">
              <span className="apig-stat-label">SUCCESS RATE</span>
              <span className="apig-stat-value">{successRate}%</span>
              <span className="apig-stat-sub">HTTP 200 OK Status</span>
            </div>
          </div>

          <div className="apig-stat-card">
            <div className="apig-stat-icon-box amber">
              <Zap size={20} />
            </div>
            <div className="apig-stat-info">
              <span className="apig-stat-label">AVG LATENCY</span>
              <span className="apig-stat-value">{Math.round(avgLatencyMs)}ms</span>
              <span className="apig-stat-sub">Across all endpoints</span>
            </div>
          </div>
        </div>

        {/* UTILITY SEARCH BAR */}
        <div className="apig-utilities-row">
          <div className="apig-search-wrapper">
            <Search size={18} className="apig-search-icon" />
            <input
              type="text"
              className="apig-search-input"
              placeholder="Search endpoint path, method, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="apig-refresh-pill">
            <Clock size={16} className="spin-slow" />
            <span>Auto-refreshing every <strong>5s</strong></span>
          </div>
        </div>

        {/* TRAFFIC TABLE CARD */}
        <div className="apig-card">
          <div className="apig-card-header">
            <div className="apig-header-title-group">
              <Terminal size={18} />
              <span>Live Traffic Monitor</span>
            </div>
            <span className="apig-active-count">
              Showing {filteredLogs.length} of {totalRequests} events
            </span>
          </div>

          <div className="apig-card-body">
            {filteredLogs.length === 0 ? (
              <div className="apig-empty-state">
                <ShieldAlert size={32} />
                <p>No endpoint logs matching standard search query "{searchTerm}"</p>
              </div>
            ) : (
              <div className="apig-table-wrapper">
                <table className="apig-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Method</th>
                      <th>Endpoint Path</th>
                      <th>Response Code</th>
                      <th>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="apig-time-cell">{log.time}</td>
                        <td>
                          <span className={`apig-method-badge ${log.method.toLowerCase()}`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="apig-endpoint-cell">{log.endpoint}</td>
                        <td>
                          <span className={`apig-status-pill ${log.status === 200 || log.status === 201 ? "success" : "error"}`}>
                            {log.status}
                            {log.status !== 200 && log.status !== 201 && <AlertCircle size={14} />}
                          </span>
                        </td>
                        <td>
                          <span className={`apig-latency-text ${log.latency.includes("s") && !log.latency.includes("ms") ? "slow" : ""}`}>
                            {log.latency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}