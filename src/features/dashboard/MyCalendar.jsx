import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import './my-calendar.css';

// ---- PH Holidays 2026 (Regular + Special Non-Working) ----
// Standard PH proclaimed holidays; confirm final list against the actual Malacañang proclamation for 2026.
const PH_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: "New Year's Day", type: 'regular' },
  { date: '2026-02-17', name: 'Chinese New Year', type: 'special' },
  { date: '2026-02-25', name: 'EDSA People Power Anniversary', type: 'special' },
  { date: '2026-04-02', name: 'Maundy Thursday', type: 'regular' },
  { date: '2026-04-03', name: 'Good Friday', type: 'regular' },
  { date: '2026-04-04', name: 'Black Saturday', type: 'special' },
  { date: '2026-04-09', name: 'Araw ng Kagitingan', type: 'regular' },
  { date: '2026-05-01', name: 'Labor Day', type: 'regular' },
  { date: '2026-06-12', name: 'Independence Day', type: 'regular' },
  { date: '2026-08-21', name: 'Ninoy Aquino Day', type: 'special' },
  { date: '2026-08-31', name: 'National Heroes Day', type: 'regular' },
  { date: '2026-11-01', name: "All Saints' Day", type: 'special' },
  { date: '2026-11-30', name: 'Bonifacio Day', type: 'regular' },
  { date: '2026-12-08', name: 'Immaculate Conception', type: 'special' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'regular' },
  { date: '2026-12-30', name: 'Rizal Day', type: 'regular' },
  { date: '2026-12-31', name: "New Year's Eve", type: 'special' },
];

// ---- Mock leave + event data ----
const MOCK_LEAVE_EVENTS = [
  { date: '2026-09-12', type: 'leave', label: 'Solo Parent Leave — Rejected', status: 'rejected' },
  { date: '2026-09-25', type: 'leave', label: 'Vacation Leave — Pending', status: 'pending' },
];

const MOCK_TRAINING_EVENTS = [
  { date: '2026-09-22', type: 'training', label: 'Data Privacy Act Refresher' },
  { date: '2026-09-30', type: 'training', label: 'Customer Service Workshop' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export default function MyCalendar({ leaveEvents = MOCK_LEAVE_EVENTS, trainingEvents = MOCK_TRAINING_EVENTS, holidays = PH_HOLIDAYS_2026 }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const eventsByDate = useMemo(() => {
    const map = {};
    holidays.forEach((h) => {
      if (!map[h.date]) map[h.date] = [];
      map[h.date].push({ ...h, type: 'holiday' });
    });
    leaveEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    trainingEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [leaveEvents, trainingEvents, holidays]);

  const upcomingEvents = useMemo(() => {
    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    const all = Object.entries(eventsByDate)
      .filter(([date]) => date >= todayKey)
      .flatMap(([date, events]) => events.map((ev) => ({ ...ev, date })))
      .sort((a, b) => a.date.localeCompare(b.date));
    return all.slice(0, 5);
  }, [eventsByDate]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const formatNiceDate = (dateKey) =>
    new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <div className="analytics-visual-card hover-lift mycal-card">
      <div className="card-header-flex">
        <h3 className="card-section-title">
          <CalendarDays size={18} className="title-icon" /> My Calendar
        </h3>
        <div className="mycal-nav">
          <button type="button" className="mycal-nav-btn" onClick={goPrevMonth} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span className="mycal-month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button type="button" className="mycal-nav-btn" onClick={goNextMonth} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mycal-columns">
        <div className="mycal-grid-col">
          <div className="mycal-grid">
            {DAY_LABELS.map((d) => (
              <div key={d} className="mycal-weekday">{d}</div>
            ))}

            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="mycal-cell empty" />;

              const dateKey = toDateKey(viewYear, viewMonth, day);
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;

              const hasHoliday = dayEvents.some((e) => e.type === 'holiday');
              const hasLeave = dayEvents.some((e) => e.type === 'leave');
              const hasTraining = dayEvents.some((e) => e.type === 'training');

              return (
                <button
                  type="button"
                  key={dateKey}
                  className={`mycal-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                >
                  <span className="mycal-day-number">{day}</span>
                  {dayEvents.length > 0 && (
                    <span className="mycal-dot-row">
                      {hasHoliday && <span className="mycal-dot dot-holiday" />}
                      {hasLeave && <span className="mycal-dot dot-leave" />}
                      {hasTraining && <span className="mycal-dot dot-training" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mycal-legend">
            <span className="mycal-legend-item"><span className="mycal-dot dot-holiday" /> Holiday</span>
            <span className="mycal-legend-item"><span className="mycal-dot dot-leave" /> Leave Filing</span>
            <span className="mycal-legend-item"><span className="mycal-dot dot-training" /> Training / Event</span>
          </div>
        </div>

        <div className="mycal-side-col">
          {selectedDate ? (
            <>
              <p className="mycal-side-heading">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {selectedEvents.length === 0 ? (
                <p className="mycal-detail-empty">No events on this date.</p>
              ) : (
                <ul className="mycal-detail-list">
                  {selectedEvents.map((ev, i) => (
                    <li key={i} className={`mycal-detail-item item-${ev.type}`}>
                      <span className="mycal-detail-dot" />
                      {ev.name || ev.label}
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" className="mycal-clear-btn" onClick={() => setSelectedDate(null)}>
                Back to upcoming
              </button>
            </>
          ) : (
            <>
              <p className="mycal-side-heading">Upcoming</p>
              {upcomingEvents.length === 0 ? (
                <p className="mycal-detail-empty">Nothing coming up this month.</p>
              ) : (
                <ul className="mycal-detail-list">
                  {upcomingEvents.map((ev, i) => (
                    <li key={i} className={`mycal-detail-item item-${ev.type}`}>
                      <span className="mycal-detail-dot" />
                      <span className="mycal-upcoming-text">
                        <strong>{formatNiceDate(ev.date)}</strong> — {ev.name || ev.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}