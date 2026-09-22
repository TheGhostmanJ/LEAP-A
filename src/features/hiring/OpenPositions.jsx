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
      const data = await res.json();
      if (res.ok) {
        setPositions(data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load open positions.' });
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
      setMessage({ type: 'error', text: 'Network error loading positions.' });
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

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Application submitted successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit application.' });
      }
    } catch (err) {
      console.error('Error applying:', err);
      setMessage({ type: 'error', text: 'Server error when submitting application.' });
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
          <div className="open-positions-container">
            
            {/* Header Banner */}
            <div className="open-positions-hero">
              <div className="hero-text">
                <h2>Internal Career Opportunities</h2>
                <p>Explore active department vacancies open for internal applications and progression.</p>
              </div>
              <Briefcase size={40} className="hero-icon" />
            </div>

            {/* Notification Alert */}
            {message.text && (
              <div className={`alert-banner ${message.type}`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Positions List */}
            {loading ? (
              <div className="loading-state">
                <Clock className="spinner-icon" size={24} />
                <p>Loading open vacancies...</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={48} className="empty-icon" />
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
