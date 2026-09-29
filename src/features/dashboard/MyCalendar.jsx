import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import './my-calendar.css';

// ---- PH Holidays (fixed-date ones repeat every year; moveable ones are listed per year) ----
const HOLIDAYS_FIXED = [
  ['01-01', "New Year's Day", 'regular'],
  ['04-09', 'Araw ng Kagitingan', 'regular'],
  ['05-01', 'Labor Day', 'regular'],
  ['06-12', 'Independence Day', 'regular'],
  ['08-21', 'Ninoy Aquino Day', 'special'],
  ['11-01', "All Saints' Day", 'special'],
  ['11-30', 'Bonifacio Day', 'regular'],
  ['12-08', 'Immaculate Conception', 'special'],
  ['12-25', 'Christmas Day', 'regular'],
  ['12-30', 'Rizal Day', 'regular'],
  ['12-31', "New Year's Eve", 'special'],
];

// Moveable holidays change every year — add the next year's dates here once proclaimed.
const HOLIDAYS_MOVEABLE = {
  2026: [
    ['02-17', 'Chinese New Year', 'special'],
    ['02-25', 'EDSA People Power Anniversary', 'special'],
    ['04-02', 'Maundy Thursday', 'regular'],
    ['04-03', 'Good Friday', 'regular'],
    ['04-04', 'Black Saturday', 'special'],
    ['08-31', 'National Heroes Day', 'regular'],
  ],
};

function getHolidaysForYear(year) {
  const fixed = HOLIDAYS_FIXED.map(([md, name, type]) => ({
    date: `${year}-${md}`,
    name,
    type,
  }));
  const moveable = (HOLIDAYS_MOVEABLE[year] || []).map(([md, name, type]) => ({
    date: `${year}-${md}`,
    name,
    type,
  }));
  return [...fixed, ...moveable];
}

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

function fromDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Expand a start/end range into individual date keys.
// skipWeekends=true is used for leave filings, since leave doesn't cover Sat/Sun.
function expandRange(startKey, endKey, skipWeekends = false) {
  const out = [];
  const cur = fromDateKey(startKey);
  const end = fromDateKey(endKey);
  let guard = 0;
  while (cur <= end && guard++ < 366) {
    const dow = cur.getDay();
    if (!(skipWeekends && (dow === 0 || dow === 6))) {
      out.push(toDateKey(cur.getFullYear(), cur.getMonth(), cur.getDate()));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export default function MyCalendar({ employeeKey }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const [leaves, setLeaves] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Fetch a wide window once (3 months back, 12 months ahead) so month nav
  // doesn't need to re-fetch every time the user clicks the arrows.
  useEffect(() => {
    if (!employeeKey) {
      setLoading(false);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const now = new Date();
    const from = toDateKey(now.getFullYear(), now.getMonth() - 3, 1);
    const toDateObj = new Date(now.getFullYear(), now.getMonth() + 13, 0);
    const to = toDateKey(toDateObj.getFullYear(), toDateObj.getMonth(), toDateObj.getDate());

    setLoading(true);
    fetch(`${apiUrl}/api/calendar/${employeeKey}?from=${from}&to=${to}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((json) => {
        setLeaves(Array.isArray(json.leaves) ? json.leaves : []);
        setEvents(Array.isArray(json.events) ? json.events : []);
        setLoadError('');
      })
      .catch(() => setLoadError('Could not load calendar data.'))
      .finally(() => setLoading(false));
  }, [employeeKey]);

  const eventsByDate = useMemo(() => {
    const map = {};
    const add = (dateKey, item) => {
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(item);
    };

    // Holidays for the visible year plus neighbors, so "Upcoming" spanning
    // a year boundary still finds them.
    [viewYear - 1, viewYear, viewYear + 1].forEach((y) => {
      getHolidaysForYear(y).forEach((h) => add(h.date, { ...h, type: 'holiday' }));
    });

    leaves.forEach((l) => {
      const label = `${l.leave_type} — ${l.status}`;
      expandRange(l.start_date, l.end_date, true).forEach((dateKey) =>
        add(dateKey, { type: 'leave', label, status: l.status })
      );
    });

    events.forEach((e) => {
      const label = e.registered ? `${e.title} (Registered)` : e.title;
      expandRange(e.start_date, e.end_date, false).forEach((dateKey) =>
        add(dateKey, { type: 'training', label, time: e.start_time, venue: e.venue })
      );
    });

    return map;
  }, [leaves, events, viewYear]);

  const upcomingEvents = useMemo(() => {
    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    const all = Object.entries(eventsByDate)
      .filter(([date]) => date >= todayKey)
      .flatMap(([date, evs]) => evs.map((ev) => ({ ...ev, date })))
      .sort((a, b) => a.date.localeCompare(b.date));
    return all.slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    fromDateKey(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
                {fromDateKey(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {selectedEvents.length === 0 ? (
                <p className="mycal-detail-empty">No events on this date.</p>
              ) : (
                <ul className="mycal-detail-list">
                  {selectedEvents.map((ev, i) => (
                    <li key={i} className={`mycal-detail-item item-${ev.type}`}>
                      <span className="mycal-detail-dot" />
                      {ev.name || ev.label}
                      {ev.time && ` · ${ev.time}`}
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
              {loading && <p className="mycal-detail-empty">Loading…</p>}
              {loadError && <p className="mycal-detail-empty">{loadError}</p>}
              {!loading && !loadError && upcomingEvents.length === 0 && (
                <p className="mycal-detail-empty">Nothing coming up.</p>
              )}
              {!loading && !loadError && upcomingEvents.length > 0 && (
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
