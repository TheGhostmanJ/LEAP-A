import React, { useState, useEffect } from 'react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Search, Building2, Plus, Users, Settings, X } from 'lucide-react';
import './departments.css';

export default function Departments({ onLogout, user }) {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    department_id: '',
    department_name: '',
    max_capacity: ''
  });

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/departments`);

      if (!response.ok) throw new Error('Failed to fetch department data');
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create department');

      await fetchDepartments();
      setIsModalOpen(false);
      setFormData({ department_id: '', department_name: '', max_capacity: '' });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfigureClick = (dept) => {
    setEditingDeptId(dept.department_id || dept.id);
    setFormData({
      department_id: dept.department_id || dept.id,
      department_name: dept.department_name || dept.name,
      max_capacity: dept.max_capacity || dept.max
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/departments/${editingDeptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_name: formData.department_name,
          max_capacity: formData.max_capacity
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update department');

      await fetchDepartments();
      setIsEditModalOpen(false);
      setFormData({ department_id: '', department_name: '', max_capacity: '' });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    const deptName = dept.department_name || dept.name || '';
    const deptId = dept.department_id || dept.id || '';
    return deptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           deptId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    // ADDED BULLETPROOF INLINE LAYOUT CSS TO PREVENT WHITE SCREEN
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <HrSidebar user={user} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Header spanning the top */}
        <header style={{ padding: '16px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* Main Content Viewport */}
        <main style={{ padding: '32px' }} className="fade-in-up dept-wrapper-relative">
          
          <div className="page-title-layout">
            <div className="title-icon-badge">
              <Building2 size={26} className="title-icon-svg" />
            </div>
            <div className="title-text-group">
              <h2>Department Setup</h2>
              <p className="subtitle-department">
                Portal: <span className="highlight-maroon">HR Operations</span>
              </p>
            </div>
          </div>

          <div className="dept-utility-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px' }}>
              <Search size={18} color="#64748b" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search departments or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>
            
            <button
              onClick={() => {
                setFormData({ department_id: '', department_name: '', max_capacity: '' });
                setIsModalOpen(true);
              }}
              style={{ backgroundColor: '#800020', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              <Plus size={18} /> Create Department
            </button>
          </div>

          <section className="dept-table-section" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '16px' }}>
              Organizational Structure
            </div>

            <div className="table-responsive-scroll">
              <table className="record-grid-system" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 24px' }}>Dept Code</th>
                    <th style={{ padding: '16px 24px' }}>Department Name</th>
                    <th style={{ padding: '16px 24px' }}>Department Head</th>
                    <th style={{ padding: '16px 24px' }}>Active Headcount</th>
                    <th style={{ padding: '16px 24px' }}>Capacity</th>
                    <th style={{ padding: '16px 24px' }} className="text-center">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="table-status-cell info-text">Loading department records...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="table-status-cell error-text">Error: {error}</td>
                    </tr>
                  ) : filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="table-status-cell info-text">No departments found.</td>
                    </tr>
                  ) : (
                    filteredDepartments.map((dept) => {
                      const code = dept.department_id || dept.id;
                      const name = dept.department_name || dept.name;
                      const head = dept.head_name || dept.head || 'Unassigned';
                      const current = parseInt(dept.current_headcount || dept.headcount || 0);
                      const max = parseInt(dept.max_capacity || dept.max || 1);
                      const capacityPct = max > 0 ? (current / max) * 100 : 0;

                      return (
                        <tr key={code} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '16px 24px' }} className="dept-code-cell">{code}</td>
                          <td style={{ padding: '16px 24px' }} className="dept-name-cell">{name}</td>
                          <td style={{ padding: '16px 24px', color: '#475569' }}>{head}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <div className="headcount-count-flex">
                              <Users size={15} color="#800020" />
                              <span>{current} / {max}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div className="capacity-bar-track">
                              <div
                                className={`capacity-bar-fill ${capacityPct >= 100 ? 'over-capacity' : 'normal-capacity'}`}
                                style={{ width: `${Math.min(capacityPct, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }} className="actions-cell">
                            <button
                              className="configure-action-btn"
                              onClick={() => handleConfigureClick(dept)}
                              style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}
                            >
                              <Settings size={14} /> Configure
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Modal Dialog */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{isEditModalOpen ? 'Edit Department' : 'New Department'}</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleUpdateDepartment : handleCreateDepartment} className="modal-form">
              <div className="form-field-group">
                <label>Department Code <span className="required-star">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., D05"
                  required
                  maxLength={10}
                  className="modal-form-input"
                  style={{ backgroundColor: isEditModalOpen ? '#f1f5f9' : '#fff' }}
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  disabled={isEditModalOpen}
                />
              </div>

              <div className="form-field-group">
                <label>Department Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., General Services Office (GSO)"
                  required
                  className="modal-form-input"
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label>Maximum Headcount Capacity <span className="required-star">*</span></label>
                <input
                  type="number"
                  placeholder="e.g., 50"
                  required
                  min={1}
                  className="modal-form-input"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="modal-submit-btn"
                >
                  {isSubmitting ? 'Saving...' : (isEditModalOpen ? 'Save Changes' : 'Create Department')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}