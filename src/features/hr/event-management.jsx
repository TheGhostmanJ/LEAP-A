import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Users, Plus, Pencil, XCircle, Upload, 
  Tag, GraduationCap, Presentation, Briefcase, Compass, Sparkles 
} from 'lucide-react';

import HrSidebar from '../../components/hr-sidebar';
import Header from '../../components/Header';
import './event-management.css';

// FIXED: Use dynamic environment variable matching the rest of the system
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:3001/api';

const EVENT_TYPES = ['Training', 'Seminar', 'Workshop', 'Conference', 'Other'];

const EMPTY_FORM = {
  title: '',
  description: '',
  objectives: '',
  department: '',
  event_type: 'Training',
  event_date: '',
  start_time: '',
  end_time: '',
  venue: '',
  capacity: ''
};

export default function EventManagement({ currentUserEmployeeKey, user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    fetchDepartments();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE}/departments`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    resetImageState();
    setError('');
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    const start = event.start_date ? new Date(event.start_date) : null;
    const end = event.end_date ? new Date(event.end_date) : null;

    setForm({
      title: event.title || '',
      description: event.description || '',
      objectives: event.objectives || '',
      department: event.department || '',
      event_type: event.event_type || 'Training',
      event_date: start ? start.toISOString().slice(0, 10) : '',
      start_time: start ? start.toTimeString().slice(0, 5) : '',
      end_time: end ? end.toTimeString().slice(0, 5) : '',
      venue: event.venue || '',
      capacity: event.capacity || ''
    });
    setImageFile(null);
    setImagePreview(event.image_url ? toAbsoluteUrl(event.image_url) : null);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('objectives', form.objectives);
    fd.append('event_type', form.event_type);
    fd.append('venue', form.venue);
    if (form.capacity) fd.append('capacity', form.capacity);
    if (form.department) fd.append('department', form.department);

    if (form.event_date) {
      const startTime = form.start_time || '00:00';
      fd.append('start_date', `${form.event_date}T${startTime}:00`);
      if (form.end_time) {
        fd.append('end_date', `${form.event_date}T${form.end_time}:00`);
      }
    }

    if (currentUserEmployeeKey) fd.append('created_by', currentUserEmployeeKey);
    if (imageFile) fd.append('cover_image', imageFile);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.event_date) {
      setError('Event name and date are required.');
      return;
    }

    try {
      const url = editingEvent
        ? `${API_BASE}/events/${editingEvent.event_id}`
        : `${API_BASE}/events`;
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: buildFormData() // Sends as multipart/form-data
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Something went wrong.');
      }

      setShowModal(false);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm('Cancel this event? Employees will no longer see it as active.')) return;
    try {
      await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) {
      console.error('Failed to cancel event', err);
    }
  };

  const renderEventTypeIcon = (type) => {
    switch (type) {
      case 'Training': return <GraduationCap size={15} />;
      case 'Seminar': return <Presentation size={15} />;
      case 'Workshop': return <Briefcase size={15} />;
      case 'Conference': return <Compass size={15} />;
      default: return <Sparkles size={15} />;
    }
  };

  // Utility to ensure image paths resolve correctly
  function toAbsoluteUrl(imagePath) {
    if (!imagePath) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return `${base}${imagePath}`;
  }

  return (
    <div className="event-layout-wrapper">
      <HrSidebar activeTab="events" />

      <div className="event-main-container">
        <header className="event-global-header">
          <Header user={user} onLogout={onLogout} />
        </header>

        <main className="event-main-content">
          <div className="event-page">
            
            <div className="event-header-row">
              <div className="event-title-layout">
                <div className="event-title-icon-badge">
                  <Calendar size={30} />
                </div>
                <div>
                  <h1 className="event-title">Event Management</h1>
                  <p className="event-subtitle">
                    Portal: <span className="event-subtitle-accent">{user?.department || 'HR Operations'}</span>
                  </p>
                </div>
              </div>

              <button type="button" className="btn-primary-maroon" onClick={openCreateModal}>
                <Plus size={20} />
                Assign New Event
              </button>
            </div>

            <h3 className="event-section-heading">Active Trainings & Events</h3>

            {loading ? (
              <div className="event-empty-state"><p>Loading events...</p></div>
            ) : !Array.isArray(events) || events.length === 0 ? (
              <div className="event-empty-state"><p>No active events found. Create one to get started.</p></div>
            ) : (
              <div className="event-grid">
                {events.map(ev => {
                  const regCount = ev.registered_count || 0;
                  const capacity = ev.capacity ? parseInt(ev.capacity) : 0;
                  const percentFilled = capacity > 0 ? Math.min(100, Math.round((regCount / capacity) * 100)) : 0;

                  return (
                    <div key={ev.event_id} className="event-card">
                      <div
                        className="event-card-image"
                        style={{
                          backgroundImage: ev.image_url
                            ? `url(${toAbsoluteUrl(ev.image_url)})`
                            : 'linear-gradient(135deg, #7a1220, #961b2c)'
                        }}
                      >
                        <span className="event-type-pill">
                          {renderEventTypeIcon(ev.event_type)}
                          {ev.event_type || 'Event'}
                        </span>
                        <span className={`event-status-badge badge-${(ev.status || 'upcoming').toLowerCase()}`}>
                          {ev.status || 'Upcoming'}
                        </span>
                      </div>

                      <div className="event-card-body">
                        <h4 className="event-card-title">{ev.title}</h4>

                        <div className="event-meta-group">
                          <div className="event-meta-item">
                            <Calendar size={16} className="event-meta-icon" />
                            <span>{new Date(ev.start_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="event-meta-item">
                            <MapPin size={16} className="event-meta-icon" />
                            <span>{ev.venue || 'TBD'}</span>
                          </div>
                          <div className="event-meta-item">
                            <Tag size={16} className="event-meta-icon" />
                            <span>{ev.department || 'All Departments'}</span>
                          </div>
                        </div>

                        <div className="event-capacity-box">
                          <div className="event-capacity-header">
                            <span className="event-capacity-label">
                              <Users size={14} /> Registrations
                            </span>
                            <span className="event-capacity-count">{regCount}{capacity ? ` / ${capacity}` : ' signed up'}</span>
                          </div>
                          <div className="event-progress-track">
                            <div className="event-progress-bar" style={{ width: `${percentFilled}%` }} />
                          </div>
                        </div>

                        <div className="event-card-footer">
                          <button type="button" className="btn-action-icon btn-action-edit" onClick={() => openEditModal(ev)}>
                            <Pencil size={15} /> Edit
                          </button>
                          {ev.status !== 'Cancelled' && (
                            <button type="button" className="btn-action-icon btn-action-cancel" onClick={() => handleCancelEvent(ev.event_id)}>
                              <XCircle size={15} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal View */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              className="modal-dropzone"
              style={{
                backgroundImage: imagePreview ? `url(${imagePreview})` : 'none'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!imagePreview && (
                <div className="modal-dropzone-empty">
                  <Upload size={32} />
                  <span>Click to upload cover image</span>
                  <span className="modal-dropzone-hint">PNG or JPG, up to 5MB</span>
                </div>
              )}
              {imagePreview && (
                <div className="modal-dropzone-overlay">Click to change cover image</div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            <div className="modal-body">
              <h2 className="modal-title">
                {editingEvent ? 'Edit Event Details' : 'Assign New Event / Training'}
              </h2>

              {error && <div className="error-alert">{error}</div>}

              <form onSubmit={handleSubmit} className="modal-form">
                <div>
                  <label className="form-label">Event Title *</label>
                  <input
                    className="form-input" name="title" value={form.title}
                    onChange={handleChange} placeholder="e.g. Q3 Cybersecurity Awareness Training"
                  />
                </div>

                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">Event Type</label>
                    <select className="form-select" name="event_type" value={form.event_type} onChange={handleChange}>
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-col">
                    <label className="form-label">Target Department</label>
                    <select className="form-select" name="department" value={form.department} onChange={handleChange}>
                      <option value="">All Departments</option>
                      {Array.isArray(departments) && departments.map(d => (
                        <option key={d.id || d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea" name="description" value={form.description}
                    onChange={handleChange} rows={3} placeholder="Brief description of the event..."
                  />
                </div>

                <div>
                  <label className="form-label">Objectives</label>
                  <textarea
                    className="form-textarea" name="objectives" value={form.objectives}
                    onChange={handleChange} rows={2} placeholder="Key takeaways for attendees..."
                  />
                </div>

                <div>
                  <label className="form-label">Max Capacity (optional)</label>
                  <input
                    className="form-input" type="number" name="capacity"
                    value={form.capacity} onChange={handleChange} placeholder="Unlimited"
                  />
                </div>

                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">Date *</label>
                    <input className="form-input" type="date" name="event_date" value={form.event_date} onChange={handleChange} />
                  </div>
                  <div className="form-col">
                    <label className="form-label">Start Time</label>
                    <input className="form-input" type="time" name="start_time" value={form.start_time} onChange={handleChange} />
                  </div>
                  <div className="form-col">
                    <label className="form-label">End Time</label>
                    <input className="form-input" type="time" name="end_time" value={form.end_time} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Venue</label>
                  <input
                    className="form-input" name="venue" value={form.venue}
                    onChange={handleChange} placeholder="e.g. City Hall Function Room"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-cancel" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-maroon">
                    {editingEvent ? 'Save Changes' : 'Publish Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}