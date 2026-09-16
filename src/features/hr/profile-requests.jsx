import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Search, CheckCircle, XCircle, Paperclip, UserCheck, Settings, X, UserPlus } from 'lucide-react';
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
        body: JSON.stringify({ action: action, reviewer_key: user?.employee_key })
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredRequests = requests.filter((req) =>
    req.employee.toLowerCase().includes(requestSearchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchEmployees();
    fetchRequests();
  }, []);

  return (
    <div className="profile-layout-wrapper">
      <HrSidebar />

      <div className="profile-main-container">
        {/* Top Header */}
        <header className="profile-global-header">
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* Content Body */}
        <main className="profile-main-content">
          <div className="profile-page">
            
            {/* Title Section */}
            <div className="profile-header-row">
              <div className="profile-title-layout">
                <div className="profile-title-icon-badge">
                  <UserCheck size={26} />
                </div>
                <div>
                  <h1 className="profile-title">Employee Profile Management</h1>
                  <p className="profile-subtitle">
                    Portal: <span className="profile-subtitle-accent">HR Operations</span>
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 1: PROFILE EDIT REQUESTS */}
            <section className="profile-card-container">
              <div className="profile-card-header">
                <span>Pending Data Alteration Requests</span>
                <div className="bar-search-input-wrapper">
                  <Search size={16} className="bar-search-icon" />
                  <input
                    type="text"
                    placeholder="Filter requests..."
                    className="bar-search-field"
                    value={requestSearchTerm}
                    onChange={(e) => setRequestSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="profile-table-scroll">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>Employee</th>
                      <th style={{ width: '18%' }}>Field to Change</th>
                      <th style={{ width: '18%' }}>Current Record</th>
                      <th style={{ width: '18%' }}>Requested Change</th>
                      <th style={{ width: '14%' }}>Supporting Document</th>
                      <th style={{ width: '10%' }} className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isReqLoading ? (
                      <tr>
                        <td colSpan="6" className="profile-status-cell">Loading requests...</td>
                      </tr>
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="profile-status-cell">No requests found.</td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id}>
                          <td className="employee-name-cell">{req.employee}</td>
                          <td className="field-cell">{req.field}</td>
                          <td className="old-value-cell">{req.oldValue}</td>
                          <td className="new-value-cell">{req.newValue}</td>
                          <td>
                            {req.proofAttached ? (
                              <span className="attachment-link">
                                <Paperclip size={15} /> View Attachment
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
                                  title="Approve Request"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  className="action-btn-red"
                                  onClick={() => handleAction(req.id, 'Rejected')}
                                  title="Reject Request"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            ) : (
                              <span className={`status-badge status-${req.status.toLowerCase()}`}>
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

            {/* SECTION 2: EMPLOYEE DIRECTORY & ROSTER */}
            <div className="directory-utility-bar">
              <div className="directory-search-wrapper">
                <Search size={18} className="directory-search-icon" />
                <input
                  type="text"
                  className="directory-search-input"
                  placeholder="Search by name, ID, or department..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-onboard-maroon" onClick={handleOpenCreateModal}>
                <UserPlus size={18} /> Onboard Employee
              </button>
            </div>

            <section className="profile-card-container">
              <div className="profile-card-header">
                Active Employee Roster ({filteredEmployees.length} found)
              </div>

              <div className="profile-table-scroll">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>Employee ID</th>
                      <th style={{ width: '25%' }}>Full Name</th>
                      <th style={{ width: '27%' }}>Department</th>
                      <th style={{ width: '20%' }}>Position Title</th>
                      <th style={{ width: '10%' }} className="text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isEmpLoading ? (
                      <tr>
                        <td colSpan="5" className="profile-status-cell">Loading employee records...</td>
                      </tr>
                    ) : empError ? (
                      <tr>
                        <td colSpan="5" className="profile-status-cell error-text">Error: {empError}</td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="profile-status-cell">No matching employees found.</td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <tr key={emp.employee_key}>
                          <td className="emp-id-cell">{emp.employee_id}</td>
                          <td className="employee-name-cell">
                            {emp.first_name} {emp.last_name}
                          </td>
                          <td className="dept-cell">{emp.department}</td>
                          <td className="position-cell">{emp.position_title}</td>
                          <td className="actions-cell">
                            <button
                              className="btn-manage-profile"
                              onClick={() => handleOpenEditModal(emp)}
                            >
                              <Settings size={15} /> Profile
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
        </main>
      </div>

      {/* ONBOARD / EDIT EMPLOYEE MODAL */}
      {isEmpModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
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
                  placeholder="e.g., LIPA-2026-102"
                  required
                  className={`modal-form-input ${isEditMode ? 'input-disabled' : ''}`}
                  value={empFormData.employee_id}
                  onChange={(e) => setEmpFormData({...empFormData, employee_id: e.target.value})}
                  disabled={isEditMode}
                />
              </div>

              <div className="form-grid-two-col">
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

              <div className="modal-actions-row">
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