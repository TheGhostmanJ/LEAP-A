import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // RESTORED: Required for button routing
import { 
  Server, 
  Database, 
  Shield, 
  Terminal, 
  Users, 
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
  const navigate = useNavigate(); // RESTORED: Initialize navigation
  const [cacheStatus, setCacheStatus] = useState("idle"); // idle | executing | success
  const [syncStatus, setSyncStatus] = useState("idle");   // idle | executing | success

  const handleClearCache = () => {
    setCacheStatus("executing");
    setTimeout(() => {
      setCacheStatus("success");
      setTimeout(() => setCacheStatus("idle"), 2500);
    }, 1200);
  };

  const handleSyncModels = () => {
    setSyncStatus("executing");
    setTimeout(() => {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2500);
    }, 1500);
  };

  return (
    <div className="sysconfig-container">
      {/* SIDEBAR */}
      <ItSidebar user={user} />

      {/* MAIN CONTENT AREA */}
      <main className="sysconfig-main-content fade-in-up">
        
        {/* STANDARDIZED HEADER BLOCK */}
        {/* Notice how we just pass the Header now! Our global Header.jsx automatically draws the title based on the route. */}
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
              <span className="sysconfig-stat-value text-green">Online</span>
              <span className="sysconfig-stat-sub">PostgreSQL 14.0 Engine</span>
            </div>
          </div>

          <div className="sysconfig-stat-card">
            <div className="sysconfig-stat-icon-box maroon">
              <Terminal size={22} />
            </div>
            <div className="sysconfig-stat-info">
              <span className="sysconfig-stat-label">API GATEWAY</span>
              <span className="sysconfig-stat-value">42</span>
              <span className="sysconfig-stat-sub">Active concurrent connections</span>
            </div>
          </div>

          <div className="sysconfig-stat-card">
            <div className="sysconfig-stat-icon-box blue">
              <Cpu size={22} />
            </div>
            <div className="sysconfig-stat-info">
              <span className="sysconfig-stat-label">SYSTEM HEALTH</span>
              <span className="sysconfig-stat-value">99.9%</span>
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
                Manage system access level variables, permissions, and security roles for Lipa City personnel accounts across all departments.
              </p>

              <div className="sysconfig-actions-group">
                {/* RESTORED: onClick navigation routing */}
                <button 
                  className="sysconfig-btn-primary"
                  onClick={() => navigate('/role-management')}
                >
                  <Users size={16} /> Audit User Roles
                </button>
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
                      <span className="sysconfig-task-sub">Flush Redis application runtime memory</span>
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