import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  AlertTriangle,
  Ban,
  ArrowRight,
  X,
  Paperclip,
  Eye
} from 'lucide-react';

import HodSidebar from "../../components/hod-sidebar";
import Header from '../../components/Header.jsx';
import { buildLeavePdfBytes } from '../leave/generateLeavePdf.js';
import './hod-dashboard.css';

const formatPdfDate = (dateVal) => {
  if (!dateVal) return '';
  const parsed = new Date(dateVal);
  if (isNaN(parsed.getTime())) return String(dateVal);
  return parsed.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

export default function HodDashboard({ onLogout, user }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);

  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('Leave Application Document Preview');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchDeptLeaves = async (deptName) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const encodedDept = encodeURIComponent(deptName.trim());
      const response = await fetch(`${apiUrl}/api/leave-applications/department?name=${encodedDept}`);

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      return data.applications || [];
    } catch (error) {
      console.error("Failed to load department applications:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadLeaves = async () => {
      if (!user?.department) {
        setLoadingLeaves(false);
        return;
      }

      setLoadingLeaves(true);
      const applications = await fetchDeptLeaves(user.department.trim());
      setLeaveRequests(applications);
      setLoadingLeaves(false);
    };

    loadLeaves();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingLeaves = leaveRequests.filter(req => req.status === 'Pending');

  const formatDate = (rawDate) => {
    if (!rawDate) return 'N/A';
    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) return rawDate;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleOpenPreview = async (req) => {
    try {
      let finalBlobUrl = null;
      const filePayload = req.pdf_url || req.pdfBase64 || req.pdf_base64 || req.pdf_document || req.document_path || req.attachment;

      if (filePayload) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        if (filePayload.startsWith('data:application/pdf;base64,')) {
          const base64Data = filePayload.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          finalBlobUrl = URL.createObjectURL(blob);
        } else if (filePayload.startsWith('http') || filePayload.startsWith('/')) {
          finalBlobUrl = filePayload.startsWith('/') ? `${apiUrl}${filePayload}` : filePayload;
        } else {
          const binaryString = atob(filePayload);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          finalBlobUrl = URL.createObjectURL(blob);
        }
      } else {
        const formData = {
          filingDate: formatPdfDate(req.date_key || req.date_filed || req.filing_date),
          leaveType: req.type || req.leave_type,
          othersSpecify: req.others_specify,
          vacationSplLocation: req.vacation_spl_location,
          locationSpecify: req.location_specify,
          abroadSpecify: req.abroad_specify,
          sickLeaveType: req.sick_leave_type,
          illnessSpecify: req.illness_specify,
          studyLeavePurpose: req.study_leave_purpose,
          othersPurpose: req.others_purpose,
          workingDays: req.working_days || req.days_applied,
          inclusiveDateFrom: formatPdfDate(req.start_date || req.inclusive_date_from),
          inclusiveDateTo: formatPdfDate(req.end_date || req.inclusive_date_to),
          commutation: req.commutation || 'not-requested'
        };

        const targetUser = {
          first_name: req.first_name || req.name?.split(' ')[0] || '',
          last_name: req.last_name || req.name?.split(' ').slice(1).join(' ') || '',
          department: req.department || user?.department || '',
          position_title: req.position_title || req.position || ''
        };

        const pdfBytes = await buildLeavePdfBytes(formData, targetUser);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        finalBlobUrl = URL.createObjectURL(blob);
      }

      setPreviewTitle('Leave Application Document Preview');
      setPreviewPdfUrl(finalBlobUrl);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Failed to generate PDF preview:', err);
      alert('Could not open document preview.');
    }
  };

  const handleOpenAttachment = (attachment) => {
    let url = '';
    let title = 'Supporting Document';

    if (typeof attachment === 'string') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      if (attachment.startsWith('JVBERi')) {
        url = `data:application/pdf;base64,${attachment}`;
      } else {
        url = attachment.startsWith('/') ? `${apiUrl}${attachment}` : attachment;
      }
    } else if (typeof attachment === 'object' && attachment !== null) {
      url = attachment.dataUrl || attachment.url || attachment.path || attachment.file_path;
      title = attachment.requirementLabel || attachment.fileName || attachment.attachment_name || attachment.name || 'Supporting Document';
    }

    if (!url) {
      alert('Attachment URL or file data is missing.');
      return;
    }

    setPreviewTitle(title);
    setPreviewPdfUrl(url);
    setIsPreviewOpen(true);
  };

  const parseAttachments = (req) => {
    if (req.attachment_urls && Array.isArray(req.attachment_urls) && req.attachment_urls.length > 0) {
      return req.attachment_urls;
    }

    const raw = req.attachment_data || req.supporting_documents || req.attachments || req.attachment || req.files || req.documents;
    if (!raw) return [];

    if (Array.isArray(raw)) return raw;

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'object' && parsed !== null) return [parsed];
      } catch {
        const fileName = req.attachment_name || 'Attachment';
        return [{
          dataUrl: raw.startsWith('data:') ? raw : (raw.startsWith('JVBERi') ? `data:application/pdf;base64,${raw}` : raw),
          fileName: fileName,
          requirementLabel: fileName
        }];
      }
    }

    if (typeof raw === 'object' && raw !== null) return [raw];
    return [];
  };

  return (
    // UI FIX: Apply the global layout wrapper class
    <div className="app-layout-wrapper">
      <HodSidebar user={user} />

      <main className="app-main-container fade-in-up" style={{ padding: '32px' }}>

        {/* UI FIX: Apply the standardized header block */}
        <header className="app-global-header">
          <div className="app-title-layout">
            <div className="app-title-icon-badge">
              <Users size={20} />
            </div>
            <div>
              <h1 className="app-title">Department Dashboard</h1>
              <p className="app-subtitle">
                Overview for <span className="app-subtitle-accent">{user?.department || 'Department'}</span>
              </p>
            </div>
          </div>
          
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* METRICS TOP ROW GRID */}
        <section className="metrics-summary-row">
          <div className="app-card metric-card-block hover-lift">
            <div className="card-title-bar">
              <Users size={16} className="tr-icon-maroon" />
              <span>Total Employees</span>
            </div>
            <div className="card-main-stat">250</div>
            <div className="team-distribution-subtext">
              <span className="team-tag team-a">● Team A <b>60</b></span>
              <span className="team-tag team-b">● Team B <b>80</b></span>
              <span className="team-tag team-c">● Team C <b>40</b></span>
              <span className="team-tag team-d">● Team D <b>30</b></span>
            </div>
          </div>

          <div className="app-card metric-card-block hover-lift" onClick={() => navigate('/leave-approvals')} style={{ cursor: 'pointer' }}>
            <div className="card-title-bar">
              <Calendar size={16} className="tr-icon-amber" />
              <span>Pending Approvals</span>
            </div>
            <div className="card-main-stat">{pendingLeaves.length}</div>
            <div className="approval-breakdown-subtext">
              <span className="badge-stat label-vacation">
                Vacation <b>{pendingLeaves.filter(r => (r.type || r.leave_type) === 'Vacation Leave').length}</b>
              </span>
              <span className="badge-stat label-sick">
                Sick <b>{pendingLeaves.filter(r => (r.type || r.leave_type) === 'Sick Leave').length}</b>
              </span>
              <span className="badge-stat label-emergency">
                Emergency <b>{pendingLeaves.filter(r => (r.type || r.leave_type) === 'Emergency Leave').length}</b>
              </span>
            </div>
          </div>

          <div className="app-card metric-card-block hover-lift" onClick={() => navigate('/anomaly-alerts')} style={{ cursor: 'pointer' }}>
            <div className="card-title-bar">
              <AlertTriangle size={16} className="tr-icon-maroon" />
              <span>Anomaly Alerts</span>
            </div>
            <div className="card-main-stat text-alert-red">4</div>
            <div className="anomaly-breakdown-pills">
              <span className="pill risk-high">2 High Risk</span>
              <span className="pill risk-medium">1 Medium Risk</span>
              <span className="pill risk-low">1 System Flag</span>
            </div>
          </div>
        </section>

        {/* MIDDLE SECTION Split Row */}
        <section className="dashboard-split-content-panel">
          {/* Left Block: Requests Table */}
          <div className="app-card content-data-box table-box-width">
            <div className="box-header-title" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)', fontWeight: '700' }}>
              {user?.department ? `${user.department} — Leave Requests` : 'Pending Leave Application Request'}
            </div>
            <div className="table-responsive-scroll">
              <table className="data-display-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 20px' }}>Employee Name</th>
                    <th style={{ padding: '12px 20px' }}>Leave Type</th>
                    <th style={{ padding: '12px 20px' }}>Date Filed</th>
                    <th style={{ padding: '12px 20px' }}>Status</th>
                    <th style={{ padding: '12px 20px' }}>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLeaves ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                        Loading requests...
                      </td>
                    </tr>
                  ) : leaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                        No leave applications found for this department.
                      </td>
                    </tr>
                  ) : (
                    leaveRequests.slice(0, 3).map((req) => {
                      const rawDateFiled = req.date_filed || req.created_at || req.date_key || req.date || req.start_date;
                      const formattedDate = formatDate(rawDateFiled);

                      const appId = req.id || req.application_id;
                      const employeeName = req.name || `${req.first_name || ''} ${req.last_name || ''}`.trim() || 'N/A';
                      const leaveType = req.type || req.leave_type || 'N/A';
                      const attachments = parseAttachments(req);

                      return (
                        <tr key={appId} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                          <td style={{ padding: '14px 20px', fontWeight: '600' }}>{employeeName}</td>
                          <td style={{ padding: '14px 20px' }}>{leaveType}</td>
                          <td style={{ padding: '14px 20px' }}>{formattedDate}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <span className={`status-badge status-${req.status?.toLowerCase()}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="link-cell" style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(req)}
                                style={{
                                  backgroundColor: 'var(--color-maroon)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Eye size={12} /> View Form
                              </button>

                              {attachments.length === 0 ? (
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>No attachments</span>
                              ) : (
                                attachments.map((att, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleOpenAttachment(att)}
                                    style={{
                                      backgroundColor: 'var(--color-info-bg)',
                                      color: 'var(--color-info)',
                                      border: '1px solid #93C5FD',
                                      borderRadius: '4px',
                                      padding: '3px 6px',
                                      cursor: 'pointer',
                                      fontSize: '10px',
                                      fontWeight: '600',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      maxWidth: '140px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <Paperclip size={10} />
                                    {typeof att === 'string'
                                      ? (req.attachment_name || `Attachment ${idx + 1}`)
                                      : (att.requirementLabel || att.fileName || att.attachment_name || `Attachment ${idx + 1}`)}
                                  </button>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="box-footer-action-link" style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border-light)', textAlign: 'right' }}>
              <Link
                to="/leave-approvals"
                style={{ textDecoration: 'none', color: 'var(--color-info)', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View All Requests</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Right Block: Forecast Visual Placeholder */}
          <div className="app-card content-data-box forecast-box-width" onClick={() => navigate('/workforce-forecast')} style={{ cursor: 'pointer' }}>
            <div className="box-header-title" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)', fontWeight: '700' }}>Workforce Availability</div>
            <div className="forecast-chart-mock-body" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="chart-header-stats" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                <span>Peak: <b style={{ color: 'var(--color-success)' }}>95% Consistency</b></span>
                <span>Avg. Check-In: <b style={{ color: 'var(--color-text-primary)' }}>07:51 AM</b></span>
              </div>
              <div className="mock-graph-graphic-line" style={{ flex: 1, backgroundColor: 'var(--color-border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>Live Forecast View</span>
              </div>
              <div className="chart-footer-caption" style={{ marginTop: '16px', textAlign: 'right' }}>
                <Link
                  to="/workforce-forecast"
                  style={{ textDecoration: 'none', color: 'var(--color-info)', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>View Full Forecast</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION Staffing Risk Banner */}
        <section className="app-card staffing-risk-alert-banner hover-lift" style={{ marginTop: '24px' }}>
          <div className="alert-banner-inner" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="alert-icon-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
              <Ban size={28} className="tr-icon-maroon" style={{ color: 'var(--color-danger)', marginBottom: '8px' }} />
              <h4 style={{ margin: 0, color: 'var(--color-danger)', fontWeight: '700' }}>Staffing Risk</h4>
            </div>
            <div className="alert-description-text" style={{ flex: 1, fontSize: '14px', lineHeight: '1.5', color: 'var(--color-text-primary)' }}>
              Estimated availability: <span className="danger-text-percentage" style={{ fontWeight: '800', color: 'var(--color-danger)', fontSize: '16px' }}>58%</span> <br />
              System predicts severe staffing risk for the team during this period. Overlapping leave requests and seasonal trend analysis indicate a critical bottleneck. Immediate attention is required. Prescriptive rescheduling recommended.
            </div>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/department-reports')}
              style={{ flexShrink: 0 }}
            >
              View Report
            </button>
          </div>
        </section>

      </main>

      {/* UI FIX: Refactored Document Preview Modal to use standard CSS classes */}
      {isPreviewOpen && (
        <div className="app-modal-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div 
            className="app-modal-card" 
            style={{ maxWidth: '850px', height: '85vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="modal-header-bar" 
              style={{ backgroundColor: 'var(--color-maroon)', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{previewTitle}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, backgroundColor: '#525659' }}>
              <iframe
                src={previewPdfUrl}
                title={previewTitle}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}