import React, { useState, useEffect } from "react";
import { 
  KeyRound, 
  Check, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  UserX,
  Clock
} from "lucide-react";
import ItSidebar from "../../components/it-sidebar.jsx";
import Header from "../../components/Header.jsx";
import "./password-reset.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function PasswordResetDashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [tempPasswordModal, setTempPasswordModal] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/password-reset-requests`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load password reset requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    setActionLoading(request.request_id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/password-reset-requests/${request.request_id}/approve`,
        { method: "PUT" }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to approve.");
        return;
      }
      setTempPasswordModal({
        name: `${request.first_name || ""} ${request.last_name || ""}`.trim(),
        tempPassword: data.tempPassword,
      });
      fetchRequests();
    } catch {
      alert("Server error while approving.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request) => {
    if (
      !window.confirm(
        `Reject the request from ${request.first_name || ""} ${request.last_name || ""}?`
      )
    )
      return;
    setActionLoading(request.request_id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/password-reset-requests/${request.request_id}/reject`,
        { method: "PUT" }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to reject.");
        return;
      }
      fetchRequests();
    } catch {
      alert("Server error while rejecting.");
    } finally {
      setActionLoading(null);
    }
  };

  const matchedCount = requests.filter((r) => r.employee_key).length;
  const unmatchedCount = requests.length - matchedCount;

  return (
    <div className="prd-container">
      {/* SIDEBAR */}
      <ItSidebar user={user} />

      {/* MAIN CONTENT AREA */}
      <main className="prd-main-content fade-in-up">
        
        {/* STANDARDIZED HEADER BLOCK */}
        <header className="tr-header">
          <div className="tr-header-title">
            <span className="tr-header-badge">
              <span className="tr-badge-dot"></span> IT OPERATIONS PORTAL
            </span>
            <h2>
              <span className="tr-title-dark">Password Reset </span>
              <span className="tr-title-maroon">Requests</span>
            </h2>
          </div>

          <Header user={user} onLogout={onLogout} />
        </header>

        {/* METRICS / STAT CARDS ROW */}
        <div className="prd-stat-row">
          <div className="prd-stat-card">
            <div className="prd-stat-icon-box maroon">
              <Clock size={18} />
            </div>
            <div className="prd-stat-info">
              <span className="prd-stat-label">PENDING REVIEW</span>
              <span className="prd-stat-value">{loading ? "…" : requests.length}</span>
              <span className="prd-stat-sub">Awaiting IT authorization</span>
            </div>
          </div>

          <div className="prd-stat-card">
            <div className="prd-stat-icon-box green">
              <UserCheck size={18} />
            </div>
            <div className="prd-stat-info">
              <span className="prd-stat-label">MATCHED ACCOUNTS</span>
              <span className="prd-stat-value">{loading ? "…" : matchedCount}</span>
              <span className="prd-stat-sub">Verified in HR Database</span>
            </div>
          </div>

          <div className="prd-stat-card">
            <div className="prd-stat-icon-box amber">
              <UserX size={18} />
            </div>
            <div className="prd-stat-info">
              <span className="prd-stat-label">UNMATCHED REQUESTS</span>
              <span className="prd-stat-value">{loading ? "…" : unmatchedCount}</span>
              <span className="prd-stat-sub">Requires manual verification</span>
            </div>
          </div>
        </div>

        {/* MAIN REQUESTS TABLE CARD */}
        <div className="prd-card">
          <div className="prd-card-header">
            <div className="prd-header-title-group">
              <KeyRound size={16} />
              <span>Active Employee Reset Queue</span>
            </div>
            <button
              type="button"
              className="prd-refresh-btn"
              onClick={fetchRequests}
              title="Refresh requests"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="prd-card-body">
            {loading ? (
              <div className="prd-state-box">
                <RefreshCw size={24} className="spin prd-loading-icon" />
                <p>Fetching reset requests...</p>
              </div>
            ) : error ? (
              <div className="prd-state-box error">
                <AlertCircle size={24} />
                <p>{error}</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="prd-state-box">
                <CheckCircle2 size={28} className="prd-empty-icon" />
                <p>No pending password reset requests at this time.</p>
              </div>
            ) : (
              <div className="prd-table-wrapper">
                <table className="prd-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Requested Date</th>
                      <th>Database Match</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.request_id}>
                        <td className="font-mono">{req.employee_id || req.employee_id_input || "N/A"}</td>
                        <td>
                          <div className="prd-user-cell">
                            <span className="prd-user-avatar">
                              {(req.first_name?.[0] || "E").toUpperCase()}
                            </span>
                            <span className="prd-user-name">
                              {`${req.first_name || ""} ${req.middle_name || ""} ${req.last_name || ""}`.trim() || "Unknown Employee"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="prd-dept-tag">{req.department || "General"}</span>
                        </td>
                        <td className="prd-position-cell">{req.position_title || "N/A"}</td>
                        <td>
                          {req.date_requested || req.requested_at
                            ? new Date(
                                req.date_requested || req.requested_at
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td>
                          {req.employee_key ? (
                            <span className="prd-badge prd-badge-matched">
                              <Check size={11} /> Matched
                            </span>
                          ) : (
                            <span className="prd-badge prd-badge-unmatched">
                              <X size={11} /> No match
                            </span>
                          )}
                        </td>
                        <td className="prd-actions text-right">
                          <button
                            type="button"
                            className="prd-btn prd-btn-approve"
                            onClick={() => handleApprove(req)}
                            disabled={
                              !req.employee_key || actionLoading === req.request_id
                            }
                          >
                            <Check size={13} />
                            {actionLoading === req.request_id ? "..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            className="prd-btn prd-btn-reject"
                            onClick={() => handleReject(req)}
                            disabled={actionLoading === req.request_id}
                          >
                            <X size={13} /> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* TEMPORARY PASSWORD MODAL */}
        {tempPasswordModal && (
          <div className="prd-modal-overlay">
            <div className="prd-modal">
              <div className="prd-modal-header">
                <CheckCircle2 size={18} />
                <span>Reset Request Approved</span>
              </div>
              <div className="prd-modal-body">
                <p className="prd-modal-text">
                  Temporary credentials generated for <strong>{tempPasswordModal.name}</strong>:
                </p>
                <div className="prd-temp-password">
                  {tempPasswordModal.tempPassword}
                </div>
                <p className="prd-modal-note">
                  Please securely communicate this temporary password to the employee. This key will not be displayed again.
                </p>
                <button
                  type="button"
                  className="prd-btn-modal-close"
                  onClick={() => setTempPasswordModal(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}