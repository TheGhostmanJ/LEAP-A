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
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
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
    (req.employee || '').toLowerCase().includes(requestSearchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchEmployees();
    fetchRequests();
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <HrSidebar user={user} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ padding: '16px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Header user={user} onLogout={onLogout} />
        </header>

        <main style={{ padding: '32px' }} className="fade-in-up">
            
          <div className="page-title-layout">
            <div className="title-icon-badge">
              <UserCheck size={26} className="title-icon-svg" />
            </div>
            <div className="title-text-group">
              <h2>Employee Profile Management</h2>
              <p className="subtitle-department">
                Portal: <span className="highlight-maroon">HR Operations</span>
              </p>
            </div>
          </div>

          {/* SECTION 1: PROFILE EDIT REQUESTS */}
          <section className="profile-requests-card" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px', overflow: 'hidden' }}>
            <div className="flex-header-bar" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: '700', fontSize: '16px' }}>Pending Data Alteration Requests</span>
              <div className="bar-search-input-wrapper" style={{ border: '1px solid #cbd5e1' }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Filter requests..."
                  className="bar-search-field"
                  value={requestSearchTerm}
                  onChange={(e) => setRequestSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-full-height-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 24px', width: '22%' }}>Employee</th>
                    <th style={{ padding: '16px 24px', width: '18%' }}>Field to Change</th>
                    <th style={{ padding: '16px 24px', width: '18%' }}>Current Record</th>
                    <th style={{ padding: '16px 24px', width: '18%' }}>Requested Change</th>
                    <th style={{ padding: '16px 24px', width: '14%' }}>Supporting Document</th>
                    <th style={{ padding: '16px 24px', width: '10%' }} className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isReqLoading ? (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading requests...</td></tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No pending alteration requests found.</td></tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px 24px' }} className="employee-name-cell">{req.employee}</td>
                        <td style={{ padding: '16px 24px' }}>{req.field}</td>
                        <td style={{ padding: '16px 24px' }} className="old-value-cell">{req.oldValue}</td>
                        <td style={{ padding: '16px 24px' }} className="new-value-cell">{req.newValue}</td>
                        <td style={{ padding: '16px 24px' }}>
                          {req.proofAttached ? (
                            <span className="attachment-link">
                              <Paperclip size={15} /> View Attachment
                            </span>
                          ) : (
                            <span className="no-attachment-note">Provided in-person</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px' }} className="actions-cell">
                          {req.status === 'Pending' ? (
                            <>
                              <button
                                style={{ backgroundColor: '#d1fae5', color: '#059669', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                                onClick={() => handleAction(req.id, 'Approved')}
                                title="Approve Request"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '350px' }}>
              <Search size={18} color="#64748b" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search by name, ID, or department..."
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>
            <button 
              onClick={handleOpenCreateModal}
              style={{ backgroundColor: '#800020', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              <UserPlus size={18} /> Onboard Employee
            </button>
          </div>

          <section style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '16px' }}>
              Active Employee Roster ({filteredEmployees.length} found)
            </div>

            <div className="table-full-height-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 24px', width: '18%' }}>Employee ID</th>
                    <th style={{ padding: '16px 24px', width: '25%' }}>Full Name</th>
                    <th style={{ padding: '16px 24px', width: '27%' }}>Department</th>
                    <th style={{ padding: '16px 24px', width: '20%' }}>Position Title</th>
                    <th style={{ padding: '16px 24px', width: '10%' }} className="text-center">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {isEmpLoading ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading employee records...</td></tr>
                  ) : empError ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#dc2626' }}>Error: {empError}</td></tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No matching employees found.</td></tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.employee_key} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px 24px', color: '#6b7280', fontFamily: 'monospace', fontWeight: 600 }}>{emp.employee_id}</td>
                        <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                          {emp.first_name} {emp.last_name}
                        </td>
                        <td style={{ padding: '16px 24px' }}>{emp.department}</td>
                        <td style={{ padding: '16px 24px' }}>{emp.position_title}</td>
                        <td style={{ padding: '16px 24px' }} className="actions-cell">
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', padding: '6px 12px' }}
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
                  className="modal-form-input"
                  style={{ backgroundColor: isEditMode ? '#f1f5f9' : '#fff' }}
                  value={empFormData.employee_id}
                  onChange={(e) => setEmpFormData({...empFormData, employee_id: e.target.value})}
                  disabled={isEditMode}
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