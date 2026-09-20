import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ServerCrash, 
  Key, 
  Sliders, 
  ShieldAlert, 
  Shield,
  Activity, 
  Cpu, 
  Database, 
  Lock,
  RefreshCw,
  CheckCircle2,
  Settings,
  Save
} from "lucide-react";
import ItSidebar from "../../components/it-sidebar.jsx";
import Header from "../../components/Header.jsx";
import "./system-settings.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function SystemSettings({ onLogout, user }) {
  const navigate = useNavigate();
  
  // Form States
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [mlInterval, setMlInterval] = useState('24');
  const [auditLogs, setAuditLogs] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Loading & Health States
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState("Checking...");
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | executing | success
  
  // Danger Zone States
  const [rotateStatus, setRotateStatus] = useState('idle');
  const [restartStatus, setRestartStatus] = useState('idle');
  const [flushStatus, setFlushStatus] = useState('idle');
  const [cacheStatus, setCacheStatus] = useState('idle');
  const [syncStatus, setSyncStatus] = useState('idle');

  // Load Initial Settings & System Health
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [settingsRes, healthRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/system-settings`),
          fetch(`${API_BASE_URL}/api/health`)
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setMaintenanceMode(data.maintenance_mode === 'true');
          setMlInterval(data.ml_interval || '24');
          setSessionTimeout(data.session_timeout || '30');
          setAuditLogs(data.audit_logs === 'true');
        }

        if (healthRes.ok) {
          setSystemHealth("99.98% Operational");
        } else {
          setSystemHealth("System Degraded");
        }
      } catch (error) {
        console.error("Failed to fetch system data", error);
        setSystemHealth("Offline");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle Save Configuration
  const handleSaveSettings = async () => {
    setSaveStatus('executing');
    try {
      const response = await fetch(`${API_BASE_URL}/api/system-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenance_mode: maintenanceMode.toString(),
          ml_interval: mlInterval,
          session_timeout: sessionTimeout,
          audit_logs: auditLogs.toString(),
          updated_by: user?.employee_key
        })
      });
      
      if (!response.ok) throw new Error("Failed to save settings");
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (error) {
      alert("Error saving settings.");
      setSaveStatus('idle');
    }
  };

  // Automated Danger Zone / Maintenance Handlers
  const handleSystemAction = async (actionName, stateSetter) => {
    const isDangerZone = ['rotate', 'restart', 'flush'].includes(actionName);
    
    if (isDangerZone) {
      if (!window.confirm(`Are you absolutely sure you want to execute [${actionName.toUpperCase()}]? This action may disrupt active users.`)) return;
    }
    
    stateSetter('executing');
    try {
      await fetch(`${API_BASE_URL}/api/system-action/${actionName}`, { method: 'POST' });
      stateSetter('success');
      setTimeout(() => stateSetter('idle'), 3000);
    } catch {
      alert(`Failed to execute ${actionName}`);
      stateSetter('idle');
    }
  };

  return (
    <div className="sys-container">
      <ItSidebar user={user} />

      <main className="sys-main-content fade-in-up">
        {/* STANDARDIZED HEADER BLOCK */}
        <header className="tr-header">
          <Header user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* SYSTEM STATUS STAT CARDS */}
        <section className="sys-metrics-row">
          <div className="sys-metric-card">
            <div className="sys-metric-icon-box maroon">
              <Activity size={18} />
            </div>
            <div className="sys-metric-info">
              <span className="sys-metric-label">SYSTEM HEALTH</span>
              <span className={`sys-metric-value ${systemHealth.includes('Operational') ? 'green' : 'text-danger'}`}>
                {systemHealth}
              </span>
            </div>
          </div>

          <div className="sys-metric-card">
            <div className="sys-metric-icon-box amber">
              <Cpu size={18} />
            </div>
            <div className="sys-metric-info">
              <span className="sys-metric-label">ML ANALYTICS ENGINE</span>
              <span className="sys-metric-value">Active (Sync: {mlInterval}h)</span>
            </div>
          </div>

          <div className="sys-metric-card">
            <div className="sys-metric-icon-box gray">
              <Database size={18} />
            </div>
            <div className="sys-metric-info">
              <span className="sys-metric-label">DB ACCESS MODE</span>
              <span className="sys-metric-value">{maintenanceMode ? 'Restricted (Maint.)' : 'Normal (Read/Write)'}</span>
            </div>
          </div>
        </section>

        {/* MAIN CONFIGURATION GRID */}
        {isLoading ? (
           <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
             <RefreshCw className="spin" size={24} style={{ marginBottom: '12px' }}/>
             <p>Loading System Configurations...</p>
           </div>
        ) : (
          <div className="sys-grid-split">
            
            {/* Left Column: Core Application Settings */}
            <div className="sys-column-left">
              <div className="sys-card sys-card-shadow">
                <div className="sys-card-header-maroon">
                  <Sliders size={16} /> Core HR Application Settings
                </div>

                <div className="sys-card-body">
                  
                  {/* Maintenance Mode Toggle */}
                  <div className="sys-setting-row">
                    <div className="sys-setting-meta">
                      <label className="sys-form-label">System Maintenance Mode</label>
                      <span className="sys-form-hint">
                        Locks out non-administrative HR personnel while system migrations occur.
                      </span>
                    </div>
                    <div className="sys-toggle-wrapper">
                      <span className={`sys-status-pill ${maintenanceMode ? 'active' : 'inactive'}`}>
                        {maintenanceMode ? 'Enabled' : 'Disabled'}
                      </span>
                      <button 
                        className={`sys-toggle-btn ${maintenanceMode ? 'checked' : ''}`}
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                      >
                        <span className="sys-toggle-thumb"></span>
                      </button>
                    </div>
                  </div>

                  {/* ML Interval Select */}
                  <div className="sys-setting-row">
                    <div className="sys-setting-meta">
                      <label className="sys-form-label">ML Analytics Sync Interval</label>
                      <span className="sys-form-hint">
                        Determines how frequently machine learning forecasting updates HR turnover models.
                      </span>
                    </div>
                    <select 
                      value={mlInterval} 
                      onChange={(e) => setMlInterval(e.target.value)}
                      className="sys-select-input"
                    >
                      <option value="12">Every 12 Hours</option>
                      <option value="24">Every 24 Hours (Recommended)</option>
                      <option value="48">Every 48 Hours</option>
                    </select>
                  </div>

                  {/* Session Timeout */}
                  <div className="sys-setting-row">
                    <div className="sys-setting-meta">
                      <label className="sys-form-label">Idle Session Timeout</label>
                      <span className="sys-form-hint">
                        Automatically signs out inactive accounts to maintain data compliance.
                      </span>
                    </div>
                    <select 
                      value={sessionTimeout} 
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="sys-select-input"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">60 Minutes</option>
                    </select>
                  </div>

                  {/* Audit Logging */}
                  <div className="sys-setting-row">
                    <div className="sys-setting-meta">
                      <label className="sys-form-label">Detailed Audit Logging</label>
                      <span className="sys-form-hint">
                        Track user permission modifications and HR profile updates.
                      </span>
                    </div>
                    <div className="sys-toggle-wrapper">
                      <button 
                        className={`sys-toggle-btn ${auditLogs ? 'checked' : ''}`}
                        onClick={() => setAuditLogs(!auditLogs)}
                      >
                        <span className="sys-toggle-thumb"></span>
                      </button>
                    </div>
                  </div>

                  <div className="sys-action-row">
                    <button 
                      className={`sys-btn-primary ${saveStatus === 'executing' ? 'opacity-80' : ''}`}
                      onClick={handleSaveSettings}
                      disabled={saveStatus !== 'idle'}
                    >
                      {saveStatus === 'executing' ? <RefreshCw size={15} className="spin" /> : saveStatus === 'success' ? <CheckCircle2 size={15} /> : <Save size={15} />}
                      {saveStatus === 'executing' ? 'Saving...' : saveStatus === 'success' ? 'Saved' : 'Save Configuration'}
                    </button>
                  </div>

                </div>
              </div>

              {/* Maintenance Tasks Box (Moved from the previous Right Column) */}
              <div className="sys-card sys-card-shadow" style={{ marginTop: '24px' }}>
                <div className="sys-card-header-maroon" style={{ backgroundColor: '#475569' }}>
                  <Activity size={16} /> System Maintenance & Operations
                </div>
                <div className="sys-card-body">
                  <ul className="sysconfig-task-list">
                    <li className="sysconfig-task-item">
                      <div className="sysconfig-task-info">
                        <RefreshCw size={20} className="sysconfig-task-icon" style={{ color: '#475569' }} />
                        <div>
                          <span className="sysconfig-task-title">Clear Server Cache</span>
                          <span className="sysconfig-task-sub">Flush application runtime memory</span>
                        </div>
                      </div>
                      <button 
                        className={`sysconfig-action-btn ${cacheStatus}`}
                        onClick={() => handleSystemAction('cache', setCacheStatus)}
                        disabled={cacheStatus !== "idle"}
                        style={{ backgroundColor: cacheStatus === 'success' ? '#10b981' : '#f1f5f9', color: cacheStatus === 'success' ? '#fff' : '#475569', border: cacheStatus === 'success' ? 'none' : '1px solid #cbd5e1' }}
                      >
                        {cacheStatus === "executing" && <RefreshCw size={14} className="spin" />}
                        {cacheStatus === "success" && <CheckCircle2 size={14} />}
                        {cacheStatus === "idle" ? "Execute" : cacheStatus === "executing" ? "Clearing..." : "Cleared"}
                      </button>
                    </li>

                    <li className="sysconfig-task-item">
                      <div className="sysconfig-task-info">
                        <Database size={20} className="sysconfig-task-icon" style={{ color: '#475569' }} />
                        <div>
                          <span className="sysconfig-task-title">Sync Machine Learning Models</span>
                          <span className="sysconfig-task-sub">Re-index predictive analytics pipeline</span>
                        </div>
                      </div>
                      <button 
                        className={`sysconfig-action-btn ${syncStatus}`}
                        onClick={() => handleSystemAction('sync', setSyncStatus)}
                        disabled={syncStatus !== "idle"}
                        style={{ backgroundColor: syncStatus === 'success' ? '#10b981' : '#f1f5f9', color: syncStatus === 'success' ? '#fff' : '#475569', border: syncStatus === 'success' ? 'none' : '1px solid #cbd5e1' }}
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

            {/* Right Column: Danger Zone & Access Control */}
            <div className="sys-column-right">
              
              {/* Access Control Box */}
              <div className="sys-card sys-card-shadow" style={{ marginBottom: '24px' }}>
                <div className="sys-card-header-maroon" style={{ backgroundColor: '#0f172a' }}>
                  <Shield size={16} /> Role Management (RBAC)
                </div>
                <div className="sys-card-body sysconfig-padded-box">
                  <p className="sysconfig-description">
                    Manage system access level variables, permissions, and security roles for City personnel accounts across all departments.
                  </p>
                  <div className="sysconfig-actions-group">
                    <button 
                      className="sysconfig-btn-secondary"
                      onClick={() => navigate('/role-management')}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Settings size={16} /> Configure Permissions
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone Box */}
              <div className="sys-card sys-card-danger">
                <div className="sys-card-header-danger">
                  <ShieldAlert size={16} /> Security & Operations Control
                </div>
                <div className="sys-alert-list">
                  
                  <div className="sys-alert-item">
                    <div className="sys-alert-info">
                      <div className="sys-alert-icon-box">
                        <Key size={16} />
                      </div>
                      <div>
                        <div className="sys-alert-title">Rotate Security API Keys</div>
                        <div className="sys-alert-desc">Invalidates active microservice authentication tokens.</div>
                      </div>
                    </div>
                    <button 
                      className="sys-btn-danger"
                      disabled={rotateStatus !== 'idle'}
                      onClick={() => handleSystemAction('rotate', setRotateStatus)}
                    >
                      {rotateStatus === 'executing' ? <RefreshCw size={12} className="spin" /> : rotateStatus === 'success' ? <CheckCircle2 size={12}/> : <RefreshCw size={12} />} 
                      {rotateStatus === 'executing' ? 'Rotating...' : rotateStatus === 'success' ? 'Rotated' : 'Rotate'}
                    </button>
                  </div>

                  <div className="sys-alert-item">
                    <div className="sys-alert-info">
                      <div className="sys-alert-icon-box">
                        <ServerCrash size={16} />
                      </div>
                      <div>
                        <div className="sys-alert-title">Force Restart Node Backend</div>
                        <div className="sys-alert-desc">Flushes active connections and restarts web services.</div>
                      </div>
                    </div>
                    <button 
                      className="sys-btn-danger"
                      disabled={restartStatus !== 'idle'}
                      onClick={() => handleSystemAction('restart', setRestartStatus)}
                    >
                      {restartStatus === 'executing' ? <RefreshCw size={12} className="spin" /> : restartStatus === 'success' ? <CheckCircle2 size={12}/> : <ServerCrash size={12} />} 
                      {restartStatus === 'executing' ? 'Restarting...' : restartStatus === 'success' ? 'Restarted' : 'Restart'}
                    </button>
                  </div>

                  <div className="sys-alert-item">
                    <div className="sys-alert-info">
                      <div className="sys-alert-icon-box">
                        <Lock size={16} />
                      </div>
                      <div>
                        <div className="sys-alert-title">Terminate Active HR Sessions</div>
                        <div className="sys-alert-desc">Forces all connected personnel to log in again.</div>
                      </div>
                    </div>
                    <button 
                      className="sys-btn-danger"
                      disabled={flushStatus !== 'idle'}
                      onClick={() => handleSystemAction('flush', setFlushStatus)}
                    >
                      {flushStatus === 'executing' ? 'Flushing...' : flushStatus === 'success' ? 'Flushed' : 'Flush Sessions'}
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}