import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Search, CheckCircle, XCircle, Paperclip, UserCheck } from 'lucide-react';
import './profile-requests.css';

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
        {/* GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <div className="title-icon-badge">
              <UserCheck size={36} className="title-icon-svg" /> 
            </div>
            <div className="title-text-group">
              <h2>Profile Edit Requests</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          
          {/* Shared Header Component */}
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* DATA TABLE SECTION */}
        <section className="content-data-box table-box-margin card-shadow-wrap profile-requests-card">
          <div className="box-header-title-maroon-bar flex-header-bar">
            <span>Pending Data Alteration Requests</span>
            <div className="bar-search-input-wrapper">
              <Search size={14} color="#7a0000" />
              <input type="text" placeholder="Search employee..." className="bar-search-field" />
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
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="employee-name-cell">{req.employee}</td>
                    <td>{req.field}</td>
                    <td className="old-value-cell">{req.oldValue}</td>
                    <td className="new-value-cell">{req.newValue}</td>
                    <td>
                      {req.proofAttached ? (
                        <span className="attachment-link">
                          <Paperclip size={14} /> View Attachment
                        </span>
                      ) : (
                        <span className="no-attachment-note">Provided in-person</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      {req.status === 'Pending' ? (
                        <>
                          <button 
                            className="action-btn-green" 
                            onClick={() => handleAction(req.id, 'Approved')} 
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            className="action-btn-red" 
                            onClick={() => handleAction(req.id, 'Rejected')} 
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      ) : (
                        <span className={`status-badge status-${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
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