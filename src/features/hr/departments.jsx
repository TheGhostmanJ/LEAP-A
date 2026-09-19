import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Plus, Users, Settings, X } from 'lucide-react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import './departments.css';

export default function Departments({ onLogout, user }) {
  const navigate = useNavigate();
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
    // UI FIX: Applied standard layout wrapper
    <div className="app-layout-wrapper">
      <HrSidebar user={user} />

      {/* UI FIX: Applied standard main container */}
      <main className="app-main-container fade-in-up" style={{ padding: '32px' }}>
        
        {/* UNIFIED GLOBAL HEADER ROW */}
        <header className="app-global-header">
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* UTILITY ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search departments or codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="app-search-input"
            />
          </div>
          
          <button
            onClick={() => {
              setFormData({ department_id: '', department_name: '', max_capacity: '' });
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={18} /> Create Department
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <section className="app-card">
          <div className="app-card-header">
            Organizational Structure
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {/* UI FIX: Replaced custom table with global record-grid-system */}
            <table className="record-grid-system" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Dept Code</th>
                  <th style={{ width: '30%' }}>Department Name</th>
                  <th style={{ width: '22%' }}>Department Head</th>
                  <th style={{ width: '16%' }}>Active Headcount</th>
                  <th style={{ width: '12%' }}>Capacity</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Manage</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>Loading department records...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-danger)' }}>Error: {error}</td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No departments found.</td>
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
                      <tr key={code}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{code}</td>
                        <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{name}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{head}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                            <Users size={15} color="var(--color-maroon)" />
                            <span>{current} / {max}</span>
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
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleConfigureClick(dept)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
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

      {/* MODAL DIALOG */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="app-modal-overlay" onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }}>
          <div className="app-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-maroon)' }}>
                {isEditModalOpen ? 'Edit Department' : 'New Department'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleUpdateDepartment : handleCreateDepartment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Department Code <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., D05"
                  required
                  maxLength={10}
                  className="app-search-input"
                  style={{ paddingLeft: '14px', backgroundColor: isEditModalOpen ? 'var(--color-border-light)' : '#fff' }}
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  disabled={isEditModalOpen}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Department Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., General Services Office (GSO)"
                  required
                  className="app-search-input"
                  style={{ paddingLeft: '14px' }}
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Maximum Headcount Capacity <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 50"
                  required
                  min={1}
                  className="app-search-input"
                  style={{ paddingLeft: '14px' }}
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
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
