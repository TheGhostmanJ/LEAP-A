import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GraduationCap,
  Search,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  MapPin,
  Users,
  Filter,
  ExternalLink,
  Info,
  X,
  Target,
  Plus,
  Download
} from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import './trainingrecords.css';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:3001/api';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function computeDuration(startStr, endStr) {
  if (!startStr || !endStr) return 'TBD';
  const start = new Date(startStr);
  const end = new Date(endStr);
  const mins = (end - start) / 60000;
  if (mins <= 0) return 'TBD';
  const hrs = (mins / 60).toFixed(1).replace(/\.0$/, '');
  return `${hrs} hr${hrs !== '1' ? 's' : ''} (${formatTime(startStr)} - ${formatTime(endStr)})`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric'
  });
}

function normalizeEvent(ev) {
  const slotsLeft = ev.capacity != null
    ? Math.max(ev.capacity - Number(ev.registered_count || 0), 0)
    : null;

  return {
    id: ev.event_id,
    name: ev.title,
    rawDate: ev.start_date,
    date: formatDate(ev.start_date),
    duration: computeDuration(ev.start_date, ev.end_date),
    sponsor: ev.department || 'All Departments',
    location: ev.venue || 'TBD',
    slotsLeft,
    imageUrl: ev.image_url || null,
    summary: ev.description || '',
    objectives: ev.objectives ? ev.objectives.split('\n').filter(Boolean) : [],
    status: ev.status
  };
}

