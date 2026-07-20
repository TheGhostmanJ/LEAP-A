import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import HrSidebar from '../../components/hr-sidebar';
import { User, Bell, Search, CheckCircle, XCircle, Paperclip } from 'lucide-react';

export default function ProfileRequests({ onLogout, user }) {
    const navigate = useNavigate();
  // Mock data for UI state
  const [requests, setRequests] = useState([
    { 
      id: 101, 
      employee: 'Maria Santos', 
      field: 'Civil Status', 
      oldValue: 'Single', 
      newValue: 'Married', 
      proofAttached: true,
      date: 'May 16, 2026',
      status: 'Pending'
    },
    { 
      id: 102, 
      employee: 'Juan Dela Cruz', 
      field: 'Contact Number', 
      oldValue: '09123456789', 
      newValue: '09987654321', 
      proofAttached: false,
      date: 'May 17, 2026',
      status: 'Pending'
    }
  ]);

  const handleAction = (id, action) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
  };

  return (
    <div className="dashboard-container hod-view-wrapper">
      <HrSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <span className="title-icon-svg">📝</span> 
            <div className="title-text-group">
              <h2>Profile Edit Requests</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
            </button>
            <div className="profile-identity-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                            <div className="avatar-placeholder"><User size={16} /></div>
                            <span className="profile-name-label">
                                {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Employee Name'}
                            </span>
                        </div>
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        <section className="content-data-box table-box-margin card-shadow-wrap" style={{ marginTop: '24px' }}>
          <div className="box-header-title-maroon-bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pending Data Alteration Requests</span>
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '4px', padding: '2px 8px' }}>
              <Search size={14} color="#7a0000" />
              <input type="text" placeholder="Search employee..." style={{ border: 'none', outline: 'none', marginLeft: '6px', fontSize: '12px' }} />
            </div>
          </div>

          <div className="table-responsive-scroll">
            <table className="data-display-table left-aligned-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Field to Change</th>
                  <th>Current Record</th>
                  <th>Requested Change</th>
                  <th>Supporting Document</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: '600' }}>{req.employee}</td>
                    <td>{req.field}</td>
                    <td style={{ color: '#6b7280', textDecoration: 'line-through' }}>{req.oldValue}</td>
                    <td style={{ color: '#059669', fontWeight: '500' }}>{req.newValue}</td>
                    <td>
                      {req.proofAttached ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                          <Paperclip size={14} /> View Attachment
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic' }}>Provided in-person</span>
                      )}
                    </td>
                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {req.status === 'Pending' ? (
                        <>
                          <button className="action-btn-green" onClick={() => handleAction(req.id, 'Approved')} title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button className="action-btn-red" onClick={() => handleAction(req.id, 'Rejected')} title="Reject" style={{ padding: '8px', borderRadius: '8px' }}>
                            <XCircle size={16} />
                          </button>
                        </>
                      ) : (
                        <span className={`status-badge status-${req.status.toLowerCase()}`}>{req.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}