// src/components/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Inbox, Clock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import HodSidebar from './hod-sidebar';
import RoleSidebar from './RoleSidebar.jsx';
import Header from './Header.jsx';
import './NotificationsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function timeAgo(dateString) {
  if (!dateString) return 'recently';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function groupByRecency(notifications) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const groups = { Today: [], 'Earlier This Week': [], Older: [] };

  notifications.forEach((n) => {
    const created = new Date(n.created_at);
    if (created >= startOfToday) {
      groups['Today'].push(n);
    } else if (created >= startOfWeek) {
      groups['Earlier This Week'].push(n);
    } else {
      groups['Older'].push(n);
    }
  });

  return groups;
}

export default function NotificationsPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const employeeKey = user?.employee_key;
  const isHod = user?.role === 'Department Head';

  const fetchAll = async () => {
    if (!employeeKey) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${employeeKey}?limit=100`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [employeeKey]);

  const handleMarkAllRead = async () => {
    if (!employeeKey) return;
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${employeeKey}/read-all`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await fetch(`${API_BASE_URL}/api/notifications/${notif.notification_id}/read`, { method: 'PATCH' });
        setNotifications((prev) =>
          prev.map((n) => (n.notification_id === notif.notification_id ? { ...n, is_read: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const grouped = groupByRecency(notifications);

  return (
    <div className="dashboard-container">
      {isHod ? <HodSidebar /> : <RoleSidebar user={user} />}

      <main className="dashboard-main-content fade-in-up">
        <Header user={user} onLogout={onLogout} />

        <section className="notif-page-container">
          <div className="notif-page-header">
            <button type="button" className="notif-page-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back
            </button>

            <div className="notif-page-title-row">
              <h2>Notifications</h2>
              {unreadCount > 0 && <span className="notif-page-count-tag">{unreadCount} new</span>}
            </div>

            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead} className="notif-page-mark-read-btn">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="notif-page-empty">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notif-page-empty">
              <Inbox size={40} className="notif-page-empty-icon" />
              <p>No notifications yet</p>
              <span>We'll inform you when updates arrive.</span>
            </div>
          ) : (
            Object.entries(grouped).map(([label, items]) =>
              items.length === 0 ? null : (
                <div className="notif-page-group" key={label}>
                  <div className="notif-page-group-label">{label}</div>
                  {items.map((notif) => {
                    const isApproved =
                      notif.type === 'leave_approved' ||
                      (notif.title && notif.title.toLowerCase().includes('approved'));

                    return (
                      <div
                        key={notif.notification_id}
                        onClick={() => handleItemClick(notif)}
                        className={`notif-page-item ${!notif.is_read ? 'unread' : ''}`}
                      >
                        <div className="notif-page-icon-col">
                          {isApproved ? (
                            <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
                          ) : (
                            <XCircle size={18} style={{ color: '#DC2626' }} />
                          )}
                        </div>
                        <div className="notif-page-content-col">
                          <div className="notif-page-item-title">{notif.title}</div>
                          <div className="notif-page-item-message">{notif.message}</div>
                          <div className="notif-page-item-time">
                            <Clock size={11} /> {timeAgo(notif.created_at)}
                          </div>
                        </div>
                        {!notif.is_read && <div className="notif-page-unread-dot" />}
                      </div>
                    );
                  })}
                </div>
              )
            )
          )}
        </section>
      </main>
    </div>
  );
}
