import React, { useState } from 'react';
import HodSidebar from '../../components/hod-sidebar'; // Matches your lowercase file name
import { Bell, Search, Calendar, ChevronDown } from 'lucide-react';
import './leave-approvals.css';

export default function LeaveApprovals({ onLogout, user }) {
  // State for mock request records to allow instantaneous UI feedback
  const [requests, setRequests] = useState([
    { id: 1, name: 'Juan Dela Cruz', type: 'Sick Leave', status: 'Pending', date: 'May 16, 2026' },
    { id: 2, name: 'Susan Reyes', type: 'Vacation Leave', status: 'Pending', date: 'May 10, 2026' },
    { id: 3, name: 'Alice Lee', type: 'Maternity Leave', status: 'Pending', date: 'May 16, 2026' }
  ]);

  const handleAction = (id, action) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
  };

  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Persistent Left Navigation Column */}
      <HodSidebar />

      {/* Main Viewport Content Surface */}
      <div className="dashboard-main-content">
        
        {/* UNIFORM GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <span className="title-icon">☑</span> <h2>Leave Approvals</h2>
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
              <span className="bell-badge"></span>
            </button>
            
            <div className="user-profile-badge">
              <span className="profile-icon-avatar">👤</span>
              <span className="profile-name-string">{user?.name || 'Mario Santos'}</span>
            </div>
            
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        {/* 🔍 FILTER OPTIONS BOX BLOCK */}
        <section className="filter-options-block">
          <span className="filter-block-legend">Filter Options</span>
          <div className="filter-inputs-row">
            
            <div className="filter-field-group">
              <label>Date Range</label>
              <div className="input-with-icon">
                <input type="text" placeholder="Select Date Range..." readOnly />
                <Calendar size={16} className="field-icon-right" />
              </div>
            </div>

            <div className="filter-field-group">
              <label>Department/Office</label>
              <div className="input-with-icon">
                <select defaultValue="">
                  <option value="" disabled hidden></option>
                  <option value="team-a">Team A</option>
                  <option value="team-b">Team B</option>
                  <option value="team-c">Team C</option>
                </select>
                <ChevronDown size={16} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-group">
              <label>Leave Type Filter</label>
              <div className="input-with-icon">
                <select defaultValue="">
                  <option value="" disabled hidden></option>
                  <option value="sick">Sick Leave</option>
                  <option value="vacation">Vacation Leave</option>
                  <option value="maternity">Maternity Leave</option>
                </select>
                <ChevronDown size={16} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-group search-flex-grow">
              <label>Search Bar</label>
              <div className="input-with-icon">
                <Search size={16} className="field-icon-left" />
                <input type="text" placeholder="" className="has-left-icon" />
              </div>
            </div>

          </div>
        </section>

        {/* 📋 MAIN LEAVE REQUESTS DISPLAY BOARD */}
        <section className="content-data-box leave-requests-master-container">
          <div className="box-header-title">Leave Requests</div>
          
          <div className="table-responsive-scroll">
            <table className="data-display-table centered-header-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th colSpan="3"></th> {/* Blank space aligned for View/Approve/Reject layout */}
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.name}</td>
                    <td>{request.type}</td>
                    <td>
                      <span className={`status-pill-badge status-${request.status.toLowerCase()}`}>
                        ● {request.status}
                      </span>
                    </td>
                    <td>{request.date}</td>
                    <td className="link-cell action-column-view">
                      <span className="view-more-trigger">View More</span>
                    </td>
                    <td className="action-column-btn">
                      {request.status === 'Pending' ? (
                        <button 
                          className="action-btn-green" 
                          onClick={() => handleAction(request.id, 'Approved')}
                        >
                          Approved
                        </button>
                      ) : (
                        <span className="action-finalized-text text-green">{request.status}</span>
                      )}
                    </td>
                    <td className="action-column-btn">
                      {request.status === 'Pending' ? (
                        <button 
                          className="action-btn-red" 
                          onClick={() => handleAction(request.id, 'Rejected')}
                        >
                          Reject
                        </button>
                      ) : (
                        request.status === 'Rejected' && <span className="action-finalized-text text-red">Rejected</span>
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