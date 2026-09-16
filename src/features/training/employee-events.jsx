import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, CheckCircle, Sparkles, X } from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import './employee-events.css';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:3001/api';

export default function EmployeeEvents({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [registeredKeys, setRegisteredKeys] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.employee_key) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dept = user?.department || '';
      // Fetch available events for this department (or 'All Departments')
      // Fetch the user's current registrations
      const [eventsRes, registeredRes] = await Promise.all([
        fetch(`${API_BASE}/events?department=${encodeURIComponent(dept)}`),
        fetch(`${API_BASE}/events/employee/${user.employee_key}/registered`)
      ]);
      
      if (eventsRes.ok && registeredRes.ok) {
        const eventsData = await eventsRes.json();
        const registeredData = await registeredRes.json();

        // Filter to only show future/ongoing events that are not cancelled
        const availableEvents = eventsData.filter(e => e.status !== 'Cancelled');
        setEvents(availableEvents);
        
        setRegisteredKeys(new Set(registeredData.map(e => e.event_id)));
      }
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (eventId) => {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_key: user.employee_key })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to join event.');
        return;
      }
      
      setRegisteredKeys(prev => new Set(prev).add(eventId));
      // Locally increment count for instant UI feedback
      setEvents(prev => prev.map(ev => 
        ev.event_id === eventId ? { ...ev, registered_count: parseInt(ev.registered_count || 0) + 1 } : ev
      ));
    } catch (err) {
      console.error('Failed to join event', err);
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm('Cancel your registration for this event?')) return;
    try {
      await fetch(`${API_BASE}/events/${eventId}/register/${user.employee_key}`, { method: 'DELETE' });
      
      setRegisteredKeys(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      // Locally decrement count for instant UI feedback
      setEvents(prev => prev.map(ev => 
        ev.event_id === eventId ? { ...ev, registered_count: Math.max(0, parseInt(ev.registered_count || 0) - 1) } : ev
      ));
    } catch (err) {
      console.error('Failed to cancel registration', err);
    }
  };

  function toAbsoluteUrl(imagePath) {
    if (!imagePath) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return `${base}${imagePath}`;
  }

  return (
    <div className="ee-dashboard-container">
      <RoleSidebar user={user} />

      <main className="ee-main-content fade-in-up">
        <header className="ee-header-row">
          <div className="ee-title-wrapper">
            <Sparkles size={28} className="ee-icon-maroon" /> 
            <div className="ee-title-text">
              <h2>
                <span className="ee-title-dark">Trainings & </span> <span className="ee-title-maroon">Events</span>
              </h2>
              <p className="ee-subtitle">
                Browse and join events available to <span className="ee-highlight-maroon">{user?.department || 'your department'}</span>.
              </p>
            </div>
          </div>
          <Header user={user} onLogout={onLogout} />
        </header>

        {loading ? (
          <div className="ee-empty-state"><p>Loading upcoming events...</p></div>
        ) : events.length === 0 ? (
          <div className="ee-empty-state"><p>No upcoming events right now. Check back soon!</p></div>
        ) : (
          <div className="ee-events-grid">
            {events.map(ev => {
              const isRegistered = registeredKeys.has(ev.event_id);
              const capacity = parseInt(ev.capacity) || 0;
              const regCount = parseInt(ev.registered_count) || 0;
              const isFull = capacity > 0 && regCount >= capacity;
              const percentFilled = capacity > 0 ? Math.min(100, Math.round((regCount / capacity) * 100)) : 0;
              
              // Extract time safely
              const startDateObj = ev.start_date ? new Date(ev.start_date) : null;
              const startTimeString = startDateObj 
                ? startDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) 
                : '';

              return (
                <div key={ev.event_id} className="ee-event-card">
                  <div
                    className="ee-card-image"
                    style={{
                      backgroundImage: ev.image_url
                        ? `url(${toAbsoluteUrl(ev.image_url)})`
                        : 'linear-gradient(135deg, #7a1220, #a6293a)'
                    }}
                  >
                    <span className="ee-category-badge">{ev.event_type || 'Training'}</span>
                  </div>

                  <div className="ee-card-body">
                    <h3 className="ee-card-title">{ev.title}</h3>
                    
                    <div className="ee-meta-row">
                      <Calendar size={14} className="ee-meta-icon" />
                      <span>
                        {startDateObj ? startDateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                        {startTimeString ? ` · ${startTimeString}` : ''}
                      </span>
                    </div>

                    <div className="ee-meta-row">
                      <MapPin size={14} className="ee-meta-icon" />
                      <span>{ev.venue || 'TBA'}</span>
                    </div>

                    <p className="ee-card-desc">{ev.description}</p>

                    <div className="ee-registration-block">
                      <div className="ee-reg-label-row">
                        <span className="ee-reg-title"><Users size={14}/> Registration</span>
                        <span className="ee-reg-count">
                          {capacity > 0 ? `${regCount} / ${capacity}` : `${regCount} joined`}
                        </span>
                      </div>
                      {capacity > 0 && (
                        <div className="ee-progress-track">
                          <div className="ee-progress-fill" style={{ width: `${percentFilled}%` }}></div>
                        </div>
                      )}
                    </div>

                    <div className="ee-card-footer">
                      {isRegistered ? (
                        <button className="ee-btn-joined" onClick={() => handleCancel(ev.event_id)}>
                          <CheckCircle size={16} /> Joined — Cancel
                        </button>
                      ) : (
                        <button
                          className={isFull ? "ee-btn-disabled" : "ee-btn-join"}
                          onClick={() => !isFull && handleJoin(ev.event_id)}
                          disabled={isFull}
                        >
                          {isFull ? 'Fully Booked' : 'Join Event'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}