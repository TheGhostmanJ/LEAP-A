import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, X, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import './hiring.css';

export default function Hiring({ onLogout, user }) {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Shortlist modal state
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [activeVacancy, setActiveVacancy] = useState(null);
  const [shortlist, setShortlist] = useState([]);
  const [isShortlistLoading, setIsShortlistLoading] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchVacancies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/succession/vacancies`);
      if (!response.ok) throw new Error('Failed to fetch vacancy data');
      const data = await response.json();
      setVacancies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchShortlist = async (departmentId) => {
    setIsShortlistLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/succession/shortlist/${departmentId}`);
      if (!response.ok) throw new Error('Failed to fetch shortlist');
      const data = await response.json();
      setShortlist(data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsShortlistLoading(false);
    }
  };

  const handleViewShortlist = async (vacancy) => {
    setActiveVacancy(vacancy);
    setIsShortlistOpen(true);
    await fetchShortlist(vacancy.department_id);
  };

  const handleSendOffer = async (employeeKey) => {
    setIsActionSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/succession/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: activeVacancy.department_id,
          employee_key: employeeKey,
          offer_rank: 1
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send offer');

      await fetchShortlist(activeVacancy.department_id);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleRespond = async (offerId, status) => {
    setIsActionSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/succession/respond/${offerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to record response');

      await fetchShortlist(activeVacancy.department_id);

      // If accepted, the vacancy is resolved — refresh the main list and close the modal
      if (status === 'Accepted') {
        await fetchVacancies();
        setIsShortlistOpen(false);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const filteredVacancies = vacancies.filter((v) => {
    const name = v.department_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Find the currently "Offered" candidate in the shortlist, if any
  const currentOffer = shortlist.find((c) => c.offer_status === 'Offered');
  const nextCandidate = !currentOffer
    ? shortlist.find((c) => !c.offer_status)
    : null;

  return (
    <div className="app-layout-wrapper">
      <HrSidebar user={user} />

      <main
        className="app-main-container app-main-content fade-in-up"
        style={{ padding: '32px', overflowY: 'auto', flex: 1 }}
      >
        <header className="app-global-header">
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search vacant departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="app-search-input"
            />
          </div>
        </div>

        <section className="app-card">
          <div className="app-card-header">
            Position Vacancies — Succession Tracking
          </div>

          <div>
            <table className="record-grid-system" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '14%' }}>Dept Code</th>
                  <th style={{ width: '34%' }}>Department</th>
                  <th style={{ width: '30%' }}>Last Department Head</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>Loading vacancy records...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-danger)' }}>Error: {error}</td>
                  </tr>
                ) : filteredVacancies.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No open vacancies. All department head positions are filled.</td>
                  </tr>
                ) : (
                  filteredVacancies.map((v) => {
                    const headName = v.first_name ? `${v.first_name} ${v.last_name}` : 'Unassigned';
                    return (
                      <tr key={v.department_id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{v.department_id}</td>
                        <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{v.department_name}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{headName}</td>
                        <td>
                          <span className="hiring-status-badge vacant">
                            <Briefcase size={13} /> Vacant
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleViewShortlist(v)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Users size={14} /> Shortlist
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

      {/* SHORTLIST MODAL */}
      {isShortlistOpen && (
        <div className="app-modal-overlay" onClick={() => setIsShortlistOpen(false)}>
          <div className="app-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-maroon)' }}>
                Succession Shortlist
              </h2>
              <button
                onClick={() => setIsShortlistOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {activeVacancy?.department_name} — ranked by seniority (hire date). Credentials are HR's call; this list is a starting point, not a decision.
            </p>

            {isShortlistLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>Loading candidates...</div>
            ) : shortlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No active employees found in this department.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {shortlist.map((c) => {
                  const isOffered = c.offer_status === 'Offered';
                  const isDeclined = c.offer_status === 'Declined';
                  const isAccepted = c.offer_status === 'Accepted';
                  const isEligibleForOffer = !currentOffer && !c.offer_status;

                  return (
                    <div key={c.employee_key} className="hiring-candidate-row">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          {c.first_name} {c.last_name}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                          {c.position_title} · {Math.floor(c.years_of_service)} yrs of service · Hired {new Date(c.hire_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isAccepted && (
                          <span className="hiring-status-badge accepted"><CheckCircle2 size={13} /> Accepted</span>
                        )}
                        {isDeclined && (
                          <span className="hiring-status-badge declined"><XCircle size={13} /> Declined</span>
                        )}
                        {isOffered && (
                          <>
                            <span className="hiring-status-badge offered"><Clock size={13} /> Offer Pending</span>
                            <button
                              className="btn-secondary"
                              disabled={isActionSubmitting}
                              onClick={() => handleRespond(c.offer_id, 'Accepted')}
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              Accept
                            </button>
                            <button
                              className="btn-secondary"
                              disabled={isActionSubmitting}
                              onClick={() => handleRespond(c.offer_id, 'Declined')}
                              style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--color-danger)' }}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {isEligibleForOffer && (
                          <button
                            className="btn-primary"
                            disabled={isActionSubmitting}
                            onClick={() => handleSendOffer(c.employee_key)}
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            Send Offer <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
