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
    setEditingDeptId(dept.id);
    setFormData({
      department_id: dept.id,
      department_name: dept.name,
      max_capacity: dept.max
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

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dept-layout-wrapper">
      <HrSidebar />

      <div className="dept-main-container">
        {/* Top Navbar Header */}
        <header className="dept-global-header">
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* Page Content Body */}
        <main className="dept-main-content">
          <div className="dept-page">
            {/* Header Title Section */}
            <div className="dept-header-row">
              <div className="dept-title-layout">
                <div className="dept-title-icon-badge">
                  <Building2 size={26} />
                </div>
                <div>
                  <h1 className="dept-title">Department Setup</h1>
                  <p className="dept-subtitle">
                    Portal: <span className="dept-subtitle-accent">HR Operations</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="dept-utility-bar">
              <div className="dept-search-wrapper">
                <Search size={18} className="dept-search-icon" />
                <input
                  type="text"
                  className="dept-search-input"
                  placeholder="Search departments or codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="btn-primary-maroon"
                onClick={() => {
                  setFormData({ department_id: '', department_name: '', max_capacity: '' });
                  setIsModalOpen(true);
                }}
              >
                <Plus size={18} /> Create Department
              </button>
            </div>

            {/* Table Container */}
            <section className="dept-card-container">
              <div className="dept-card-header">
                Organizational Structure
              </div>

              <div className="dept-table-scroll">
                <table className="dept-table">
                  <thead>
                    <tr>
                      <th style={{ width: '12%' }}>Dept Code</th>
                      <th style={{ width: '30%' }}>Department Name</th>
                      <th style={{ width: '22%' }}>Department Head</th>
                      <th style={{ width: '16%' }}>Active Headcount</th>
                      <th style={{ width: '12%' }}>Capacity</th>
                      <th style={{ width: '8%' }} className="text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="dept-status-cell info-text">Loading department records...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="dept-status-cell error-text">Error: {error}</td>
                      </tr>
                    ) : filteredDepartments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="dept-status-cell info-text">No departments found.</td>
                      </tr>
                    ) : (
                      filteredDepartments.map((dept) => {
                        const capacityPct = dept.max > 0 ? (dept.headcount / dept.max) * 100 : 0;

                        return (
                          <tr key={dept.id}>
                            <td className="dept-code-cell">{dept.id}</td>
                            <td className="dept-name-cell">{dept.name}</td>
                            <td className="dept-head-cell">{dept.head || 'Unassigned'}</td>
                            <td>
                              <div className="dept-headcount-badge">
                                <Users size={15} color="#7a1220" />
                                <span>{dept.headcount} / {dept.max}</span>
                              </div>
                            </td>
                            <td>
                              <div className="dept-progress-track">
                                <div
                                  className={`dept-progress-bar ${capacityPct >= 100 ? 'over-capacity' : ''}`}
                                  style={{ width: `${Math.min(capacityPct, 100)}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn-action-edit"
                                onClick={() => handleConfigureClick(dept)}
                              >
                                <Settings size={15} /> Configure
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
        </main>
      </div>

      {/* Modal Dialog */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{isEditModalOpen ? 'Edit Department' : 'New Department'}</h2>
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
              <div className="form-group">
                <label className="form-label">Department Code <span className="required-star">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., D05"
                  required
                  maxLength={10}
                  className={`form-input ${isEditModalOpen ? 'input-readonly' : ''}`}
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  disabled={isEditModalOpen}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., General Services Office (GSO)"
                  required
                  className="form-input"
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Maximum Headcount Capacity <span className="required-star">*</span></label>
                <input
                  type="number"
                  placeholder="e.g., 50"
                  required
                  min={1}
                  className="form-input"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="btn-secondary-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary-maroon"
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