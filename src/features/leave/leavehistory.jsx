import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Eye,
  X,
  Paperclip
} from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import { buildLeavePdfBytes } from '../leave/generateLeavePdf.js';
import './leavehistory.css';

const LEAVE_TYPES = ['Sick Leave', 'Vacation Leave', 'Emergency Leave'];

const formatPdfDate = (dateVal) => {
  if (!dateVal) return '';
  const parsed = new Date(dateVal);
  if (isNaN(parsed.getTime())) return String(dateVal);
  return parsed.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const getCleanHodRemark = (req) => {
  if (!req) return '';

  const raw =
    req.hodRemarks ??
    req.hod_remarks ??
    req.hod_remark ??
    req.hodComment ??
    req.hod_comments ??
    req.hod_comment ??
    req.hodNote ??
    req.hod_note ??
    req.approval_remarks ??
    req.approval_remark ??
    req.approver_remarks ??
    req.rejection_reason ??
    req.rejection_remarks ??
    req.disapproval_reason ??
    req.disapproval_remarks ??
    req.action_reason ??
    req.reason ??
    req.comment ??
    '';

  return String(raw).trim();
};

export default function LeaveHistory({ onNavigate, onLogout, user }) {
  const navigate = useNavigate();

  // Filter States
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Modal Preview States
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('Leave Application Document Preview');
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  useEffect(() => {
    const fetchLeaveData = async () => {
      const empId = user?.employee_key || user?.employee_id || user?.id;
      if (!empId) return;

      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/leave-applications/${empId}`);

        if (response.ok) {
          const data = await response.json();

          const history = Array.isArray(data.history)
            ? data.history
            : Array.isArray(data.applications)
              ? data.applications
              : [];

          const mappedRecords = history.map((row) => {
            const fetchedHodRemark = getCleanHodRemark(row);

            return {
              id: row.application_id || row.id,
              dateFiled: formatDate(row.date_filed || row.dateFiled),
              rawDate: row.date_filed || row.dateFiled,
              leaveType: row.leave_type || row.leaveType || '',
              status: row.status || 'Pending',
              days: `${parseFloat(row.working_days || row.workingDays || 0)} Day${parseFloat(row.working_days || row.workingDays) === 1 ? '' : 's'}`,
              workingDaysNum: parseFloat(row.working_days || row.workingDays || 0),
              remarks: row.remarks || '',
              hodRemarks: fetchedHodRemark,
              attachments: (() => {
                if (Array.isArray(row.attachment_urls) && row.attachment_urls.length > 0) {
                  return row.attachment_urls
                    .filter((att) => {
                      const val = typeof att === 'string' ? att : (att.dataUrl || att.url || att.file_url || att.attachment_url || att.attachment_data);
                      return val && String(val).trim().length > 0;
                    })
                    .map((att) => ({
                      fileName: att.fileName || att.name || row.attachment_name || 'Attached Document.pdf',
                      dataUrl: att.dataUrl || att.url || att.file_url || att.attachment_url || att.attachment_data || att,
                      requirementLabel: att.requirementLabel || att.label || ''
                    }));
                }

                const attachSource = row.attachment_url || row.attachment_data;
                const hasValidSource = attachSource && String(attachSource).trim().length > 0 && attachSource !== 'null' && attachSource !== 'undefined';

                if (hasValidSource) {
                  return [{
                    fileName: row.attachment_name || 'Attached Document.pdf',
                    dataUrl: attachSource,
                    requirementLabel: row.attachment_label || ''
                  }];
                }

                return [];
              })(),
              raw: row
            };
          });

          setLeaveRecords(mappedRecords);

          // Fallback summary calculation if not returned from API
          if (data.summary && Object.keys(data.summary).length > 0) {
            setSummary(data.summary);
          } else {
            const computedSummary = {};
            LEAVE_TYPES.forEach(type => {
              const used = mappedRecords
                .filter(r => r.leaveType === type && r.status === 'Approved')
                .reduce((sum, r) => sum + r.workingDaysNum, 0);
              computedSummary[type] = { remaining: 15 - used, used };
            });
            setSummary(computedSummary);
          }

        } else {
          console.error('Failed to fetch leave history:', response.status);
          setLeaveRecords([]);
        }
      } catch (err) {
        console.warn('API offline or unreachable.', err);
        setLeaveRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveData();
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const handleOpenPdf = async (leaveRecord) => {
    if (!leaveRecord) return;
    setIsLoadingPdf(true);
    try {
      const storedBase64 = leaveRecord.pdfBase64 || leaveRecord.pdf_base64 || leaveRecord.pdf_document;

      if (storedBase64) {
        let cleanBase64 = storedBase64;
        if (cleanBase64.includes(',')) {
          cleanBase64 = cleanBase64.split(',')[1];
        }
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        setPreviewTitle('Leave Application Document Preview');
        setSelectedPdfUrl(URL.createObjectURL(blob));
      } else {
        const formData = {
          filingDate: formatPdfDate(leaveRecord.date_key || leaveRecord.date_filed || leaveRecord.filing_date),
          leaveType: leaveRecord.leave_type || leaveRecord.leaveType,
          othersSpecify: leaveRecord.others_specify,
          vacationSplLocation: leaveRecord.vacation_spl_location,
          locationSpecify: leaveRecord.location_specify,
          abroadSpecify: leaveRecord.abroad_specify,
          sickLeaveType: leaveRecord.sick_leave_type,
          illnessSpecify: leaveRecord.illness_specify,
          studyLeavePurpose: leaveRecord.study_leave_purpose,
          othersPurpose: leaveRecord.others_purpose,
          workingDays: leaveRecord.working_days || leaveRecord.days_applied || leaveRecord.workingDays,
          inclusiveDateFrom: formatPdfDate(leaveRecord.start_date || leaveRecord.inclusive_date_from),
          inclusiveDateTo: formatPdfDate(leaveRecord.end_date || leaveRecord.inclusive_date_to),
          hodRemarks: getCleanHodRemark(leaveRecord),
          commutation: leaveRecord.commutation || 'not-requested'
        };

        const pdfBytes = await buildLeavePdfBytes(formData, user);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setPreviewTitle('Leave Application Document Preview');
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
    let rawSrc = attachment.dataUrl || attachment.url || attachment.attachment_url || attachment.attachment_data;
    if (!rawSrc) {
      alert('Attachment target is unavailable.');
      return;
    }

    const title = attachment.fileName || attachment.requirementLabel || 'Supporting Document';
    setPreviewTitle(title);

    if (typeof rawSrc === 'string' && (rawSrc.startsWith('http://') || rawSrc.startsWith('https://') || rawSrc.startsWith('blob:'))) {
      setSelectedPdfUrl(rawSrc);
      return;
    }

    if (typeof rawSrc === 'string' && rawSrc.startsWith('data:')) {
      setSelectedPdfUrl(rawSrc);
      return;
    }

    if (typeof rawSrc === 'string' && !rawSrc.startsWith('/') && !rawSrc.startsWith('http')) {
      const mimeType = title.toLowerCase().endsWith('.png') ? 'image/png'
        : title.toLowerCase().endsWith('.jpg') || title.toLowerCase().endsWith('.jpeg') ? 'image/jpeg'
          : 'application/pdf';
      setSelectedPdfUrl(`data:${mimeType};base64,${rawSrc}`);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const formattedUrl = rawSrc.startsWith('/') ? `${apiUrl}${rawSrc}` : `${apiUrl}/${rawSrc}`;
    setSelectedPdfUrl(formattedUrl);
  };

  const handleClosePdf = () => {
    if (selectedPdfUrl && selectedPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(selectedPdfUrl);
    }
    setSelectedPdfUrl(null);
  };

  const filteredRecords = leaveRecords.filter((record) => {
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    const matchesType = leaveTypeFilter === 'All' || record.leaveType === leaveTypeFilter;
    const matchesSearch =
      record.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.dateFiled.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.hodRemarks.toLowerCase().includes(searchQuery.toLowerCase());

    const recordDate = record.rawDate ? new Date(record.rawDate) : null;
    const isValidDate = recordDate && !isNaN(recordDate.getTime());

    const matchesFrom = !dateFrom || (isValidDate && recordDate >= new Date(dateFrom));
    const matchesTo = !dateTo || (isValidDate && recordDate <= new Date(dateTo));

    return matchesStatus && matchesType && matchesSearch && matchesFrom && matchesTo;
  });

  const hasActiveFilters = dateFrom || dateTo || statusFilter !== 'All' || leaveTypeFilter !== 'All' || searchQuery;

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('All');
    setLeaveTypeFilter('All');
    setSearchQuery('');
  };

  const getRemaining = (type) => summary[type]?.remaining ?? 0;
  const getUsed = (type) => summary[type]?.used ?? 0;

  const totalRemaining = LEAVE_TYPES.reduce((sum, t) => sum + getRemaining(t), 0);
  const totalUsed = LEAVE_TYPES.reduce((sum, t) => sum + getUsed(t), 0);
  const totalAvailableAndUsed = totalRemaining + totalUsed;

  const donutSegments = (() => {
    if (totalRemaining <= 0) return [];
    let cumulative = 0;
    const colors = { 'Sick Leave': '#d97706', 'Vacation Leave': '#680000', 'Emergency Leave': '#475569' };
    return LEAVE_TYPES.map((type) => {
      const value = getRemaining(type);
      const pct = (value / totalRemaining) * 100;
      const segment = {
        type,
        color: colors[type],
        dasharray: `${pct.toFixed(2)} ${(100 - pct).toFixed(2)}`,
        dashoffset: -cumulative,
      };
      cumulative += pct;
      return segment;
    });
  })();

  const usedBarSegments = LEAVE_TYPES.map((type) => {
    const used = getUsed(type);
    const widthPct = totalAvailableAndUsed > 0 ? (used / totalAvailableAndUsed) * 100 : 0;
    return { type, used, widthPct };
  });

  const emptyBarWidthPct = totalAvailableAndUsed > 0
    ? Math.max(0, 100 - usedBarSegments.reduce((s, seg) => s + seg.widthPct, 0))
    : 100;

  return (
    <div className="dashboard-container">
      <RoleSidebar user={user} />

        <main className="dashboard-main-content fade-in-up">
        <Header user={user} onLogout={onLogout} title="Leave History" badgeText="RECORDS" />

        {/* METRIC PANEL */}
        <section className="analytics-display-grid">
          {/* Card 1: Remaining Leave Balance */}
          <div className="analytics-visual-card hover-lift">
            <div className="lh-card-header">
              <h3 className="card-section-title">
                <Calendar size={16} className="title-icon" /> Remaining Leave Balance
              </h3>
            </div>

            <div className="mock-graphic-frame">
              <div className="chart-flex-container">
                <div className="donut-wrapper">
                  <svg viewBox="0 0 36 36" className="donut-chart-svg">
                    {donutSegments.map((seg) => (
                      <circle
                        key={seg.type}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="4"
                        strokeDasharray={seg.dasharray}
                        strokeDashoffset={seg.dashoffset}
                      />
                    ))}
                  </svg>
                  <div className="donut-center-badge">
                    <Calendar size={18} className="donut-center-icon" />
                  </div>
                </div>

                <div className="chart-legend-stack">
                  <div className="lh-total-val-badge">{totalRemaining.toFixed(1)} Days</div>
                  <div className="legend-row-item">
                    <span className="legend-swatch swatch-amber"></span>
                    <span className="legend-text">Sick Leave ({getRemaining('Sick Leave').toFixed(2)} days)</span>
                  </div>
                  <div className="legend-row-item">
                    <span className="legend-swatch swatch-maroon"></span>
                    <span className="legend-text">Vacation Leave ({getRemaining('Vacation Leave').toFixed(2)} days)</span>
                  </div>
                  <div className="legend-row-item">
                    <span className="legend-swatch swatch-slate"></span>
                    <span className="legend-text">Emergency Leave ({getRemaining('Emergency Leave').toFixed(2)} days)</span>
                  </div>
                </div>
              </div>

              <div className="lh-card-footer-action">
                <button
                  className="lh-see-more-btn"
                  onClick={() => navigate('/leaveledger')}
                >
                  See Details →
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Leaves Used Progress Tracking */}
          <div className="analytics-visual-card hover-lift">
            <div className="lh-card-header">
              <h3 className="card-section-title">
                <FileText size={16} className="title-icon" /> Leaves Used
              </h3>
            </div>

            <div className="mock-graphic-frame">
              <div className="lh-stat-total-display">
                <span className="lh-stat-number">{totalUsed.toFixed(1)}</span>
                <span className="lh-stat-unit">Days Used This Year</span>
              </div>

              <div className="lh-progress-stacked-bar">
                {usedBarSegments.map((seg) => (
                  seg.widthPct > 0 && (
                    <div
                      key={seg.type}
                      className={`bar-segment ${seg.type === 'Sick Leave' ? 'seg-sick' : seg.type === 'Vacation Leave' ? 'seg-vacation' : 'seg-emergency'}`}
                      style={{ width: `${seg.widthPct}%` }}
                    >
                      <span>{seg.used.toFixed(1)} days</span>
                      <span className="segment-sub">{seg.type}</span>
                    </div>
                  )
                ))}
                <div className="bar-segment seg-empty" style={{ width: `${emptyBarWidthPct}%` }}></div>
              </div>

              <div className="lh-stacked-legend">
                <span>Used: <strong>{totalUsed.toFixed(1)} days</strong></span>
                <span>Available: <strong>{totalRemaining.toFixed(1)} days</strong></span>
              </div>

              <div className="lh-card-footer-action">
                <button
                  className="lh-see-more-btn"
                  onClick={() => navigate('/leaveledger')}
                >
                  See Breakdown →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FILTER CONTROLS */}
        <section className="filter-utilities-panel">
          <div className="filter-panel-header-row">
            <div className="filter-section-title">
              <Filter size={15} color="#7a0000" /> Filter Options
            </div>
            {hasActiveFilters && (
              <button type="button" className="lh-clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          <div className="filter-controls-grid">
            <div className="filter-field-wrapper">
              <label>Date Filed From</label>
              <div className="input-with-icon">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="filter-input-element"
                />
              </div>
            </div>

            <div className="filter-field-wrapper">
              <label>Date Filed To</label>
              <div className="input-with-icon">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="filter-input-element"
                />
              </div>
            </div>

            <div className="filter-field-wrapper">
              <label>Status</label>
              <div className="input-with-icon">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select-element"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown size={15} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-wrapper">
              <label>Leave Type</label>
              <div className="input-with-icon">
                <select
                  value={leaveTypeFilter}
                  onChange={(e) => setLeaveTypeFilter(e.target.value)}
                  className="filter-select-element"
                >
                  <option value="All">All Types</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation Leave">Vacation Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
                <ChevronDown size={15} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-wrapper filter-field-search">
              <label>Search Keywords</label>
              <div className="input-with-icon">
                <Search size={15} className="field-icon-left" />
                <input
                  type="text"
                  placeholder="Type keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="filter-input-element has-left-icon"
                />
              </div>
            </div>
          </div>
        </section>

        {/* DATA TABLE */}
        <section className="data-table-container-card">
          <div className="table-header-title-banner white-text-banner">
            <span>Leave Application Table</span>
            <span className="table-header-caption light-caption">
              Showing {filteredRecords.length} entries
            </span>
          </div>

          <div className="responsive-table-overflow-scroller">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Date Filed</th>
                  <th>Leave Type</th>
                  <th>Status</th>
                  <th>HOD Remarks</th>
                  <th>Days</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="empty-table-notice">Loading leave history...</td>
                  </tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.dateFiled}</td>
                      <td>{item.leaveType}</td>
                      <td>
                        <span className={`status-badge status-${item.status ? item.status.toLowerCase() : ''}`}>
                          <span className="status-dot"></span>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.hodRemarks ? (
                          <div style={{
                            fontSize: '12px',
                            color: '#475569',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            display: 'inline-block',
                            maxWidth: '220px',
                            lineHeight: '1.4'
                          }}>
                            <span style={{ fontWeight: 600, color: '#334155', marginRight: '4px' }}>Note:</span>
                            {item.hodRemarks}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td>
                        <strong className="days-counter-label">{item.days}</strong>
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'middle', padding: '12px' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenPdf(item.raw)}
                            className="table-action-details-btn"
                            disabled={isLoadingPdf}
                            style={{ margin: 0, whiteSpace: 'nowrap' }}
                          >
                            <Eye size={14} /> View Details <ChevronRight size={14} />
                          </button>

                          {item.attachments.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                              {item.attachments.map((att, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleOpenAttachment(att)}
                                  title={att.fileName}
                                  style={{
                                    backgroundColor: '#F1F5F9',
                                    color: '#334155',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '4px',
                                    padding: '3px 8px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    maxWidth: '160px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    lineHeight: '1.2'
                                  }}
                                >
                                  <Paperclip size={11} style={{ flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {att.requirementLabel || att.fileName || `Attachment ${idx + 1}`}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-table-notice">
                      No leave history records match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedPdfUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
          onClick={handleClosePdf}
        >
          <div
            style={{
              backgroundColor: '#fff',
              width: '85%',
              maxWidth: '900px',
              height: '85vh',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '12px 20px',
                backgroundColor: '#7a0000',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                {previewTitle}
              </h3>
              <button
                type="button"
                onClick={handleClosePdf}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, width: '100%', height: '100%' }}>
              <iframe
                src={selectedPdfUrl}
                title={previewTitle}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
