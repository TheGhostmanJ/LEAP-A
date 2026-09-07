import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';
import Header from '../../components/Header.jsx';
import './trainingrecords.css';

export default function TrainingRecords({ onLogout, user }) {
  const [upcomingTrainings, setUpcomingTrainings] = useState([
    { id: 1, name: 'Cybersecurity Seminar', date: 'July 5, 2026', duration: '2 Days', sponsor: 'DICT', status: 'Scheduled' }
  ]);

  const [hrPostedEvent] = useState({
    id: 202,
    name: 'Cloud Security Fundamentals',
    date: 'August 12, 2026',
    duration: '1 Day',
    sponsor: 'City HR Department',
    location: 'Main Training Hall / Hybrid',
    slotsLeft: 14,
    imagePlaceholderColor: '#680000'
  });

  const [hasJoined, setHasJoined] = useState(false);

  const handleJoinHrEvent = () => {
    if (hasJoined) return;

    const joinedItem = {
      id: hrPostedEvent.id,
      name: hrPostedEvent.name,
      date: hrPostedEvent.date,
      duration: hrPostedEvent.duration,
      sponsor: hrPostedEvent.sponsor,
      status: 'Scheduled'
    };

    setUpcomingTrainings([...upcomingTrainings, joinedItem]);
    setHasJoined(true);
  };

  return (
    <div className="tr-dashboard-container">
      <Sidebar />

      {/* Added 'fade-in-up' class for smooth layout entry */}
      <main className="tr-main-content fade-in-up">
        {/* HEADER SECTION */}
        <header className="tr-header">
          <div className="tr-header-title">
            <span className="tr-header-badge">
              <span className="tr-badge-dot"></span> TRAINING PROGRAM RECORDS
            </span>
            <h2>
              <span className="tr-title-dark">My </span>
              <span className="tr-title-maroon">Training Records</span>
            </h2>
          </div>

          {/* Shared Header Component */}
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* 3-COLUMN METRICS ROW */}
        <section className="tr-metrics-grid">
          {/* CARD 1: Total Trainings */}
          <div className="tr-summary-card card-maroon-accent hover-lift">
            <div className="tr-card-label-row">
              <CheckCircle2 size={16} className="tr-icon-maroon" />
              <span>TOTAL TRAININGS</span>
            </div>
            <div className="tr-metric-value tr-maroon">
              0 <span className="tr-metric-unit">Completed</span>
            </div>
          </div>

          {/* CARD 2: Certifications Earned */}
          <div className="tr-summary-card card-amber-accent hover-lift">
            <div className="tr-card-label-row">
              <Award size={16} className="tr-icon-amber" />
              <span>CERTIFICATIONS EARNED</span>
            </div>
            <div className="tr-metric-value tr-amber">
              5 <span className="tr-metric-unit">Active</span>
            </div>
          </div>

          {/* CARD 3: Upcoming Trainings */}
          <div className="tr-summary-card card-maroon-accent hover-lift">
            <div className="tr-card-label-row">
              <Calendar size={16} className="tr-icon-maroon" />
              <span>UPCOMING TRAININGS</span>
            </div>
            <div className="tr-metric-value tr-maroon">
              {upcomingTrainings.length}{' '}
              <span className="tr-metric-unit">
                Event{upcomingTrainings.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </section>

        {/* SEARCH / FILTER ROW */}
        <section className="tr-controls-row">
          <div className="tr-search-wrapper">
            <Search size={14} className="tr-search-icon" />
            <input
              type="text"
              placeholder="Search training, sponsor, status..."
              className="tr-search-input"
            />
          </div>

          <div className="tr-filter-actions">
            <div className="tr-date-picker-btn">
              <Filter size={14} />
              <span>Filter View</span>
            </div>
          </div>
        </section>

        {/* 3-COLUMN WORKSPACE */}
        <section className="tr-workspace-grid">
          {/* COLUMN 1: JOIN PUBLIC HR EVENT CARD */}
          <div className="tr-event-card hover-lift">
            <div className="tr-card-title-bar">
              <Calendar size={15} />
              <span>Available Training Event</span>
            </div>

            <div
              className="tr-event-image-banner"
              style={{ backgroundColor: hrPostedEvent.imagePlaceholderColor }}
            >
              <GraduationCap size={44} color="#ffffff" style={{ opacity: 0.8 }} />
              <span className="tr-event-badge-live">New Event</span>
            </div>

            <div className="tr-event-body">
              <div className="tr-event-heading">
                <span className="tr-event-category">Featured Program</span>
                <h3 className="tr-event-title">{hrPostedEvent.name}</h3>
              </div>

              <div className="tr-details-panel">
                <div className="tr-detail-item">
                  <Calendar size={14} className="tr-detail-icon" />
                  <span>
                    <strong>Date:</strong> {hrPostedEvent.date}
                  </span>
                </div>
                <div className="tr-detail-item">
                  <Clock size={14} className="tr-detail-icon" />
                  <span>
                    <strong>Duration:</strong> {hrPostedEvent.duration}
                  </span>
                </div>
                <div className="tr-detail-item">
                  <Briefcase size={14} className="tr-detail-icon" />
                  <span>
                    <strong>Sponsor:</strong> {hrPostedEvent.sponsor}
                  </span>
                </div>
                <div className="tr-detail-item">
                  <MapPin size={14} className="tr-detail-icon" />
                  <span>
                    <strong>Venue:</strong> {hrPostedEvent.location}
                  </span>
                </div>
              </div>

              <hr className="tr-divider" />

              <div className="tr-slots-row">
                <Users size={14} />
                <span>
                  {hasJoined ? hrPostedEvent.slotsLeft - 1 : hrPostedEvent.slotsLeft}{' '}
                  Slots remaining
                </span>
              </div>

              <button
                onClick={handleJoinHrEvent}
                disabled={hasJoined}
                className={`tr-submit-button ${
                  hasJoined ? 'joined-inactive-btn' : ''
                }`}
              >
                {hasJoined ? '✓ Joined Successfully' : 'Join Training Event'}
              </button>
            </div>
          </div>

          {/* COLUMN 2: UPCOMING TRAININGS TABLE */}
          <div className="tr-table-card">
            <div className="tr-card-title-bar">
              <span>Upcoming Trainings</span>
            </div>
            <div className="tr-table-wrapper">
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
                  {upcomingTrainings.map((item) => (
                    <tr key={item.id}>
                      <td className="tr-td-bold">{item.name}</td>
                      <td>{item.date}</td>
                      <td>{item.duration}</td>
                      <td>{item.sponsor}</td>
                      <td>
                        <span className="tr-pill-status scheduled">
                          Scheduled
                        </span>
                      </td>
                    </tr>
                  ))}
                  {upcomingTrainings.length < 2 && (
                    <>
                      <tr>
                        <td colSpan="5" className="tr-empty-spacer-cell">
                          &nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="tr-empty-spacer-cell">
                          &nbsp;
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* COLUMN 3: COMPLETED TRAININGS TABLE */}
          <div className="tr-table-card">
            <div className="tr-card-title-bar">
              <span>Completed Trainings</span>
            </div>
            <div className="tr-table-wrapper">
              <table className="tr-data-table">
                <thead>
                  <tr>
                    <th>Training Name</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Sponsor</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" className="tr-empty-state-cell">
                      No completed trainings on record
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="tr-empty-spacer-cell">
                      &nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="tr-empty-spacer-cell">
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
    </div>
  );
}