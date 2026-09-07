import React, { useState } from 'react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Users, UserPlus, Search, FileText, CheckCircle, Clock } from 'lucide-react';
import './onboarding.css';

export default function Onboarding({ onLogout, user }) {
  // Mock data for new hires
  const [newHires, setNewHires] = useState([
    { id: 1, name: 'Miguel Santos', department: 'City Planning', role: 'Urban Planner I', date: 'Jul 25, 2026', status: 'Pending Setup' },
    { id: 2, name: 'Elena Reyes', department: 'City Budget Office', role: 'Financial Analyst', date: 'Jul 21, 2026', status: 'Active' },
    { id: 3, name: 'Carlos Mendoza', department: 'IT Operations', role: 'Systems Admin', date: 'Jul 28, 2026', status: 'Pending Setup' },
  ]);

  return (
    <div className="dashboard-container hod-view-wrapper">
      <HrSidebar />

      <div className="dashboard-main-content">
        {/* GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <div className="title-icon-badge">
              <Users size={36} className="title-icon-svg" /> 
            </div>
            <div className="title-text-group">
              <h2>Employee Onboarding</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          
          {/* Shared Header Component */}
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* UTILITY BAR */}
        <div className="table-filter-utilities-row onboarding-utility-bar">
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Search new hires..." />
          </div>
          <button className="primary-action-trigger-btn">
            <UserPlus size={16} /> Register New Employee
          </button>
        </div>

        {/* DATA TABLE */}
        <section className="content-data-box table-box-margin card-shadow-wrap onboarding-table-card">
          <div className="box-header-title-maroon-bar">
            Recent Onboarding Records
          </div>

          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Target Start Date</th>
                  <th>Setup Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {newHires.map((hire) => (
                  <tr key={hire.id}>
                    <td className="hire-name-cell">{hire.name}</td>
                    <td>{hire.department}</td>
                    <td>{hire.role}</td>
                    <td>{hire.date}</td>
                    <td>
                      <span className={`status-badge ${hire.status === 'Active' ? 'status-approved' : 'status-pending'}`}>
                        {hire.status === 'Active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {hire.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn-investigate profile-action-btn">
                        <FileText size={14} /> Profile
                      </button>
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