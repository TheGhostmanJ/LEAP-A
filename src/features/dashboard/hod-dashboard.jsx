import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  AlertTriangle,
  Ban,
  ArrowRight,
  X,
  Paperclip,
  Eye,
  UploadCloud,
  Edit
} from 'lucide-react';

import HodSidebar from "../../components/hod-sidebar";
import Header from '../../components/Header.jsx';
import { buildLeavePdfBytes } from '../leave/generateLeavePdf.js';
import './hod-dashboard.css';

const formatPdfDate = (dateVal) => {
  if (!dateVal) return '';
  const parsed = new Date(dateVal);
  if (isNaN(parsed.getTime())) return String(dateVal);
  return parsed.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

export default function HodDashboard({ onLogout, user }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic States
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [deptStats, setDeptStats] = useState({
    totalEmployees: 0,
    anomalyAlerts: 0,
    highRisk: 0,
    mediumRisk: 0
  });

  // Modal States
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('Document Preview');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Attendance States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedDatFile, setSelectedDatFile] = useState(null);
  const [manualEntry, setManualEntry] = useState({ employeeKey: '', date: '', time: '', type: '0' });
  const [uploadStatus, setUploadStatus] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchDeptData = async (deptName) => {
    try {
      const encodedDept = encodeURIComponent(deptName.trim());
      
      // 1. Fetch Leaves
      const leaveRes = await fetch(`${apiUrl}/api/leave-applications/department?name=${encodedDept}`);
      if (leaveRes.ok) {
        const leaveData = await leaveRes.json();
        setLeaveRequests(leaveData.applications || []);
      }

      // 2. Fetch Dynamic Department Stats (You will need to link this to your backend)
      const statsRes = await fetch(`${apiUrl}/api/department/stats?name=${encodedDept}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setDeptStats({
          totalEmployees: statsData.total_employees || 0,
          anomalyAlerts: statsData.total_anomalies || 0,
          highRisk: statsData.high_risk || 0,
          mediumRisk: statsData.medium_risk || 0
        });
      }
    } catch (error) {
      console.error("Failed to load department data:", error);
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    if (user?.department) {
      setLoadingLeaves(true);
      fetchDeptData(user.department.trim());
    } else {
      setLoadingLeaves(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingLeaves = leaveRequests.filter(req => req.status === 'Pending');

  const formatDate = (rawDate) => {
    if (!rawDate) return 'N/A';
    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) return rawDate;
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // --- ATTENDANCE HANDLERS ---
  const handleFileChange = (e) => {
    setSelectedDatFile(e.target.files[0]);
    setUploadStatus('');
  };

  const handleDatUpload = async () => {
    if (!selectedDatFile) {
      setUploadStatus('Please select a .dat file first.');
      return;
    }
    setUploadStatus('Processing file...');
    
    // Read the file natively in the browser as raw text
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawText = e.target.result;
      
      try {
        const response = await fetch(`${apiUrl}/api/attendance/upload-dat`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' }, // Sending as clean text
          body: rawText,
        });

        if (response.ok) {
          setUploadStatus('Successfully processed attendance records!');
          setTimeout(() => { setIsUploadModalOpen(false); setSelectedDatFile(null); setUploadStatus(''); }, 2000);
        } else {
          setUploadStatus('Error syncing data to database.');
        }
      } catch (err) {
        setUploadStatus('Network error occurred.');
      }
    };
    
    reader.readAsText(selectedDatFile);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus('Saving...');
    try {
      const response = await fetch(`${apiUrl}/api/attendance/manual-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...manualEntry, department: user?.department }),
      });
      if (response.ok) {
        setUploadStatus('Attendance saved successfully!');
        setTimeout(() => { setIsManualModalOpen(false); setManualEntry({ employeeKey: '', date: '', time: '', type: '0' }); setUploadStatus(''); }, 2000);
      } else {
        setUploadStatus('Failed to save attendance.');
      }
    } catch (err) {
      setUploadStatus('Network error occurred.');
    }
  };

  // ... (Keep existing handleOpenPreview and parseAttachments functions here) ...
  const handleOpenPreview = async (req) => { /* Your existing PDF generation code */ };
  const handleOpenAttachment = (attachment) => { /* Your existing attachment code */ };
  const parseAttachments = (req) => { return []; /* Your existing parsing code */ };

  return (
    <div className="app-layout-wrapper">
      <HodSidebar user={user} />

      <main className="app-main-container app-main-content dashboard-main-content fade-in-up" style={{ padding: '32px', overflowY: 'auto' }}>
        <header className="app-global-header">
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* METRICS TOP ROW GRID */}
        <section className="metrics-summary-row">
          <div className="app-card metric-card-block hover-lift">
            <div className="card-title-bar">
              <Users size={16} className="tr-icon-maroon" />
              <span>Total Employees</span>
            </div>
            {/* DYNAMIC: Replaced hardcoded 250 with actual DB state */}
            <div className="card-main-stat">{deptStats.totalEmployees || 0}</div>
            <div className="team-distribution-subtext">
              <span className="team-tag team-a">Active in {user?.department || 'Department'}</span>
            </div>
          </div>

          <div className="app-card metric-card-block hover-lift" onClick={() => navigate('/leave-approvals')} style={{ cursor: 'pointer' }}>
            <div className="card-title-bar">
              <Calendar size={16} className="tr-icon-amber" />
              <span>Pending Approvals</span>
            </div>
            <div className="card-main-stat">{pendingLeaves.length}</div>
            <div className="approval-breakdown-subtext">
              <span className="badge-stat label-vacation">
                Vacation <b>{pendingLeaves.filter(r => (r.type || r.leave_type) === 'Vacation Leave').length}</b>
              </span>
              <span className="badge-stat label-sick">
                Sick <b>{pendingLeaves.filter(r => (r.type || r.leave_type) === 'Sick Leave').length}</b>
              </span>
            </div>
          </div>

          <div className="app-card metric-card-block hover-lift" onClick={() => navigate('/anomaly-alerts')} style={{ cursor: 'pointer' }}>
            <div className="card-title-bar">
              <AlertTriangle size={16} className="tr-icon-maroon" />
              <span>Anomaly Alerts</span>
            </div>
            {/* DYNAMIC: Replaced hardcoded counts */}
            <div className="card-main-stat text-alert-red">{deptStats.anomalyAlerts}</div>
            <div className="anomaly-breakdown-pills">
              <span className="pill risk-high">{deptStats.highRisk} High Risk</span>
              <span className="pill risk-medium">{deptStats.mediumRisk} Med Risk</span>
            </div>
          </div>
        </section>

        {/* MIDDLE SECTION Split Row */}
        <section className="dashboard-split-content-panel" style={{ marginTop: '24px', display: 'flex', gap: '24px' }}>
          
          {/* Left Block: Requests Table */}
          <div className="app-card content-data-box table-box-width" style={{ flex: 2 }}>
            <div className="box-header-title" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)', fontWeight: '700' }}>
              {user?.department ? `${user.department} — Leave Requests` : 'Pending Leave Application Request'}
            </div>
            <div className="table-responsive-scroll">
              <table className="data-display-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 20px' }}>Employee Name</th>
                    <th style={{ padding: '12px 20px' }}>Leave Type</th>
                    <th style={{ padding: '12px 20px' }}>Date Filed</th>
                    <th style={{ padding: '12px 20px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLeaves ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Loading requests...</td></tr>
                  ) : leaveRequests.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No leave applications found.</td></tr>
                  ) : (
                    leaveRequests.slice(0, 4).map((req) => (
                      <tr key={req.id || req.application_id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '14px 20px', fontWeight: '600' }}>{req.name || `${req.first_name || ''} ${req.last_name || ''}`.trim()}</td>
                        <td style={{ padding: '14px 20px' }}>{req.type || req.leave_type}</td>
                        <td style={{ padding: '14px 20px' }}>{formatDate(req.date_filed || req.start_date)}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className={`status-badge status-${req.status?.toLowerCase()}`}>{req.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="box-footer-action-link" style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border-light)', textAlign: 'right' }}>
              <Link to="/leave-approvals" style={{ textDecoration: 'none', color: 'var(--color-info)', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>View All Requests</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Right Block: Attendance Actions */}
          <div className="app-card content-data-box forecast-box-width" style={{ flex: 1 }}>
            <div className="box-header-title" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)', fontWeight: '700', backgroundColor: 'var(--color-maroon)', color: 'white' }}>
              Attendance Sync
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Sync physical biometrics hardware data or input missing records manually.
              </p>
              
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--color-maroon)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <UploadCloud size={18} /> Upload Scanner (.dat)
              </button>
              
              <button 
                onClick={() => setIsManualModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <Edit size={18} /> Manual Entry
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* MODAL: Upload .dat File */}
      {isUploadModalOpen && (
        <div className="app-modal-overlay" onClick={() => { setIsUploadModalOpen(false); setUploadStatus(''); }}>
          <div className="app-modal-card" style={{ maxWidth: '400px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: 'var(--color-maroon)' }}>Upload Biometrics Data</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Select the .dat file exported from the NGTeco scanner.</p>
            
            <input type="file" accept=".dat,.txt" onChange={handleFileChange} style={{ marginTop: '16px', marginBottom: '16px', width: '100%' }} />
            
            {uploadStatus && <div style={{ marginBottom: '16px', fontSize: '13px', color: uploadStatus.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{uploadStatus}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => { setIsUploadModalOpen(false); setUploadStatus(''); }} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDatUpload} style={{ padding: '8px 16px', backgroundColor: 'var(--color-maroon)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Manual Attendance Entry */}
      {isManualModalOpen && (
        <div className="app-modal-overlay" onClick={() => { setIsManualModalOpen(false); setUploadStatus(''); }}>
          <div className="app-modal-card" style={{ maxWidth: '400px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: 'var(--color-maroon)' }}>Manual Attendance Entry</h3>
            
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Employee ID / Key</label>
                <input type="number" required value={manualEntry.employeeKey} onChange={e => setManualEntry({...manualEntry, employeeKey: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Date</label>
                <input type="date" required value={manualEntry.date} onChange={e => setManualEntry({...manualEntry, date: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Time</label>
                <input type="time" required value={manualEntry.time} onChange={e => setManualEntry({...manualEntry, time: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Punch Type</label>
                <select value={manualEntry.type} onChange={e => setManualEntry({...manualEntry, type: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="0">Check-In</option>
                  <option value="1">Check-Out</option>
                </select>
              </div>

              {uploadStatus && <div style={{ fontSize: '13px', color: uploadStatus.includes('Failed') ? 'red' : 'green', fontWeight: 'bold' }}>{uploadStatus}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => { setIsManualModalOpen(false); setUploadStatus(''); }} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: 'var(--color-maroon)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}