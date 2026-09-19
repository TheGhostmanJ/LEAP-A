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

        {/* WORKFLOW STATUS TRACKER */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div className="app-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-border-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} color="var(--color-text-secondary)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Total Applications</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{totalApplications}</div>
                        </div>
                    </div>
                    <div className="app-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-warning-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={20} color="var(--color-warning)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Pending Review</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{pendingCount}</div>
                        </div>
                    </div>
                    <div className="app-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-success-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={20} color="var(--color-success)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Approved</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{approvedCount}</div>
                        </div>
                    </div>
                    <div className="app-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-danger-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <XCircle size={20} color="var(--color-danger)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Rejected</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{rejectedCount}</div>
                        </div>
                    </div>
                </section>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Filter by Status</label>
                        <select className="app-search-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Filter by Leave Type</label>
                        <select className="app-search-input" value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)}>
                            <option value="All">All Types</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Vacation Leave">Vacation Leave</option>
                            <option value="Emergency Leave">Emergency Leave</option>
                        </select>
                    </div>
                </div>

                {/* THE APPLICATION TRACKER TABLE - Focuses entirely on the form itself */}
                <section className="app-card">
                    <div className="app-card-header">Leave Application Vault</div>
                    <div className="responsive-table-overflow-scroller">
                        <table className="record-grid-system">
                            <thead>
                                <tr>
                                    <th>Date Filed</th>
                                    <th>Leave Type</th>
                                    <th>Inclusive Dates (Start - End)</th>
                                    <th>HOD Remarks</th>
                                    <th style={{ textAlign: 'center' }}>Workflow Status</th>
                                    <th style={{ textAlign: 'right' }}>Document Vault</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading leave history...</td></tr>
                                ) : filteredRecords.length > 0 ? (
                                    filteredRecords.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.dateFiled}</td>
                                            <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                                {item.leaveType}
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{item.days} requested</div>
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{item.inclusiveDates}</td>
                                            <td>
                                                {item.hodRemarks ? (
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-border-light)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px 10px', display: 'inline-block', maxWidth: '220px' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginRight: '4px' }}>Note:</span>
                                                        {item.hodRemarks}
                                                    </div>
                                                ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`app-status-badge ${item.status === 'Approved' ? 'status-success' : item.status === 'Rejected' ? 'status-danger' : 'status-warning'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                    <button type="button" onClick={() => handleOpenPdf(item.raw)} className="btn-primary" disabled={isLoadingPdf} style={{ padding: '6px 12px', fontSize: '12px' }}>
                                                        <Eye size={14} /> View CS Form 6
                                                    </button>
                                                    {item.attachments.map((att, idx) => (
                                                        <button key={idx} type="button" onClick={() => handleOpenAttachment(att)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                                            <Paperclip size={12} /> View Attachment
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>No leave history records match your criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* DOCUMENT PREVIEW MODAL */}
            {selectedPdfUrl && (
                <div className="app-modal-overlay" onClick={handleClosePdf}>
                    <div className="app-modal-card" style={{ maxWidth: '900px', height: '85vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-bar" style={{ backgroundColor: 'var(--color-maroon)', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{previewTitle}</h3>
                            <button onClick={handleClosePdf} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ flex: 1 }}>
                            <iframe src={selectedPdfUrl} title={previewTitle} style={{ width: '100%', height: '100%', border: 'none' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
