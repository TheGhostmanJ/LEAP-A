import React, { useState, useEffect } from 'react';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';
import { Search, Calendar, ChevronDown, CheckSquare, Check, X, Eye } from 'lucide-react';
import './leave-approvals.css';

export default function LeaveApprovals({ onLogout, user }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/leave-approvals`);
      
      if (!response.ok) throw new Error('Failed to fetch leave requests');
      
      const data = await response.json();
      
      // Format the data for the UI
      const formattedData = data.map(req => ({
        ...req,
        date: new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }));
      
      setRequests(formattedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/leave-approvals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) throw new Error(`Failed to ${action.toLowerCase()} request`);

      // Instantly update the UI upon success
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    } catch (err) {
      alert(err.message);
    }
  };

  // Dynamic Filtering Logic
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || req.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
              <label>Leave Type Filter</label>
              <div className="input-with-icon">
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation Leave">Vacation Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Force Leave">Force Leave</option>
                </select>
                <ChevronDown size={16} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-group search-flex-grow">
              <label>Search Bar</label>
              <div className="input-with-icon">
                <Search size={16} className="field-icon-left" />
                <input 
                  type="text" 
                  placeholder="Search employee..." 
                  className="has-left-icon" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '24px', color: '#64748b' }}>Loading leave requests...</td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '24px', color: '#64748b' }}>No pending leave requests found.</td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}