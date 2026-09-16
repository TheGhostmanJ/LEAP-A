import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Inbox, Clock, CheckCircle2, XCircle } from 'lucide-react';
import './NotificationBell.css';

// Fix: Dynamically point to local port 3001 or the live Railway URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BACKEND_URL = `${API_BASE_URL}/api/notifications`;

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

export default function NotificationBell({ employeeKey, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!employeeKey) return;
    try {
      const res = await fetch(`${BACKEND_URL}/${employeeKey}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.notifications || []);
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); 
    return () => clearInterval(interval);
  }, [employeeKey]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    const notifId = notif.notification_id || notif.id;
    if (!notif.is_read) {
      try {
        await fetch(`${BACKEND_URL}/${notifId}/read`, { method: 'PATCH' });
        setNotifications(prev =>
          prev.map(n => (n.notification_id === notifId || n.id === notifId) ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    if (onNavigate && notif.related_id) {
      onNavigate('leaveApplicationDetails', { applicationId: notif.related_id });
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    if (!employeeKey) return;
    try {
      await fetch(`${BACKEND_URL}/${employeeKey}/read-all`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`notif-bell-btn ${isOpen ? 'active' : ''}`}
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div className="notif-header-left">
              <span className="notif-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-count-tag">{unreadCount} new</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="notif-mark-read-btn">
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Inbox size={32} className="notif-empty-icon" />
                <p>No notifications yet</p>
                <span>We'll inform you when updates arrive.</span>
              </div>
            ) : (
              notifications.map((notif, index) => {
                const key = notif.notification_id || notif.id || index;
                const isApproved = notif.type === 'leave_approved' || (notif.title && notif.title.toLowerCase().includes('approved'));

                return (
                  <div
                    key={key}
                    onClick={() => handleNotificationClick(notif)}
                    className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                  >
                    <div className="notif-icon-col">
                      {isApproved ? (
                        <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
                      ) : (
                        <XCircle size={18} style={{ color: '#DC2626' }} />
                      )}
                    </div>

                    <div className="notif-content-col">
                      <div className="notif-item-title">{notif.title}</div>
                      <div className="notif-item-message">{notif.message}</div>
                      <div className="notif-item-time">
                        <Clock size={11} />
                        {timeAgo(notif.created_at)}
                      </div>
                    </div>

                    {!notif.is_read && <div className="notif-unread-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}