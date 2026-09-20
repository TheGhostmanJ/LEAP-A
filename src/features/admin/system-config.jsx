import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Server, 
  Database, 
  Shield, 
  Terminal, 
  RefreshCw, 
  Settings,
  CheckCircle2,
  Cpu,
  Activity
} from "lucide-react";
import ItSidebar from "../../components/it-sidebar.jsx";
import Header from "../../components/Header.jsx";
import "./system-config.css";

export default function SystemConfig({ onLogout, user }) {
  const navigate = useNavigate();
  const [cacheStatus, setCacheStatus] = useState("idle"); // idle | executing | success
  const [syncStatus, setSyncStatus] = useState("idle");   // idle | executing | success

  // Live Metrics State
  const [metrics, setMetrics] = useState({
    dbStatus: "Checking...",
    activeConnections: "-",
    uptime: "99.9%" // Simulated 30-day uptime
  });

  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        // Concurrently check the basic health endpoint and detailed DB metrics
        const [healthRes, dbRes] = await Promise.all([
          fetch(`${apiUrl}/api/health`),
          fetch(`${apiUrl}/api/database/metrics`)
        ]);

        const dbStatus = healthRes.ok ? "Online" : "Offline";
        const dbData = dbRes.ok ? await dbRes.json() : { activeConnections: 0 };

        setMetrics(prev => ({
          ...prev,
          dbStatus,
          activeConnections: dbData.activeConnections || 0
        }));
      } catch (error) {
        console.error("Failed to fetch system metrics:", error);
        setMetrics(prev => ({ ...prev, dbStatus: "Offline", activeConnections: 0 }));
      }
    };

    fetchSystemMetrics();
    
    // Auto-refresh metrics every 10 seconds
    const interval = setInterval(fetchSystemMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    setCacheStatus("executing");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/api/system-action/cache`, { method: 'POST' });
      setCacheStatus("success");
    } catch (error) {
      console.error("Failed to clear cache:", error);
    } finally {
      setTimeout(() => setCacheStatus("idle"), 2500);
    }
  };

  const handleSyncModels = async () => {
    setSyncStatus("executing");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/api/system-action/sync`, { method: 'POST' });
      setSyncStatus("success");
    } catch (error) {
      console.error("Failed to sync models:", error);
    } finally {
      setTimeout(() => setSyncStatus("idle"), 2500);
    }
  };

  return (
    <div className="sysconfig-container">
      {/* SIDEBAR */}
      <ItSidebar user={user} />

      {/* MAIN CONTENT AREA */}
      <main className="sysconfig-main-content fade-in-up">
        
        {/* STANDARDIZED HEADER BLOCK */}
        <header className="tr-header">
          <Header user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* METRICS ROW */}
        <div className="sysconfig-stat-row">
          <div className="sysconfig-stat-card">
            <div className="sysconfig-stat-icon-box green">
              <Database size={22} />
            </div>
            <div className="sysconfig-stat-info">
              <span className="sysconfig-stat-label">DATABASE STATUS</span>
              <span className={`sysconfig-stat-value ${metrics.dbStatus === 'Online' ? 'text-green' : ''}`}>
                {metrics.dbStatus}
              </span>
              <span className="sysconfig-stat-sub">PostgreSQL Engine</span>
            </div>
          </div>

          <div className="sysconfig-stat-card">
            <div className="sysconfig-stat-icon-box maroon">
              <Terminal size={22} />
            </div>
            <div className="sysconfig-stat-info">
              <span className="sysconfig-stat-label">API GATEWAY</span>
              <span className="sysconfig-stat-value">{metrics.activeConnections}</span>
              <span className="sysconfig-stat-sub">Active concurrent connections</span>
            </div>
          </div>

          <div className="sysconfig-stat-card">
            <div className="sysconfig-stat-icon-box blue">
              <Cpu size={22} />
            </div>
            <div className="sysconfig-stat-info">
              <span className="sysconfig-stat-label">SYSTEM HEALTH</span>
              <span className="sysconfig-stat-value">{metrics.uptime}</span>
              <span className="sysconfig-stat-sub">Uptime (Last 30 Days)</span>
            </div>
          </div>
        </div>

        {/* MAIN IT TOOLS GRID */}
        <div className="sysconfig-grid-split">
          
          {/* Left Column: Access Control Quick Actions */}
          <div className="sysconfig-card">
            <div className="sysconfig-card-header">
              <div className="sysconfig-header-title-group">
                <Shield size={18} />
                <span>Role Management & Access Control (RBAC)</span>
              </div>
            </div>

            <div className="sysconfig-card-body sysconfig-padded-box">
              <p className="sysconfig-description">
                Manage system access level variables, permissions, and security roles for City personnel accounts across all departments.
              </p>

              <div className="sysconfig-actions-group">
                {/* REMOVED "Audit User Roles" button, kept only Configure Permissions */}
                <button 
                  className="sysconfig-btn-secondary"
                  onClick={() => navigate('/role-management')}
                >
                  <Settings size={16} /> Configure Permissions
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Maintenance Tasks */}
          <div className="sysconfig-card">
            <div className="sysconfig-card-header">
              <div className="sysconfig-header-title-group">
                <Activity size={18} />
                <span>System Maintenance & Operations</span>
              </div>
            </div>

            <div className="sysconfig-card-body">
              <ul className="sysconfig-task-list">
                <li className="sysconfig-task-item">
                  <div className="sysconfig-task-info">
                    <RefreshCw size={20} className="sysconfig-task-icon" />
                    <div>
                      <span className="sysconfig-task-title">Clear Server Cache</span>
                      <span className="sysconfig-task-sub">Flush application runtime memory</span>
                    </div>
                  </div>
                  <button 
                    className={`sysconfig-action-btn ${cacheStatus}`}
                    onClick={handleClearCache}
                    disabled={cacheStatus !== "idle"}
                  >
                    {cacheStatus === "executing" && <RefreshCw size={14} className="spin" />}
                    {cacheStatus === "success" && <CheckCircle2 size={14} />}
                    {cacheStatus === "idle" ? "Execute" : cacheStatus === "executing" ? "Clearing..." : "Cleared"}
                  </button>
                </li>

                <li className="sysconfig-task-item">
                  <div className="sysconfig-task-info">
                    <Server size={20} className="sysconfig-task-icon" />
                    <div>
                      <span className="sysconfig-task-title">Sync Machine Learning Models</span>
                      <span className="sysconfig-task-sub">Re-index predictive analytics pipeline</span>
                    </div>
                  </div>
                  <button 
                    className={`sysconfig-action-btn ${syncStatus}`}
                    onClick={handleSyncModels}
                    disabled={syncStatus !== "idle"}
                  >
                    {syncStatus === "executing" && <RefreshCw size={14} className="spin" />}
                    {syncStatus === "success" && <CheckCircle2 size={14} />}
                    {syncStatus === "idle" ? "Sync Data" : syncStatus === "executing" ? "Syncing..." : "Synced"}
                  </button>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}