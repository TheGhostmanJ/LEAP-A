import React, { useState, useEffect } from 'react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Search, Building2, Plus, Users, Settings, X } from 'lucide-react';
import './departments.css';

export default function Departments({ onLogout, user }) {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit Modal State
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

  // Handle Create Submission
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
      alert("Department created successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal and pre-fill data
  const handleConfigureClick = (dept) => {
    setEditingDeptId(dept.id);
    setFormData({
      department_id: dept.id, // ID remains read-only during edit
      department_name: dept.name,
      max_capacity: dept.max
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submission
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
      alert("Department updated successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container hod-view-wrapper dept-wrapper-relative">
      <HrSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <div className="title-icon-badge">
              <Building2 size={36} className="title-icon-svg" /> 
            </div>
            <div className="title-text-group">
              <h2>Department Setup</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          <Header user={user} onLogout={onLogout} />
        </header>

        <div className="table-filter-utilities-row dept-utility-row">
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Search departments..." />
          </div>
          <button className="primary-action-trigger-btn" onClick={() => {
            setFormData({ department_id: '', department_name: '', max_capacity: '' });
            setIsModalOpen(true);
          }}>
            <Plus size={16} /> Create Department
          </button>
        </div>

        <section className="content-data-box table-box-margin card-shadow-wrap dept-table-section">
          <div className="box-header-title-maroon-bar">
            Organizational Structure
          </div>

          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Dept Code</th>
                  <th>Department Name</th>
                  <th>Department Head</th>
                  <th>Active Headcount</th>
                  <th>Capacity</th>
                  <th className="text-center">Manage</th>
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
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-status-cell info-text">No departments found. Click "Create Department" to begin.</td>
                  </tr>
                ) : (
                  departments.map((dept) => {
                    const capacityPct = dept.max > 0 ? (dept.headcount / dept.max) * 100 : 0;
                    
                    return (
                      <tr key={dept.id}>
                        <td className="dept-code-cell">{dept.id}</td>
                        <td className="dept-name-cell">{dept.name}</td>
                        <td>{dept.head}</td>
                        <td>
                          <div className="headcount-count-flex">
                            <Users size={14} color="#7a0000" /> {dept.headcount} / {dept.max}
                          </div>
                        </td>
                        <td>
                          <div className="capacity-bar-track">
                            <div 
                              className={`capacity-bar-fill ${capacityPct >= 100 ? 'over-capacity' : 'normal-capacity'}`}
                              style={{ width: `${Math.min(capacityPct, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="action-btn-investigate configure-action-btn"
                            onClick={() => handleConfigureClick(dept)}
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
      </div>

      {/* CREATE & EDIT MODAL (Combined UI logic) */}
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
                  value={formData.department_id}
                  onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  disabled={isEditModalOpen} // Prevent changing the ID when editing
                  style={{ backgroundColor: isEditModalOpen ? '#f1f5f9' : 'white' }}
                />
              </div>

              <div className="form-field-group">
                <label>Department Name <span className="required-star">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., Engineering & Public Works" 
                  required 
                  className="modal-form-input"
                  value={formData.department_name}
                  onChange={(e) => setFormData({...formData, department_name: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, max_capacity: e.target.value})}
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