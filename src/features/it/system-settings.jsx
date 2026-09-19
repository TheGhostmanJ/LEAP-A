import React, { useState, useEffect } from 'react';
import ItSidebar from '../../components/it-sidebar';
import Header from '../../components/Header';
import { 
  Save, 
  ServerCrash, 
  Key, 
  Sliders, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Database, 
  Lock,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import './system-settings.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function SystemSettings({ onLogout, user }) {
  // Form States
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [mlInterval, setMlInterval] = useState('24');
  const [auditLogs, setAuditLogs] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | executing | success
  
  // Danger Zone States
  const [rotateStatus, setRotateStatus] = useState('idle');
  const [restartStatus, setRestartStatus] = useState('idle');
  const [flushStatus, setFlushStatus] = useState('idle');

  // Load Initial Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/system-settings`);
        if (response.ok) {
          const data = await response.json();
          setMaintenanceMode(data.maintenance_mode === 'true');
          setMlInterval(data.ml_interval || '24');
          setSessionTimeout(data.session_timeout || '30');
          setAuditLogs(data.audit_logs === 'true');
        }
      } catch (error) {
        console.error("Failed to fetch system settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
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

  // Simulated Danger Zone Handlers
  const handleDangerAction = async (actionName, stateSetter) => {
    if (!window.confirm(`Are you absolutely sure you want to ${actionName.toUpperCase()}? This action may disrupt active users.`)) return;
    
    stateSetter('executing');
    try {
      // Calls a simulated backend endpoint
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
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* SYSTEM STATUS STAT CARDS */}
        <section className="sys-metrics-row">
          <div className="sys-metric-card">
            <div className="sys-metric-icon-box maroon">
              <Activity size={18} />
            </div>
            <div className="sys-metric-info">
              <span className="sys-metric-label">SYSTEM HEALTH</span>
              <span className="sys-metric-value green">99.98% Operational</span>
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
           <div style={{ padding: '40px', textAlign: 'center' }}><RefreshCw className="spin" size={24}/></div>
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
            </div>

            {/* Right Column: Danger Zone & Critical Operations */}
            <div className="sys-column-right">
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
                      onClick={() => handleDangerAction('rotate', setRotateStatus)}
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
                      onClick={() => handleDangerAction('restart', setRestartStatus)}
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
                      onClick={() => handleDangerAction('flush', setFlushStatus)}
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
