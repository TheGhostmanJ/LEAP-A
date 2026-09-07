import React, { useState } from 'react';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';
import { Search, Calendar, ChevronDown, CheckSquare, Check, X, Eye } from 'lucide-react';
import './leave-approvals.css';

export default function LeaveApprovals({ onLogout, user }) {
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
      {/* Navigation Column */}
      <HodSidebar />

      {/* Main Viewport Content Surface with entrance animation */}
      <main className="dashboard-main-content fade-in-up">
        
        {/* STANDARDIZED GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <CheckSquare size={24} className="tr-icon-maroon" />
            <h2>
              <span className="cl-title-dark">Leave</span> <span className="cl-title-maroon">Approvals</span>
            </h2>
          </div>
          
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* FILTER OPTIONS BLOCK */}
        <section className="filter-options-block">
          <span className="filter-block-legend">
            <span className="cl-badge-dot"></span> Filter Options
          </span>
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
                  <option value="" disabled hidden>Select department...</option>
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
                  <option value="" disabled hidden>Select type...</option>
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
                <input type="text" placeholder="Search employee or ID..." className="has-left-icon" />
              </div>
            </div>

          </div>
        </section>

        {/* MAIN LEAVE REQUESTS DISPLAY BOARD */}
        <section className="content-data-box leave-requests-master-container">
          <div className="box-header-title">Pending Leave Requests</div>
          
          <div className="table-responsive-scroll">
            <table className="data-display-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th className="text-center">Status</th>
                  <th>Date</th>
                  <th className="text-center">Details</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="font-semibold">{request.name}</td>
                    <td>{request.type}</td>
                    <td className="text-center">
                      <span className={`status-pill-badge status-${request.status.toLowerCase()}`}>
                        ● {request.status}
                      </span>
                    </td>
                    <td>{request.date}</td>
                    <td className="text-center">
                      <button type="button" className="view-more-trigger">
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                    <td className="text-center">
                      {request.status === 'Pending' ? (
                        <div className="action-buttons-group">
                          <button 
                            className="action-btn-green" 
                            onClick={() => handleAction(request.id, 'Approved')}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            className="action-btn-red" 
                            onClick={() => handleAction(request.id, 'Rejected')}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`action-finalized-text text-${request.status === 'Approved' ? 'green' : 'red'}`}>
                          {request.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}