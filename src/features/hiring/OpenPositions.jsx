import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Briefcase, Clock, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import './OpenPositions.css';

export default function OpenPositions({ user, onLogout }) {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchOpenPositions();
  }, []);

  const fetchOpenPositions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/succession/vacancies`);

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API route returned non-JSON response.');
      }

      const data = await res.json();
      if (res.ok) {
        setPositions(Array.isArray(data) ? data : []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load open positions.' });
      }
    } catch (err) {
      console.warn('Backend fetch issue:', err.message);
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

      const res = await fetch(`${apiUrl}/api/succession/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: departmentId,
          employee_key: user.employee_key,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response.');
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
    <div className="open-positions-layout">
      <Sidebar user={user} />

      <main className="open-positions-main">
        {/* Unified Top Header Container */}
        <div className="open-positions-header-wrapper">
          <Header user={user} onLogout={onLogout} />
        </div>

        <div className="open-positions-body">
          <div className="open-positions-container">
            
            {/* Inner Page Title */}
            <header className="open-positions-header">
              <div className="header-title-group">
                <h1>Open Positions</h1>
                <p>Explore active department vacancies open for internal applications and growth.</p>
              </div>
              <Briefcase className="header-icon" size={32} />
            </header>

            {/* Notification Alert */}
            {message.text && (
              <div className={`open-positions-alert ${message.type}`}>
                {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Content States */}
            {loading ? (
              <div className="open-positions-loading">
                <Clock className="spinner" size={28} />
                <p>Loading open vacancies...</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="open-positions-empty">
                <Briefcase size={48} className="empty-icon" />
                <h3>No Vacancies Currently Available</h3>
                <p>All department leadership roles are currently fully staffed.</p>
              </div>
            ) : (
              <div className="open-positions-grid">
                {positions.map((pos) => (
                  <article key={pos.department_id} className="position-card">
                    <div className="card-header">
                      <div className="dept-info">
                        <Building size={18} />
                        <span className="dept-name">{pos.department_name}</span>
                      </div>
                      <span className="badge-vacant">Vacant</span>
                    </div>

                    <div className="card-body">
                      <h3 className="role-title">{pos.department_name} Department Head</h3>
                      <p className="role-description">
                        Open for internal transfers, succession planning, and lateral advancement.
                      </p>
                    </div>

                    <div className="card-footer">
                      <button
                        type="button"
                        className="btn-apply"
                        disabled={applyingId === pos.department_id}
                        onClick={() => handleApply(pos.department_id)}
                      >
                        {applyingId === pos.department_id ? 'Submitting...' : 'Apply Now'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