export default function TrainingRecords({ onLogout, user }) {
  const employeeKey = user?.employee_key;
  const employeeDepartment = user?.department;

  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    event_type: 'Training',
    event_date: '',
    start_time: '',
    end_time: '',
    department: '',
    venue: '',
    capacity: 20,
    description: '',
    objectives: ''
  });

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({ status: 'Upcoming' });
      if (employeeDepartment) params.set('department', employeeDepartment);
      const res = await fetch(`${API_BASE}/events?${params.toString()}`);
      const data = await res.json();
      const normalized = data.map(normalizeEvent).sort(
        (a, b) => new Date(a.rawDate) - new Date(b.rawDate)
      );
      setEvents(normalized);
    } catch (err) {
      console.error('Failed to load events', err);
    }
  }, [employeeDepartment]);

  const fetchRegistrations = useCallback(async () => {
    if (!employeeKey) return;
    try {
      const res = await fetch(`${API_BASE}/events/employee/${employeeKey}/registered`);
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error('Failed to load registrations', err);
    }
  }, [employeeKey]);

  const fetchDepartments = useCallback(async () => {
    if (user?.role !== 'HR Admin') return;
    try {
      const res = await fetch(`${API_BASE}/departments`);
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  }, [user?.role]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchRegistrations(), fetchDepartments()]).finally(() => setLoading(false));
  }, [fetchEvents, fetchRegistrations, fetchDepartments]);

  const heroEvent = events[0] || null;
  const otherEvents = events.slice(1);

  const isRegisteredFor = (eventKey) =>
    registrations.some(r => r.event_id === eventKey && r.registration_status !== 'Cancelled');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrainings = useMemo(() => {
    return registrations
      .filter(r => r.registration_status !== 'Cancelled' && new Date(r.start_date) >= today)
      .map(r => ({
        id: r.event_id,
        name: r.title,
        date: formatDate(r.start_date),
        duration: computeDuration(r.start_date, r.end_date),
        sponsor: r.department || 'All Departments',
        status: r.registration_status
      }));
  }, [registrations]);

  const completedTrainings = useMemo(() => {
    return registrations
      .filter(r => r.registration_status !== 'Cancelled' && new Date(r.start_date) < today)
      .map(r => ({
        id: r.event_id,
        name: r.title,
        date: formatDate(r.start_date),
        hours: (() => {
          if (!r.start_date || !r.end_date) return '—';
          const mins = (new Date(r.end_date) - new Date(r.start_date)) / 60000;
          return mins > 0 ? (mins / 60).toFixed(1).replace(/\.0$/, '') : '—';
        })(),
        sponsor: r.department || 'All Departments',
        certUrl: r.pdf_url || null
      }));
  }, [registrations]);

  const filteredUpcoming = useMemo(() => {
    return upcomingTrainings.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sponsor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [upcomingTrainings, searchQuery]);

  const filteredCompleted = useMemo(() => {
    return completedTrainings.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sponsor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [completedTrainings, searchQuery]);

  const handleTotalTrainingsClick = () => {
    setActiveTab('completed');
    setSearchQuery('');
  };

  const handleCertificationsClick = () => setIsCertModalOpen(true);

  const handleUpcomingTrainingsClick = () => {
    setActiveTab('upcoming');
    setSearchQuery('');
  };

  const handleJoinEvent = async (eventId) => {
    if (!employeeKey || !eventId) return;
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_key: employeeKey })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to join event.');
        return;
      }
      await Promise.all([fetchEvents(), fetchRegistrations()]);
      setSelectedEventForModal(null);
    } catch (err) {
      console.error('Failed to join event', err);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!employeeKey || !eventId) return;
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await fetch(`${API_BASE}/events/${eventId}/register/${employeeKey}`, { method: 'DELETE' });
      await Promise.all([fetchEvents(), fetchRegistrations()]);
    } catch (err) {
      console.error('Failed to cancel registration', err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newEvent.title || !newEvent.event_date) {
      setFormError('Event name and date are required.');
      return;
    }

    const startTime = newEvent.start_time || '00:00';
    const start_date = `${newEvent.event_date}T${startTime}:00`;
    const end_date = newEvent.end_time ? `${newEvent.event_date}T${newEvent.end_time}:00` : null;

    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          event_type: newEvent.event_type,
          description: newEvent.description,
          objectives: newEvent.objectives,
          department: newEvent.department || null,
          venue: newEvent.venue,
          capacity: newEvent.capacity ? Number(newEvent.capacity) : null,
          start_date,
          end_date,
          created_by: employeeKey
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish event.');
      }
      await fetchEvents();
      setIsAddModalOpen(false);
      setNewEvent({
        title: '', event_type: 'Training', event_date: '', start_time: '', end_time: '',
        department: '', venue: '', capacity: 20,
        description: '', objectives: ''
      });
    } catch (err) {
      setFormError(err.message);
    }
  };

  const heroRegistered = heroEvent ? isRegisteredFor(heroEvent.id) : false;

  return (
    <div className="tr-dashboard-container">
      <RoleSidebar user={user} />

      <main className="tr-main-content fade-in-up">
        <header className="tr-header">
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* METRICS ROW */}
        <section className="tr-metrics-grid">
          <div
            className="tr-summary-card hover-lift"
            onClick={handleTotalTrainingsClick}
            title="Click to view all completed training records"
          >
            <div className="tr-card-label-row">
              <CheckCircle2 size={16} className="tr-icon-maroon" />
              <span>TOTAL TRAININGS</span>
            </div>
            <div className="tr-metric-value">
              {completedTrainings.length} <span className="tr-metric-unit">Completed</span>
            </div>
          </div>

          <div
            className="tr-summary-card hover-lift"
            onClick={handleCertificationsClick}
            title="Click to view all earned certificates"
          >
            <div className="tr-card-label-row">
              <Award size={16} className="tr-icon-maroon" />
              <span>CERTIFICATIONS EARNED</span>
            </div>
            <div className="tr-metric-value">
              {completedTrainings.length} <span className="tr-metric-unit">Active</span>
            </div>
          </div>

          <div
            className="tr-summary-card hover-lift"
            onClick={handleUpcomingTrainingsClick}
            title="Click to view scheduled upcoming trainings"
          >
            <div className="tr-card-label-row">
              <Calendar size={16} className="tr-icon-maroon" />
              <span>UPCOMING TRAININGS</span>
            </div>
            <div className="tr-metric-value">
              {upcomingTrainings.length}{' '}
              <span className="tr-metric-unit">
                Event{upcomingTrainings.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </section>

        {/* HERO BANNER */}
        {loading ? (
          <section className="tr-hero-banner tr-hero-empty"><p>Loading events...</p></section>
        ) : heroEvent ? (
          <section className="tr-hero-banner">
            <div className="tr-hero-left">
              <div className="tr-hero-image-container">
                {heroEvent.imageUrl ? (
                  <img src={heroEvent.imageUrl} alt={heroEvent.name} className="tr-hero-cover-img" />
                ) : (
                  <div className="tr-hero-placeholder">
                    <GraduationCap size={36} color="#ffffff" opacity={0.85} />
                  </div>
                )}
                <span className="tr-event-badge-live">FEATURED</span>
              </div>

              <div className="tr-hero-details">
                <span className="tr-event-category">FEATURED PROGRAM</span>
                <h3 className="tr-hero-title">{heroEvent.name}</h3>
                <div className="tr-hero-metadata">
                  <span><Calendar size={13} /> {heroEvent.date}</span>
                  <span><Clock size={13} /> {heroEvent.duration}</span>
                  <span><Briefcase size={13} /> {heroEvent.sponsor}</span>
                  <span><MapPin size={13} /> {heroEvent.location}</span>
                </div>
              </div>
            </div>

            <div className="tr-hero-right">
              <div className="tr-slots-row">
                <Users size={14} />
                <span>{heroEvent.slotsLeft === null ? 'Unlimited slots' : `${heroEvent.slotsLeft} Slots remaining`}</span>
              </div>

              <div className="tr-hero-action-btns">
                <button className="tr-secondary-btn" onClick={() => setSelectedEventForModal(heroEvent)}>
                  <Info size={14} /> View Details
                </button>

                {heroRegistered ? (
                  <button className="tr-joined-btn" onClick={() => handleCancelRegistration(heroEvent.id)}>
                    ✓ Joined — Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinEvent(heroEvent.id)}
                    disabled={heroEvent.slotsLeft === 0}
                    className="tr-primary-btn"
                  >
                    {heroEvent.slotsLeft === 0 ? 'Fully Booked' : 'Join Event'}
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="tr-hero-banner tr-hero-empty"><p>No upcoming events posted yet.</p></section>
        )}

        {/* OTHER UPCOMING EVENTS GRID */}
        {otherEvents.length > 0 && (
          <section className="tr-grid-wrapper">
            <h4 className="tr-grid-heading">More Upcoming Events</h4>
            <div className="tr-grid-container">
              {otherEvents.map((ev) => {
                const registered = isRegisteredFor(ev.id);
                return (
                  <div key={ev.id} className="tr-grid-card">
                    {ev.imageUrl ? (
                      <div className="tr-card-image" style={{ backgroundImage: `url(${ev.imageUrl})` }} />
                    ) : (
                      <div className="tr-card-placeholder">
                        <GraduationCap size={32} color="#ffffff" opacity={0.8} />
                      </div>
                    )}
                    <div className="tr-card-body">
                      <span className="tr-card-category">{ev.sponsor}</span>
                      <strong className="tr-card-title">{ev.name}</strong>
                      <div className="tr-card-meta">
                        <Calendar size={12} />
                        <span>{ev.date}</span>
                      </div>
                      <div className="tr-card-actions">
                        <button className="tr-secondary-btn sm" onClick={() => setSelectedEventForModal(ev)}>
                          Details
                        </button>
                        {registered ? (
                          <button className="tr-joined-btn sm" onClick={() => handleCancelRegistration(ev.id)}>
                            ✓ Joined
                          </button>
                        ) : (
                          <button
                            className={`tr-primary-btn sm ${ev.slotsLeft === 0 ? 'disabled' : ''}`}
                            disabled={ev.slotsLeft === 0}
                            onClick={() => handleJoinEvent(ev.id)}
                          >
                            {ev.slotsLeft === 0 ? 'Full' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SEARCH & CONTROLS ROW */}
        <section className="tr-controls-row">
          <div className="tr-search-wrapper">
            <Search size={14} className="tr-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search training name or sponsor..."
              className="tr-search-input"
            />
          </div>

          <div className="tr-filter-actions">
            {user?.role === 'HR Admin' && (
              <button className="tr-primary-btn flex-btn" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={14} />
                <span>Post New Event</span>
              </button>
            )}
            <button className="tr-date-picker-btn">
              <Filter size={14} />
              <span>Filter View</span>
            </button>
          </div>
        </section>

        {/* TABBED RECORDS TABLE WORKSPACE */}
        <section className="tr-table-card">
          <div className="tr-tabs-header">
            <button
              className={`tr-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Trainings ({filteredUpcoming.length})
            </button>
            <button
              className={`tr-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Trainings ({filteredCompleted.length})
            </button>
          </div>

          <div className="tr-table-wrapper">
            {activeTab === 'upcoming' && (
              <table className="tr-data-table">
                <thead>
                  <tr>
                    <th>Training Name</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Sponsor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUpcoming.length > 0 ? (
                    filteredUpcoming.map((item) => (
                      <tr key={item.id}>
                        <td className="tr-td-bold">{item.name}</td>
                        <td>{item.date}</td>
                        <td>{item.duration}</td>
                        <td>{item.sponsor}</td>
                        <td>
                          <span className="tr-pill-status scheduled">{item.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="tr-empty-state-cell">No upcoming trainings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'completed' && (
              <table className="tr-data-table">
                <thead>
                  <tr>
                    <th>Training Name</th>
                    <th>Date Completed</th>
                    <th>Hours</th>
                    <th>Sponsor</th>
                    <th className="tr-th-right">Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompleted.length > 0 ? (
                    filteredCompleted.map((item) => (
                      <tr key={item.id}>
                        <td className="tr-td-bold">{item.name}</td>
                        <td>{item.date}</td>
                        <td>{item.hours} hrs</td>
                        <td>{item.sponsor}</td>
                        <td className="tr-td-right">
                          <button
                            className="tr-cert-link-btn"
                            onClick={() => item.certUrl
                              ? window.open(item.certUrl, '_blank')
                              : alert('Certificate not yet issued for this training.')}
                          >
                            <ExternalLink size={13} /> View Cert
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="tr-empty-state-cell">No completed trainings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* COMPLIANCE FOOTER */}
        <footer className="tr-footer-notice">
          <AlertCircle size={14} />
          <span>
            Training hours are synchronized directly with your official HR record updates.
          </span>
        </footer>
      </main>

      {/* MODALS */}
      {isCertModalOpen && (
        <div className="tr-modal-overlay" onClick={() => setIsCertModalOpen(false)}>
          <div className="tr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="tr-modal-header">
              <div className="tr-modal-title-box">
                <span className="tr-event-category">VERIFIED CREDENTIALS</span>
                <h3>My Earned Certifications ({completedTrainings.length})</h3>
              </div>
              <button className="tr-modal-close-btn" onClick={() => setIsCertModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="tr-modal-body">
              {completedTrainings.length > 0 ? (
                completedTrainings.map((cert) => (
                  <div key={cert.id} className="tr-cert-item-card">
                    <div className="tr-cert-item-info">
                      <Award size={22} className="tr-icon-maroon" />
                      <div>
                        <strong className="tr-cert-title">{cert.name}</strong>
                        <p className="tr-cert-sub">
                          Issued by {cert.sponsor} • {cert.date} ({cert.hours} hrs)
                        </p>
                      </div>
                    </div>
                    <button
                      className="tr-cert-download-btn"
                      onClick={() => cert.certUrl
                        ? window.open(cert.certUrl, '_blank')
                        : alert('Certificate not yet issued for this training.')}
                    >
                      <Download size={13} /> View / PDF
                    </button>
                  </div>
                ))
              ) : (
                <p className="tr-empty-state-cell">No certifications earned yet.</p>
              )}
            </div>

            <div className="tr-modal-footer">
              <button className="tr-secondary-btn" onClick={() => setIsCertModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedEventForModal && (
        <div className="tr-modal-overlay" onClick={() => setSelectedEventForModal(null)}>
          <div className="tr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="tr-modal-header">
              <div className="tr-modal-title-box">
                <span className="tr-event-category">TRAINING DETAILS</span>
                <h3>{selectedEventForModal.name}</h3>
              </div>
              <button className="tr-modal-close-btn" onClick={() => setSelectedEventForModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="tr-modal-body">
              {selectedEventForModal.imageUrl ? (
                <img src={selectedEventForModal.imageUrl} alt={selectedEventForModal.name} className="tr-modal-banner-img" />
              ) : (
                <div className="tr-modal-placeholder">
                  <GraduationCap size={44} color="#ffffff" opacity={0.8} />
                </div>
              )}

              <div className="tr-modal-info-grid">
                <div><strong>Date:</strong> {selectedEventForModal.date}</div>
                <div><strong>Duration:</strong> {selectedEventForModal.duration}</div>
                <div><strong>Sponsor:</strong> {selectedEventForModal.sponsor}</div>
                <div><strong>Venue:</strong> {selectedEventForModal.location}</div>
              </div>

              {selectedEventForModal.summary && (
                <div className="tr-modal-section">
                  <h4><Info size={15} /> Event Overview</h4>
                  <p>{selectedEventForModal.summary}</p>
                </div>
              )}

              {selectedEventForModal.objectives && selectedEventForModal.objectives.length > 0 && (
                <div className="tr-modal-section">
                  <h4><Target size={15} /> Key Learning Objectives</h4>
                  <ul>
                    {selectedEventForModal.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="tr-modal-footer">
              <button className="tr-secondary-btn" onClick={() => setSelectedEventForModal(null)}>Close</button>
              {isRegisteredFor(selectedEventForModal.id) ? (
                <button className="tr-joined-btn" onClick={() => handleCancelRegistration(selectedEventForModal.id)}>
                  ✓ Joined — Cancel
                </button>
              ) : (
                <button
                  onClick={() => handleJoinEvent(selectedEventForModal.id)}
                  disabled={selectedEventForModal.slotsLeft === 0}
                  className="tr-primary-btn"
                >
                  {selectedEventForModal.slotsLeft === 0 ? 'Fully Booked' : 'Confirm Registration'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="tr-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="tr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="tr-modal-header">
              <h3>Post New Training Event</h3>
              <button className="tr-modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="tr-modal-body">
              {formError && (
                <p className="tr-form-error">{formError}</p>
              )}

              <input
                type="text"
                placeholder="Training Title"
                required
                className="tr-form-input"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />

              <div className="tr-form-row">
                <select
                  className="tr-form-input"
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                >
                  {['Training', 'Seminar', 'Workshop', 'Conference', 'Other'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  className="tr-form-input"
                  value={newEvent.department}
                  onChange={(e) => setNewEvent({ ...newEvent, department: e.target.value })}
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id || d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="tr-form-row">
                <input
                  type="date"
                  required
                  className="tr-form-input"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Slots Available (blank = unlimited)"
                  className="tr-form-input"
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                />
              </div>

              <div className="tr-form-row">
                <input
                  type="time"
                  className="tr-form-input"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                />
                <input
                  type="time"
                  className="tr-form-input"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                />
              </div>

              <input
                type="text"
                placeholder="Location / Venue"
                required
                className="tr-form-input"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
              />

              <textarea
                placeholder="Event Summary / Description..."
                rows="2"
                className="tr-form-input"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />

              <textarea
                placeholder={'Objectives (one per line)'}
                rows="3"
                className="tr-form-input"
                value={newEvent.objectives}
                onChange={(e) => setNewEvent({ ...newEvent, objectives: e.target.value })}
              />

              <div className="tr-modal-footer">
                <button type="button" className="tr-secondary-btn" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="tr-primary-btn">
                  Publish Training
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
