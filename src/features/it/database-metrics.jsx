import React, { useState, useEffect } from "react";
import { 
  Database, 
  HardDrive, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  Server,
  Layers
} from "lucide-react";
import ItSidebar from "../../components/it-sidebar.jsx";
import Header from "../../components/Header.jsx";
import "./database-metrics.css";

export default function DatabaseMetrics({ onLogout, user }) {
  const [isVacuuming, setIsVacuuming] = useState(false);
  const [lastVacuumTime, setLastVacuumTime] = useState("Just now");
  
  // Dynamic State
  const [metrics, setMetrics] = useState({
    activeConnections: 0,
    maxConnections: 100,
    totalStorage: 'Calculating...',
    tables: []
  });

  const fetchMetrics = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/database/metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Failed to load database metrics", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRunVacuum = async () => {
    setIsVacuuming(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      // Hits the simulated IT Danger Zone endpoint we created in server.js earlier!
      const response = await fetch(`${apiUrl}/api/system-action/vacuum`, { method: 'POST' });
      
      if (response.ok) {
        setLastVacuumTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        fetchMetrics(); // Refresh data after vacuum
      }
    } catch (error) {
      console.error("Vacuum failed", error);
    } finally {
      setIsVacuuming(false);
    }
  };

  return (
    <div className="dbm-container">
      {/* SIDEBAR */}
      <ItSidebar user={user} />

      {/* MAIN CONTENT AREA */}
      <main className="dbm-main-content fade-in-up">
        
        {/* STANDARDIZED HEADER BLOCK */}
        <header className="tr-header">
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* METRICS & QUICK ACTIONS ROW */}
        <div className="dbm-stat-row">
          <div className="dbm-stat-card">
            <div className="dbm-stat-icon-box maroon">
              <Activity size={22} />
            </div>
            <div className="dbm-stat-info">
              <span className="dbm-stat-label">ACTIVE CONNECTIONS</span>
              <span className="dbm-stat-value">{metrics.activeConnections} / {metrics.maxConnections}</span>
              <span className="dbm-stat-sub">Current connection pool usage</span>
            </div>
          </div>

          <div className="dbm-stat-card">
            <div className="dbm-stat-icon-box green">
              <HardDrive size={22} />
            </div>
            <div className="dbm-stat-info">
              <span className="dbm-stat-label">TOTAL STORAGE</span>
              <span className="dbm-stat-value">{metrics.totalStorage}</span>
              <span className="dbm-stat-sub">Allocated data + index files</span>
            </div>
          </div>

          <div className="dbm-stat-card action-card">
            <button 
              className={`dbm-action-btn ${isVacuuming ? "loading" : ""}`}
              onClick={handleRunVacuum}
              disabled={isVacuuming}
            >
              <RefreshCw size={18} className={isVacuuming ? "spin" : ""} />
              <span>{isVacuuming ? "Vacuuming DB..." : "Run Maintenance Vacuum"}</span>
            </button>
            <span className="dbm-action-subtext">
              Last executed: <strong>{lastVacuumTime}</strong>
            </span>
          </div>
        </div>

        {/* SCHEMA TABLES CONTAINER */}
        <div className="dbm-card">
          <div className="dbm-card-header">
            <div className="dbm-header-title-group">
              <Database size={18} />
              <span>Top Schema Tables by Size</span>
            </div>
            <div className="dbm-header-badge-tag">
              <Server size={14} /> PostgreSQL Production
            </div>
          </div>

          <div className="dbm-card-body">
            <div className="dbm-table-wrapper">
              <table className="dbm-table">
                <thead>
                  <tr>
                    <th>Table Name</th>
                    <th>Estimated Row Count</th>
                    <th>Total Size</th>
                    <th>Index Bloat</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.tables.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        Loading table schema metrics...
                      </td>
                    </tr>
                  ) : (
                    metrics.tables.map((tbl, index) => (
                      <tr key={index}>
                        <td className="dbm-table-name">
                          <Layers size={15} className="dbm-table-icon" />
                          <code>{tbl.name}</code>
                        </td>
                        <td className="dbm-numeric-cell">{Number(tbl.rows).toLocaleString()}</td>
                        <td className="dbm-size-cell">{tbl.size}</td>
                        <td className="dbm-bloat-cell">{tbl.bloat}</td>
                        <td className="text-center">
                          <span className="dbm-status-badge healthy">
                            <CheckCircle2 size={13} /> {tbl.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}