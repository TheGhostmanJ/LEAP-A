import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/sidebar.jsx';
import { Briefcase, CheckCircle, AlertCircle, Clock, Building } from 'lucide-react';
import './OpenPositions.css';

export default function OpenPositions({ user, onLogout }) {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOpenPositions();
  }, []);

  const fetchOpenPositions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/succession/open-positions');
      
      // Check if response is valid JSON before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API endpoint returned HTML instead of JSON (404 or backend route missing).');
      }

      const data = await res.json();
      if (res.ok) {
        setPositions(Array.isArray(data) ? data : []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load open positions.' });
      }
    } catch (err) {
      console.warn('Backend API unavailable, using fallback state:', err.message);
      // Fallback empty list so UI renders smoothly without crashing
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (departmentId) => {
    if (!user?.employee_key) {
      setMessage({ type: 'error', text: 'User session invalid. Please log in again.' });
      return;
    }

    try {
      setApplyingId(departmentId);
      setMessage({ type: '', text: '' });

      const res = await fetch('/api/succession/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: departmentId,
          employee_key: user.employee_key,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server error.');
      }

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Application submitted successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit application.' });
      }
    } catch (err) {
      console.error('Error applying:', err);
      setMessage({ type: 'error', text: 'Server endpoint unavailable.' });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <div className="dashboard-main-content">
        <Header user={user} onLogout={onLogout} />
        <main className="dashboard-page-body">
          <div className="open-positions-container" style={{ padding: '20px' }}>
            
            {/* Header Banner */}
            <div className="open-positions-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="hero-text">
                <h2>Internal Career Opportunities</h2>
                <p>Explore active department vacancies open for internal applications and progression.</p>
              </div>
              <Briefcase size={40} className="hero-icon" />
            </div>

            {/* Notification Alert */}
            {message.text && (
              <div className={`alert-banner ${message.type}`} style={{ marginBottom: '20px', padding: '10px 15px', borderRadius: '6px' }}>
                <span>{message.text}</span>
              </div>
            )}

            {/* Positions List */}
            {loading ? (
              <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
                <Clock className="spinner-icon" size={24} />
                <p>Loading open vacancies...</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '8px' }}>
                <Briefcase size={48} className="empty-icon" style={{ color: '#888', marginBottom: '10px' }} />
                <h3>No Open Vacancies</h3>
                <p>There are currently no open department positions accepting applications.</p>
              </div>
            ) : (
              <div className="positions-grid">
                {positions.map((pos) => (
                  <div className="position-card" key={pos.department_id}>
                    <div className="card-top">
                      <div className="dept-badge">
                        <Building size={16} />
                        <span>{pos.department_name}</span>
                      </div>
                      <span className="stage-pill">{pos.vacancy_stage}</span>
                    </div>

                    <div className="card-body">
                      <h3 className="position-title">{pos.department_name} Leadership Position</h3>
                      <p className="position-desc">
                        Open for internal transfers, succession planning, and lateral growth opportunities.
                      </p>
                    </div>

                    <div className="card-footer">
                      <button
                        type="button"
                        className="apply-btn"
                        disabled={applyingId === pos.department_id}
                        onClick={() => handleApply(pos.department_id)}
                      >
                        {applyingId === pos.department_id ? 'Submitting...' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
