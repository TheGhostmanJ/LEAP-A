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
    // UI FIX: Apply standard layout wrapper
    <div className="app-layout-wrapper">
      <HrSidebar user={user} />

      <main className="app-main-container fade-in-up" style={{ padding: '32px' }}>
        
        {/* UNIFIED GLOBAL HEADER ROW */}
        <header className="app-global-header">
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* SECTION 1: PROFILE EDIT REQUESTS */}
        <section className="app-card" style={{ marginTop: '24px' }}>
          <div className="app-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Pending Data Alteration Requests</span>
            <div style={{ position: 'relative', width: '280px', fontWeight: 'normal' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Filter requests..."
                className="app-search-input"
                style={{ paddingLeft: '36px', height: '36px' }}
                value={requestSearchTerm}
                onChange={(e) => setRequestSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="responsive-table-overflow-scroller">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Employee</th>
                  <th style={{ width: '18%' }}>Field to Change</th>
                  <th style={{ width: '18%' }}>Current Record</th>
                  <th style={{ width: '18%' }}>Requested Change</th>
                  <th style={{ width: '14%' }}>Supporting Document</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isReqLoading ? (
                  <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading requests...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No pending alteration requests found.</td></tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{req.employee}</td>
                      <td>{req.field}</td>
                      <td style={{ color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{req.oldValue}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: '700' }}>{req.newValue}</td>
                      <td>
                        {req.proofAttached ? (
                          <span className="attachment-link">
                            <Paperclip size={14} /> View Attachment
                          </span>
                        ) : (
                          <span className="no-attachment-note">Provided in-person</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {req.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              className="action-btn-green"
                              onClick={() => handleAction(req.id, 'Approved')}
                              title="Approve Request"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              className="action-btn-red"
                              onClick={() => handleAction(req.id, 'Rejected')}
                              title="Reject Request"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className={`app-status-badge ${req.status === 'Approved' ? 'status-success' : 'status-danger'}`}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="app-search-input"
              placeholder="Search by name, ID, or department..."
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleOpenCreateModal}>
            <UserPlus size={18} /> Onboard Employee
          </button>
        </div>

        <section className="app-card">
          <div className="app-card-header">
            Active Employee Roster ({filteredEmployees.length} found)
          </div>

          <div className="responsive-table-overflow-scroller">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>Employee ID</th>
                  <th style={{ width: '25%' }}>Full Name</th>
                  <th style={{ width: '27%' }}>Department</th>
                  <th style={{ width: '20%' }}>Position Title</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Manage</th>
                </tr>
              </thead>
              <tbody>
                {isEmpLoading ? (
                  <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading employee records...</td></tr>
                ) : empError ? (
                  <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-danger)' }}>Error: {empError}</td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No matching employees found.</td></tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.employee_key}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)', fontWeight: '700' }}>{emp.employee_id}</td>
                      <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{emp.department}</td>
                      <td>{emp.position_title}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => handleOpenEditModal(emp)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
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

      </main>

      {/* ONBOARD / EDIT EMPLOYEE MODAL */}
      {isEmpModalOpen && (
        <div className="app-modal-overlay" onClick={() => setIsEmpModalOpen(false)}>
          <div className="app-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-maroon)' }}>
                {isEditMode ? 'Edit Employee Profile' : 'Onboard New Employee'}
              </h3>
              <button onClick={() => setIsEmpModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  Employee ID <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., LIPA-2026-102"
                  required
                  className="app-search-input"
                  style={{ paddingLeft: '14px', backgroundColor: isEditMode ? 'var(--color-border-light)' : '#fff' }}
                  value={empFormData.employee_id}
                  onChange={(e) => setEmpFormData({...empFormData, employee_id: e.target.value})}
                  disabled={isEditMode}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    First Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="app-search-input"
                    style={{ paddingLeft: '14px' }}
                    value={empFormData.first_name}
                    onChange={(e) => setEmpFormData({...empFormData, first_name: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    Last Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="app-search-input"
                    style={{ paddingLeft: '14px' }}
                    value={empFormData.last_name}
                    onChange={(e) => setEmpFormData({...empFormData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  Department <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., City Human Resource Management Office"
                  required
                  className="app-search-input"
                  style={{ paddingLeft: '14px' }}
                  value={empFormData.department}
                  onChange={(e) => setEmpFormData({...empFormData, department: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  Position Title <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Administrative Officer V"
                  required
                  className="app-search-input"
                  style={{ paddingLeft: '14px' }}
                  value={empFormData.position_title}
                  onChange={(e) => setEmpFormData({...empFormData, position_title: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
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
