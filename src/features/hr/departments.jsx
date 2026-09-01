import React, { useState, useEffect } from 'react';
import HrSidebar from '../../components/hr-sidebar';
import { Bell, Search, Building2, Plus, Users, Settings, X } from 'lucide-react';

export default function Departments({ onLogout, user }) {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    department_id: '',
    department_name: '',
    max_capacity: ''
  });

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/departments');
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

  // Handle Form Submission
  // Handle Form Submission
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Replace lines 49-56 in departments.jsx with this temporary check:
const contentType = response.headers.get("content-type");
if (!contentType || !contentType.includes("application/json")) {
  const htmlError = await response.text();
  console.error("Received HTML Error from Server:", htmlError);
  throw new Error(`Server returned HTML error (${response.status} ${response.statusText}). Check your browser console.`);
}

      // 2. Now it is safe to parse
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create department');
      }

      // Refresh the table, close modal, and reset form
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

  // Reusable input styling for the modal
  const inputStyle = {
    padding: '8px 12px',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#111827',
    marginTop: '6px'
  };

  return (
    <div className="dashboard-container hod-view-wrapper" style={{ position: 'relative' }}>
      <HrSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Building2 size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Department Setup</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
            </button>
            <div className="user-profile-badge">
              <span className="profile-icon-avatar">👤</span>
              <span className="profile-name-string">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'HR Admin'}</span>
            </div>
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        <div className="table-filter-utilities-row" style={{ marginTop: '24px' }}>
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Search departments..." />
          </div>
          <button className="primary-action-trigger-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Create Department
          </button>
        </div>

        <section className="content-data-box table-box-margin card-shadow-wrap" style={{ marginTop: '24px' }}>
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
                  <th style={{ textAlign: 'center' }}>Manage</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      Loading department records...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#dc2626' }}>
                      Error: {error}
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      No departments found. Click "Create Department" to begin.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => {
                    const capacityPct = dept.max > 0 ? (dept.headcount / dept.max) * 100 : 0;
                    
                    return (
                      <tr key={dept.id}>
                        <td style={{ color: '#6b7280', fontWeight: '500' }}>{dept.id}</td>
                        <td style={{ fontWeight: '700', color: '#1a202c' }}>{dept.name}</td>
                        <td>{dept.head}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                            <Users size={14} color="#7a0000" /> {dept.headcount} / {dept.max}
                          </div>
                        </td>
                        <td>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(capacityPct, 100)}%`, height: '100%', backgroundColor: capacityPct >= 100 ? '#dc2626' : '#7a0000' }}></div>
                          </div>
                        </td>
                        <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button className="action-btn-investigate" style={{ padding: '6px 12px' }}>
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

      {/* CREATE DEPARTMENT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '32px',
            width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: '700' }}>New Department</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Department Code <span style={{ color: '#dc2626' }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., D05" 
                  required 
                  maxLength={10}
                  style={inputStyle}
                  value={formData.department_id}
                  onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Department Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., Engineering & Public Works" 
                  required 
                  style={inputStyle}
                  value={formData.department_name}
                  onChange={(e) => setFormData({...formData, department_name: e.target.value})}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Maximum Headcount Capacity <span style={{ color: '#dc2626' }}>*</span></label>
                <input 
                  type="number" 
                  placeholder="e.g., 50" 
                  required 
                  min={1}
                  style={inputStyle}
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({...formData, max_capacity: e.target.value})}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ padding: '8px 16px', background: '#5a0000', color: 'white', border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}