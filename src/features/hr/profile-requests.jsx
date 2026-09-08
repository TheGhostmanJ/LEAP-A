import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Search, CheckCircle, XCircle, Paperclip, UserCheck, Plus, Settings, X, UserPlus } from 'lucide-react';
import './profile-requests.css';

export default function ProfileRequests({ onLogout, user }) {
  const navigate = useNavigate();

  // ==========================================
  // EMPLOYEE DIRECTORY STATE & LOGIC
  // ==========================================
  const [employees, setEmployees] = useState([]);
  const [isEmpLoading, setIsEmpLoading] = useState(true);
  const [empError, setEmpError] = useState(null);

  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEmpKey, setEditingEmpKey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [empFormData, setEmpFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    department: '',
    position_title: ''
  });

  const fetchEmployees = async () => {
    setIsEmpLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/employees`);
      
      if (!response.ok) throw new Error('Failed to fetch employee data');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setEmpError(err.message);
    } finally {
      setIsEmpLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEmpFormData({ employee_id: '', first_name: '', last_name: '', department: '', position_title: '' });
    setIsEmpModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setIsEditMode(true);
    setEditingEmpKey(emp.employee_key);
    setEmpFormData({
      employee_id: emp.employee_id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      department: emp.department,
      position_title: emp.position_title
    });
    setIsEmpModalOpen(true);
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const endpoint = isEditMode ? `${apiUrl}/api/employees/${editingEmpKey}` : `${apiUrl}/api/employees`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empFormData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save employee record');

      await fetchEmployees();
      setIsEmpModalOpen(false);
      alert(`Employee ${isEditMode ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const empId = (emp.employee_id || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const query = employeeSearchTerm.toLowerCase();

    return fullName.includes(query) || empId.includes(query) || dept.includes(query);
  });

  // ==========================================
  // PROFILE EDIT REQUESTS STATE & LOGIC
  // ==========================================
  const [requests, setRequests] = useState([]);
  const [isReqLoading, setIsReqLoading] = useState(true);
  const [requestSearchTerm, setRequestSearchTerm] = useState('');

  const fetchRequests = async () => {
    setIsReqLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/profile-requests`);
      
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      
      // Map database columns to our UI keys
      const formattedData = data.map(req => ({
        id: req.id,
        employee: req.employee,
        field: req.field,
        oldValue: req.old_value || 'None',
        newValue: req.new_value,
        proofAttached: !!req.proof_document_path,
        date: new Date(req.request_date).toLocaleDateString(),
        status: req.status
      }));
      setRequests(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReqLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/profile-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Pass the HR Admin's employee_key if available to log who reviewed it
        body: JSON.stringify({ action: action, reviewer_key: user?.employee_key })
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      // Instantly update UI upon successful DB update
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredRequests = requests.filter((req) => 
    req.employee.toLowerCase().includes(requestSearchTerm.toLowerCase())
  );

  // Trigger both API fetches on mount
  useEffect(() => {
    fetchEmployees();
    fetchRequests();
  }, []);

  return (
    <div className="dashboard-container hod-view-wrapper dept-wrapper-relative">
      <HrSidebar />

      <div className="dashboard-main-content">
        {/* GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <div className="title-icon-badge">
              <UserCheck size={36} className="title-icon-svg" /> 
            </div>
            <div className="title-text-group">
              <h2>Employee Management</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* ========================================== */}
        {/* SECTION 1: PROFILE EDIT REQUESTS           */}
        {/* ========================================== */}
        <section className="content-data-box table-box-margin card-shadow-wrap profile-requests-card">
          <div className="box-header-title-maroon-bar flex-header-bar">
            <span>Pending Data Alteration Requests</span>
            <div className="bar-search-input-wrapper">
              <Search size={14} color="#7a0000" />
              <input 
                type="text" 
                placeholder="Filter requests..." 
                className="bar-search-field" 
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                value={requestSearchTerm}
                onChange={(e) => setRequestSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-full-height-wrapper">
            <table className="record-grid-system left-aligned-table">
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
                {isReqLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '16px', color: '#64748b' }}>Loading requests...</td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '16px', color: '#64748b' }}>No requests found.</td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="employee-name-cell" style={{ fontWeight: '600', color: '#1a202c' }}>{req.employee}</td>
                      <td>{req.field}</td>
                      <td className="old-value-cell" style={{ color: '#64748b' }}>{req.oldValue}</td>
                      <td className="new-value-cell" style={{ color: '#047857', fontWeight: '500' }}>{req.newValue}</td>
                      <td>
                        {req.proofAttached ? (
                          <span className="attachment-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', cursor: 'pointer', fontSize: '13px' }}>
                            <Paperclip size={14} /> View Attachment
                          </span>
                        ) : (
                          <span className="no-attachment-note" style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>Provided in-person</span>
                        )}
                      </td>
                      <td className="actions-cell" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {req.status === 'Pending' ? (
                          <>
                            <button 
                              className="action-btn-green" 
                              onClick={() => handleAction(req.id, 'Approved')} 
                              title="Approve"
                              style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              className="action-btn-red" 
                              onClick={() => handleAction(req.id, 'Rejected')} 
                              title="Reject"
                              style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        ) : (
                          <span className={`status-badge status-${req.status.toLowerCase()}`} style={{ fontWeight: '600', fontSize: '13px', color: req.status === 'Approved' ? '#166534' : '#991b1b' }}>
                            {req.status}
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

        {/* ========================================== */}
        {/* SECTION 2: EMPLOYEE DIRECTORY              */}
        {/* ========================================== */}
        <div className="table-filter-utilities-row dept-utility-row" style={{ marginTop: '32px' }}>
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input 
              type="text" 
              className="utility-search-field" 
              placeholder="Search by name, ID, or department..." 
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
            />
          </div>
          <button className="primary-action-trigger-btn" onClick={handleOpenCreateModal}>
            <UserPlus size={16} /> Onboard Employee
          </button>
        </div>

        <section className="content-data-box table-box-margin card-shadow-wrap dept-table-section">
          <div className="box-header-title-maroon-bar">
            Active Employee Roster ({filteredEmployees.length} found)
          </div>

          <div className="table-full-height-wrapper">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Position Title</th>
                  <th className="text-center">Manage</th>
                </tr>
              </thead>
              <tbody>
                {isEmpLoading ? (
                  <tr>
                    <td colSpan="5" className="table-status-cell info-text">Loading employee records...</td>
                  </tr>
                ) : empError ? (
                  <tr>
                    <td colSpan="5" className="table-status-cell error-text">Error: {empError}</td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-status-cell info-text">No matching employees found.</td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.employee_key}>
                      <td className="dept-code-cell">{emp.employee_id}</td>
                      <td style={{ fontWeight: '600', color: '#1a202c' }}>
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td>{emp.department}</td>
                      <td>{emp.position_title}</td>
                      <td className="actions-cell">
                        <button 
                          className="action-btn-investigate configure-action-btn"
                          onClick={() => handleOpenEditModal(emp)}
                        >
                          <Settings size={14} /> Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ========================================== */}
      {/* ONBOARD / EDIT EMPLOYEE MODAL              */}
      {/* ========================================== */}
      {isEmpModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{isEditMode ? 'Edit Employee Profile' : 'Onboard New Employee'}</h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="modal-form">
              
              <div className="form-field-group">
                <label>Employee ID <span className="required-star">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., EMP-2026-001" 
                  required 
                  className="modal-form-input"
                  value={empFormData.employee_id}
                  onChange={(e) => setEmpFormData({...empFormData, employee_id: e.target.value})}
                  disabled={isEditMode}
                  style={{ backgroundColor: isEditMode ? '#f1f5f9' : 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field-group">
                  <label>First Name <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    required 
                    className="modal-form-input"
                    value={empFormData.first_name}
                    onChange={(e) => setEmpFormData({...empFormData, first_name: e.target.value})}
                  />
                </div>
                <div className="form-field-group">
                  <label>Last Name <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    required 
                    className="modal-form-input"
                    value={empFormData.last_name}
                    onChange={(e) => setEmpFormData({...empFormData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Department <span className="required-star">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., City Personnel Office" 
                  required 
                  className="modal-form-input"
                  value={empFormData.department}
                  onChange={(e) => setEmpFormData({...empFormData, department: e.target.value})}
                />
              </div>

              <div className="form-field-group">
                <label>Position Title <span className="required-star">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., HR Analyst II" 
                  required 
                  className="modal-form-input"
                  value={empFormData.position_title}
                  onChange={(e) => setEmpFormData({...empFormData, position_title: e.target.value})}
                />
              </div>

              <div className="modal-actions-row" style={{ marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEmpModalOpen(false)}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="modal-submit-btn"
                >
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Onboard Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}