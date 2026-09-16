// src/features/dashboard/dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck, History, Search, FilePlus, Eye, X, Paperclip, ChevronRight, Clock, Calendar
} from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import { buildLeavePdfBytes } from '../leave/generateLeavePdf.js';
import './dashboard.css';

const formatPdfDate = (dateVal) => {
  if (!dateVal) return '';
  const parsed = new Date(dateVal);
  if (isNaN(parsed.getTime())) return String(dateVal);
  return parsed.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const createBlobUrlFromBase64 = (base64Data, mimeType = 'application/pdf') => {
  try {
    let cleanBase64 = base64Data;
    if (cleanBase64.includes(',')) {
      cleanBase64 = cleanBase64.split(',')[1];
    }
    cleanBase64 = cleanBase64.replace(/\s/g, '');

    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error creating Blob URL from base64:', err);
    return null;
  }
};

export default function Dashboard({ onLogout, user }) {
  const navigate = useNavigate();
  const isRestricted = user?.role === 'Restricted Self-Service';

  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('Leave Application Document Preview');
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [previewFileType, setPreviewFileType] = useState('pdf');

  const [activeFeedback, setActiveFeedback] = useState(null);

  const normalizeAttachments = (row) => {
    if (Array.isArray(row.attachment_urls) && row.attachment_urls.length > 0) {
      return row.attachment_urls;
    }

    const rawData = row.attachment_data || row.attachment_url;

    if (
      !rawData ||
      typeof rawData !== 'string' ||
      rawData.trim() === '' ||
      rawData === 'null' ||
      rawData === 'undefined' ||
      rawData.length < 30
    ) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          fileName: item.fileName || item.requirementLabel || 'Attached Document',
          requirementLabel: item.requirementLabel || item.fileName || 'Attachment',
          dataUrl: item.base64Data || item.dataUrl || item.rawData || item.url,
          fileType: item.fileType || 'application/pdf'
        }));
      }
    } catch {
      // Not JSON string
    }

    const fileName = row.attachment_name || 'Attached Document.pdf';
    return [{
      fileName,
      requirementLabel: fileName,
      dataUrl: rawData
    }];
  };

  useEffect(() => {
    if (isRestricted) return;

    const fetchRecentLeaves = async () => {
      if (!user?.employee_key) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/leave-applications/${user.employee_key}`);

        if (response.ok) {
          const data = await response.json();
          let rawList = [];

          if (Array.isArray(data)) {
            rawList = data;
          } else if (data && Array.isArray(data.history)) {
            rawList = data.history;
            setLeaveSummary(data.summary || {});
          }

          const formatted = rawList.map((row) => ({
            ...row,
            attachment_urls: normalizeAttachments(row)
          }));

          setRecentLeaves(formatted);
        } else {
          console.error('Failed to fetch leave applications:', response.status);
          setRecentLeaves([]);
        }
      } catch (err) {
        console.warn('API offline or unreachable.', err);
        setRecentLeaves([]);
      }
    };

    fetchRecentLeaves();
  }, [user, isRestricted]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getUsedDays = (leaveType) => {
    const entry = leaveSummary[leaveType];
    return entry ? entry.used.toFixed(1) : '0.0';
  };

  const totalDaysUsed = Object.values(leaveSummary)
    .reduce((sum, entry) => sum + (entry?.used || 0), 0)
    .toFixed(1);

  const leavesArray = Array.isArray(recentLeaves) ? recentLeaves : [];

  const filteredLeaves = leavesArray.filter((leave) => {
    return (
      (leave.leave_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (leave.status || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (leave.remarks || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenPdf = async (leaveRecord) => {
    setIsLoadingPdf(true);
    try {
      const storedBase64 = leaveRecord.pdf_url || leaveRecord.pdf_document || leaveRecord.pdfBase64 || leaveRecord.pdf_base64;

      if (storedBase64 && storedBase64.length > 50) {
        const blobUrl = createBlobUrlFromBase64(storedBase64, 'application/pdf');
        if (blobUrl) {
          setPreviewTitle('CS Form No. 6 Application Preview');
          setPreviewFileType('pdf');
          setSelectedPdfUrl(blobUrl);
        } else {
          alert('Failed to parse CS Form PDF.');
        }
      } else {
        const formData = {
          filingDate: formatPdfDate(leaveRecord.date_key || leaveRecord.date_filed || leaveRecord.created_at),
          leaveType: leaveRecord.leave_type,
          othersSpecify: leaveRecord.others_specify,
          vacationSplLocation: leaveRecord.vacation_spl_location,
          locationSpecify: leaveRecord.location_specify,
          abroadSpecify: leaveRecord.abroad_specify,
          sickLeaveType: leaveRecord.sick_leave_type,
          illnessSpecify: leaveRecord.illness_specify,
          studyLeavePurpose: leaveRecord.study_leave_purpose,
          othersPurpose: leaveRecord.others_purpose,
          workingDays: leaveRecord.working_days || leaveRecord.days_applied,
          inclusiveDateFrom: formatPdfDate(leaveRecord.start_date || leaveRecord.inclusive_date_from),
          inclusiveDateTo: formatPdfDate(leaveRecord.end_date || leaveRecord.inclusive_date_to),
          commutation: leaveRecord.commutation || 'not-requested'
        };

        const pdfBytes = await buildLeavePdfBytes(formData, user);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setPreviewTitle('CS Form No. 6 Application Preview');
        setPreviewFileType('pdf');
        setSelectedPdfUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error('Failed to display PDF preview:', err);
      alert('Could not open document preview.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleOpenAttachment = (attachment) => {
    const fileName = attachment.fileName || 'Attachment';
    setPreviewTitle(attachment.requirementLabel || fileName);

    const rawData = attachment.dataUrl || attachment.rawData || attachment.url || attachment.base64Data;

    if (!rawData) {
      alert('No attached file binary found for this document.');
      return;
    }

    const lowerName = fileName.toLowerCase();
    const isImage =
      (attachment.fileType && attachment.fileType.startsWith('image/')) ||
      rawData.startsWith('data:image') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.webp');

    if (rawData.startsWith('http') || rawData.startsWith('data:')) {
      setPreviewFileType(isImage ? 'image' : 'pdf');
      setSelectedPdfUrl(rawData);
      return;
    }

    const mimeType = isImage ? (lowerName.endsWith('.png') ? 'image/png' : 'image/jpeg') : 'application/pdf';
    const blobUrl = createBlobUrlFromBase64(rawData, mimeType);

    if (blobUrl) {
      setPreviewFileType(isImage ? 'image' : 'pdf');
      setSelectedPdfUrl(blobUrl);
    } else {
      alert('Unable to load document attachment.');
    }
  };

  const handleClosePdf = () => {
    if (selectedPdfUrl && selectedPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(selectedPdfUrl);
    }
    setSelectedPdfUrl(null);
  };

  return (
    <div className="dashboard-container">
      <RoleSidebar user={user} />

      <main className="dashboard-main-content fade-in-up">
        <Header
          title="Personal Dashboard"
          user={user}
          onLogout={onLogout}
        />

        {!isRestricted && (
          <section className="leave-summary-metrics-bar">
            <div className="metric-cell hover-lift">
              <div className="metric-card-inner">
                <span className="metric-title-label">Sick Leave</span>
                <span className="metric-numeric-value">{getUsedDays('Sick Leave')} <span className="unit-label">Days</span></span>
              </div>
            </div>
            <div className="metric-cell hover-lift">
              <div className="metric-card-inner">
                <span className="metric-title-label">Vacation Leave</span>
                <span className="metric-numeric-value">{getUsedDays('Vacation Leave')} <span className="unit-label">Days</span></span>
              </div>
            </div>
            <div className="metric-cell hover-lift">
              <div className="metric-card-inner">
                <span className="metric-title-label">Emergency Leave</span>
                <span className="metric-numeric-value">{getUsedDays('Emergency Leave')} <span className="unit-label">Days</span></span>
              </div>
            </div>
            <div
              className="metric-cell action-cell hover-lift"
              onClick={() => navigate('/leavehistory')}
            >
              <div className="action-cell-content">
                <span className="see-more-hyperlink">
                  See Details
                </span>
                <ChevronRight size={16} className="arrow-icon" />
              </div>
            </div>
          </section>
        )}

        <section className={`analytics-display-grid ${isRestricted ? 'single-card' : ''}`}>
          {!isRestricted && (
            <div className="analytics-visual-card hover-lift">
              <div className="card-header-flex">
                <h3 className="card-section-title">
                  <History size={18} className="title-icon" /> My Leave Application
                </h3>
              </div>
              <div className="mock-graphic-frame">
                <div className="chart-flex-container">
                  <div className="donut-graphic-mock">
                    <div className="donut-ring-bg"></div>
                    <div className="donut-center-label">
                      <span className="donut-sub">TOTAL USED</span>
                      <span className="donut-main">{totalDaysUsed}</span>
                      <span className="donut-unit">DAYS</span>
                    </div>
                  </div>
                  <div className="chart-legend-stack">
                    <div className="legend-row-item">
                      <span className="legend-swatch color-primary"></span>
                      <div className="legend-info">
                        <p className="legend-label">Vacation Leave</p>
                        <p className="legend-sub-label">{getUsedDays('Vacation Leave')} Days Used</p>
                      </div>
                    </div>
                    <div className="legend-row-item">
                      <span className="legend-swatch color-secondary"></span>
                      <div className="legend-info">
                        <p className="legend-label">Sick Leave</p>
                        <p className="legend-sub-label">{getUsedDays('Sick Leave')} Days Used</p>
                      </div>
                    </div>
                    <div className="legend-row-item">
                      <span className="legend-swatch color-tertiary"></span>
                      <div className="legend-info">
                        <p className="legend-label">Emergency Leave</p>
                        <p className="legend-sub-label">{getUsedDays('Emergency Leave')} Days Used</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="graphic-footer-caption">My Leave Application Analysis</p>
              </div>
            </div>
          )}

          <div className="analytics-visual-card hover-lift" onClick={() => navigate('/attendance')} style={{ cursor: 'pointer' }}>
            <div className="card-header-flex">
              <h3 className="card-section-title">
                <UserCheck size={18} className="title-icon" /> My Attendance
              </h3>
            </div>
            <div className="mock-graphic-frame">
              <div className="attendance-chart-mock">
                <div className="time-stamp-marker stamp-top">
                  <Clock size={11} /> 07:48 AM
                </div>
                <div className="time-stamp-marker stamp-bottom">
                  <Clock size={11} /> 07:48 AM
                </div>

                <svg viewBox="0 0 400 100" className="sparkline-svg-vector">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7a0000" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7a0000" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 60 Q 40 40 80 70 T 160 50 T 240 75 T 320 35 T 400 55 L 400 100 L 0 100 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M 0 60 Q 40 40 80 70 T 160 50 T 240 75 T 320 35 T 400 55"
                    fill="none"
                    stroke="#7a0000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="70" r="4" fill="#7a0000" stroke="#fff" strokeWidth="2" />
                  <circle cx="240" cy="75" r="4" fill="#7a0000" stroke="#fff" strokeWidth="2" />
                  <circle cx="320" cy="35" r="4" fill="#7a0000" stroke="#fff" strokeWidth="2" />
                </svg>

                <div className="axis-labels-timeline">
                  <span>Day 1</span>
                  <span>Day 10</span>
                  <span>Day 20</span>
                  <span>Day 30</span>
                </div>
              </div>

              <div className="attendance-summary-data-strip">
                <div className="streak-badge">Current Streak: <strong>12 days</strong></div>
                <div className="avg-checkin-badge">Avg. Check-In: <strong>07:51 AM</strong></div>
              </div>
              <p className="graphic-footer-caption">My 30 Day Attendance Consistency</p>
            </div>
          </div>
        </section>

        {!isRestricted && (
          <section className="table-wrapper-section">
            <section className="data-table-container-card">
              <div className="table-header-toolbar">
                <div className="table-header-left">
                  <h3 className="table-title">Recent Leave Applications</h3>
                  <button
                    type="button"
                    className="see-more-table-btn"
                    onClick={() => navigate('/leavehistory')}
                  >
                    See More <ChevronRight size={14} />
                  </button>
                </div>

                <div className="table-header-right">
                  <div className="search-bar-input-wrapper">
                    <Search size={15} className="search-lens-embed" />
                    <input
                      type="text"
                      placeholder="Search recent filings..."
                      className="utility-search-field"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    className="primary-action-trigger-btn"
                    onClick={() => navigate('/leaveapplication')}
                  >
                    <FilePlus size={16} />
                    <span>File New Leave</span>
                  </button>
                </div>
              </div>

              <div className="responsive-table-overflow-scroller">
                <table className="record-grid-system">
                  <thead>
                    <tr>
                      <th>Date Filed</th>
                      <th>Leave Type</th>
                      <th>Status</th>
                      <th>Attachments</th>
                      <th style={{ textAlign: 'right' }}>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.length > 0 ? (
                      filteredLeaves.slice(0, 3).map((leave) => {
                        const attachments = Array.isArray(leave.attachment_urls) ? leave.attachment_urls : [];
                        const hasFeedback = leave.remarks && leave.remarks !== 'Filed via System';
                        const statusLower = leave.status ? leave.status.toLowerCase().replace(/\s+/g, '-') : '';

                        return (
                          <tr key={leave.application_id || leave.id}>
                            <td className="cell-date">
                              <Calendar size={13} className="cell-icon" />
                              {formatDate(leave.created_at || leave.date_key)}
                            </td>
                            <td className="cell-type">{leave.leave_type}</td>
                            <td>
                              <span className={`status-badge status-${statusLower}`}>
                                <span className="status-dot"></span>
                                {leave.status}
                              </span>
                              {hasFeedback && (
                                <button
                                  type="button"
                                  onClick={() => setActiveFeedback(leave)}
                                  className="feedback-trigger-link"
                                  title="View feedback from your HOD"
                                >
                                  View HOD feedback
                                </button>
                              )}
                            </td>
                            <td>
                              {attachments.length === 0 ? (
                                <span className="dimmed-empty-cell">—</span>
                              ) : (
                                <div className="attachment-chips-container">
                                  {attachments.map((att, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleOpenAttachment(att)}
                                      className="attachment-chip-btn"
                                      title={att.fileName || att.requirementLabel}
                                    >
                                      <Paperclip size={12} />
                                      <span className="chip-label">{att.requirementLabel || att.fileName || `Attachment ${idx + 1}`}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenPdf(leave)}
                                className="btn-download-pdf-table"
                                disabled={isLoadingPdf}
                              >
                                <Eye size={14} /> View Form
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-table-cell">
                          No recent filings found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}
      </main>

      {/* --- HOD FEEDBACK MODAL --- */}
      {activeFeedback && (
        <div className="modal-overlay-backdrop" onClick={() => setActiveFeedback(null)}>
          <div className="modal-container-card feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar feedback-header">
              <span>Feedback on your {activeFeedback.leave_type} request</span>
              <button
                className="modal-close-btn"
                onClick={() => setActiveFeedback(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body-content">
              <p className="feedback-text">{activeFeedback.remarks}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- IN-PAGE DOCUMENT PREVIEW MODAL --- */}
      {selectedPdfUrl && (
        <div className="modal-overlay-backdrop" onClick={handleClosePdf}>
          <div className="modal-container-card pdf-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar pdf-header">
              <h3 className="modal-title">{previewTitle}</h3>
              <button
                type="button"
                onClick={handleClosePdf}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="pdf-preview-viewport">
              {previewFileType === 'image' ? (
                <img src={selectedPdfUrl} alt="Attachment Preview" className="image-preview-render" />
              ) : (
                <iframe
                  src={selectedPdfUrl}
                  title={previewTitle}
                  className="iframe-preview-render"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}