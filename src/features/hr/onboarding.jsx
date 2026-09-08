import React, { useState, useEffect } from 'react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Users, Search, CheckCircle, Clock, X, CheckSquare, Square, Save } from 'lucide-react';
import './onboarding.css';

export default function Onboarding({ onLogout, user }) {
  const [newHires, setNewHires] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [activeHire, setActiveHire] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOnboardingData = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/onboarding`);
      
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setNewHires(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const openChecklistModal = (hire) => {
    setActiveHire({ ...hire });
    setIsChecklistOpen(true);
  };

  const handleToggleChecklist = (field) => {
    setActiveHire(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveChecklist = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/onboarding/${activeHire.onboarding_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          it_provisioning_done: activeHire.it_provisioning_done,
          documents_submitted: activeHire.documents_submitted,
          setup_status: activeHire.setup_status
        })
      });

      if (!response.ok) throw new Error('Failed to save checklist');

      await fetchOnboardingData();
      setIsChecklistOpen(false);
    } catch (err) {
      alert("Error saving progress: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHires = newHires.filter(hire => 
    hire.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hire.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container hod-view-wrapper">
      <HrSidebar />

      <div className="dashboard-main-content">
        {/* GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <div className="title-icon-badge">
              <Users size={36} className="title-icon-svg" /> 
            </div>
            <div className="title-text-group">
              <h2>Onboarding Tracker</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* UTILITY BAR */}
        <div className="table-filter-utilities-row onboarding-utility-bar">
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input 
              type="text" 
              className="utility-search-field" 
              placeholder="Search by name or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <section className="content-data-box table-box-margin card-shadow-wrap onboarding-table-card">
          <div className="box-header-title-maroon-bar">
            Active Onboarding Pipelines
          </div>

          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th className="text-center">IT Setup</th>
                  <th className="text-center">HR Docs</th>
                  <th>Overall Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '24px', color: '#64748b' }}>Loading tracker data...</td>
                  </tr>
                ) : filteredHires.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '24px', color: '#64748b' }}>No active onboardings found.</td>
                  </tr>
                ) : (
                  filteredHires.map((hire) => (
                    <tr key={hire.onboarding_id}>
                      <td className="hire-name-cell" style={{ fontWeight: '600' }}>{hire.employee_name}</td>
                      <td>{hire.department}</td>
                      <td>{hire.position_title}</td>
                      
                      <td className="text-center">
                        {hire.it_provisioning_done ? 
                          <CheckCircle size={16} color="#059669" /> : 
                          <Clock size={16} color="#94a3b8" />
                        }
                      </td>
                      <td className="text-center">
                        {hire.documents_submitted ? 
                          <CheckCircle size={16} color="#059669" /> : 
                          <Clock size={16} color="#94a3b8" />
                        }
                      </td>

                      <td>
                        <span className={`status-badge ${hire.setup_status === 'Completed' ? 'status-approved' : 'status-pending'}`} style={{ fontSize: '12px' }}>
                          {hire.setup_status}
                        </span>
                      </td>
                      
                      <td className="actions-cell text-center">
                        <button 
                          className="action-btn-investigate profile-action-btn"
                          onClick={() => openChecklistModal(hire)}
                        >
                          <CheckSquare size={14} /> Update
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
      {/* CHECKLIST UPDATE MODAL                     */}
      {/* ========================================== */}
      {isChecklistOpen && activeHire && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Onboarding Progress</h3>
              <button onClick={() => setIsChecklistOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveChecklist} className="modal-form">
              <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '18px', color: '#1e293b' }}>
                  {activeHire.employee_name}
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                  {activeHire.position_title} | {activeHire.department}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#0f172a' }}>
                  Target Start Date: <strong>{new Date(activeHire.target_start_date).toLocaleDateString()}</strong>
                </p>
              </div>
              
              <div className="form-field-group">
                <label>Preparation Checklist</label>
                
                <div 
                  onClick={() => handleToggleChecklist('it_provisioning_done')}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer', marginBottom: '12px' }}
                >
                  {activeHire.it_provisioning_done ? <CheckSquare size={20} color="#059669" /> : <Square size={20} color="#94a3b8" />}
                  <span style={{ fontSize: '14px', fontWeight: activeHire.it_provisioning_done ? '600' : '400', color: activeHire.it_provisioning_done ? '#059669' : '#334155' }}>
                    IT Equipment & Accounts Provisioned
                  </span>
                </div>

                <div 
                  onClick={() => handleToggleChecklist('documents_submitted')}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {activeHire.documents_submitted ? <CheckSquare size={20} color="#059669" /> : <Square size={20} color="#94a3b8" />}
                  <span style={{ fontSize: '14px', fontWeight: activeHire.documents_submitted ? '600' : '400', color: activeHire.documents_submitted ? '#059669' : '#334155' }}>
                    Pre-employment Documents Submitted
                  </span>
                </div>
              </div>

              <div className="form-field-group" style={{ marginTop: '20px' }}>
                <label>Overall Setup Status</label>
                <select 
                  className="modal-form-input"
                  value={activeHire.setup_status}
                  onChange={(e) => setActiveHire({...activeHire, setup_status: e.target.value})}
                  style={{ backgroundColor: 'white' }}
                >
                  <option value="Pending Setup">Pending Setup</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="modal-actions-row" style={{ marginTop: '32px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsChecklistOpen(false)}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="modal-submit-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  {isSubmitting ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}