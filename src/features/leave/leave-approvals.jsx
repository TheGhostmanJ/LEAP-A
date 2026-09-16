// src/features/hod/LeaveApprovals.jsx
import React, { useState, useEffect } from 'react';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';
import { Search, ChevronDown, CheckSquare, Check, X, Eye, Paperclip, MessageSquare } from 'lucide-react';
import { buildLeavePdfBytes } from '../leave/generateLeavePdf.js';
import './leave-approvals.css';

// Helper: Aggressively strips out 'Filed via System' or default system text
const cleanSystemRemarks = (text) => {
  if (!text) return '';
  const str = String(text).trim();
  if (
    str.toLowerCase() === 'filed via system' ||
    str.toLowerCase() === 'filed via system.' ||
    str.toLowerCase().includes('filed via system')
  ) {
    return '';
  }
  return str;
};

// Helper: Guarantees a clean MM/DD/YYYY string and NEVER lets "Invalid Date" reach PDF-lib
const formatPdfDate = (dateVal) => {
  if (!dateVal) {
    return new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  const strVal = String(dateVal).trim();

  if (
    strVal.toLowerCase().includes('invalid') ||
    strVal.toLowerCase() === 'null' ||
    strVal.toLowerCase() === 'undefined'
  ) {
    return new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  let safeVal = strVal;
  if (safeVal.includes('-') && !safeVal.includes('T')) {
    safeVal = safeVal.replace(/-/g, '/');
  }

  const parsed = new Date(safeVal);

  if (isNaN(parsed.getTime())) {
    return new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  return parsed.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

// Helper: Thorough key extraction across all possible SQL join aliases
const extractFilingDate = (req) => {
  if (!req) return null;
  return (
    req.date_filed ||
    req.filing_date ||
    req.date_of_filing ||
    req.created_at ||
    req.applied_at ||
    req.date_applied ||
    req.date ||
    null
  );
};

// Helper: Extract salary with currency/number formatting options
const extractSalary = (req, fallbackUser) => {
  if (!req) return '';
  const val = (
    req.monthly_salary ||
    req.salary ||
    req.monthly_pay ||
    req.base_salary ||
    req.pay_rate ||
    fallbackUser?.monthly_salary ||
    fallbackUser?.salary ||
    ''
  );
  return val ? String(val) : '';
};

// Helper: Extract middle name or initial
const extractMiddleName = (req) => {
  if (!req) return '';
  if (req.middle_name) return req.middle_name;
  if (req.middleName) return req.middleName;
  if (req.mname) return req.mname;
  if (req.middle_initial) return req.middle_initial;

  if (req.name) {
    const parts = req.name.trim().split(/\s+/);
    if (parts.length > 2) {
      return parts.slice(1, -1).join(' ');
    }
  }
  return '';
};

export default function LeaveApprovals({ onLogout, user }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal & Document Preview States
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('Leave Application Document Preview');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // HOD Remark Modal States
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [hodComment, setHodComment] = useState('');
  const [modalTargetAction, setModalTargetAction] = useState('Needs Revision');
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const userDept = user?.department || user?.department_name || user?.dept || '';

      if (!userDept) {
        setIsLoading(false);
        return;
      }

      const encodedDept = encodeURIComponent(userDept.trim());
      const response = await fetch(`${apiUrl}/api/leave-applications/department?name=${encodedDept}`);

      if (!response.ok) throw new Error('Failed to fetch department leave requests');

      const data = await response.json();
      const applicationsList = data.applications || [];

      const formattedData = applicationsList.map((req) => {
        const rawFiling = extractFilingDate(req);

        return {
          ...req,
          name: req.name || `${req.first_name || ''} ${req.last_name || ''}`.trim() || 'Unknown Employee',
          type: req.type || req.leave_type || 'N/A',
          status: req.status || 'Pending',
          rawDate: rawFiling,
          date: formatPdfDate(rawFiling),
          salary: extractSalary(req, user),
          middle_name: extractMiddleName(req),
          hod_remarks: cleanSystemRemarks(req.hod_remarks || req.hodRemarks || req.remarks)
        };
      });

      setRequests(formattedData);
    } catch (error) {
      console.error('Error fetching department requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
    }
  }, [user]);

  const handleClosePreview = () => {
    if (previewPdfUrl && previewPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    setIsPreviewOpen(false);
  };

  const handleAction = async (id, action, remarks = '', skipConfirm = false) => {
    if (!skipConfirm) {
      const isConfirmed = window.confirm(`Are you sure you want to mark this request as "${action}"?`);
      if (!isConfirmed) return false;
    }

    try {
      const envUrl = import.meta.env.VITE_API_URL;
      const apiUrl = (envUrl && !envUrl.includes('5173')) ? envUrl : 'http://localhost:3001';

      // Strictly cleans passed remarks parameter without falling back to stale hodComment state
      const cleanRemarksToSave = cleanSystemRemarks(remarks);

      const rawUserId = user?.employee_key || user?.employee_id || user?.user_id || user?.id;
      const cleanReviewedBy = rawUserId && !isNaN(parseInt(rawUserId, 10)) ? parseInt(rawUserId, 10) : null;

      const payload = {
        action: action,
        remarks: cleanRemarksToSave,
        reviewed_by: cleanReviewedBy,
        reviewed_by_name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'HOD'
      };

      const response = await fetch(`${apiUrl}/api/leave-applications/leave-approvals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server endpoint standard mismatch. Check Express backend terminal for port 3001.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to update status to ${action}`);
      }

      setRequests(prev => prev.map(req => req.id === id || req.application_id === id ? {
        ...req,
        status: action,
        hod_remarks: cleanRemarksToSave
      } : req));

      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const handleInitiateReject = (req) => {
    setSelectedRequest(req);
    setHodComment(cleanSystemRemarks(req.hod_remarks || req.hodRemarks || req.remarks));
    setModalTargetAction('Rejected');
    setIsRemarkModalOpen(true);
  };

  const openRemarkModal = (req) => {
    setSelectedRequest(req);
    setHodComment(cleanSystemRemarks(req.hod_remarks || req.hodRemarks || req.remarks));
    setModalTargetAction('Needs Revision');
    setIsRemarkModalOpen(true);
  };

  const handleSaveRemark = async (statusAction = null) => {
    if (!selectedRequest) return;

    const actionToTake = statusAction || modalTargetAction || 'Needs Revision';
    const cleanComment = cleanSystemRemarks(hodComment);

    if (!cleanComment) {
      alert(`Please enter a reason/remark before submitting as "${actionToTake}".`);
      return;
    }

    setIsSubmittingRemark(true);
    const success = await handleAction(selectedRequest.id || selectedRequest.application_id, actionToTake, cleanComment, true);

    if (success) {
      setIsRemarkModalOpen(false);
      setSelectedRequest(null);
      setHodComment('');
      fetchLeaveRequests();
    }
    setIsSubmittingRemark(false);
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

        let formattedUrl = raw;
        if (!raw.startsWith('http') && !raw.startsWith('/') && !raw.startsWith('data:')) {
          if (raw.startsWith('JVBERi')) {
            formattedUrl = `data:application/pdf;base64,${raw}`;
          } else if (raw.startsWith('/9j/')) {
            formattedUrl = `data:image/jpeg;base64,${raw}`;
          } else if (raw.startsWith('iVBORw0KGgo')) {
            formattedUrl = `data:image/png;base64,${raw}`;
          } else {
            formattedUrl = `data:application/pdf;base64,${raw}`;
          }
        }

        return [{
          dataUrl: formattedUrl,
          fileName: fileName,
          requirementLabel: fileName
        }];
      }
    }

    if (typeof raw === 'object' && raw !== null) return [raw];

    return [];
  };

  const handleOpenAttachment = (attachment) => {
    let url = '';
    let title = 'Supporting Document';

    if (typeof attachment === 'string') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      if (attachment.startsWith('JVBERi')) {
        url = `data:application/pdf;base64,${attachment}`;
      } else if (attachment.startsWith('/9j/')) {
        url = `data:image/jpeg;base64,${attachment}`;
      } else if (attachment.startsWith('iVBORw0KGgo')) {
        url = `data:image/png;base64,${attachment}`;
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

  const handleOpenPreview = async (req) => {
    try {
      let finalBlobUrl = null;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      let empDetails = { ...req };
      const empId = req.employee_id || req.user_id || req.userId;

      if (empId && (!req.middle_name || !req.monthly_salary)) {
        try {
          const userRes = await fetch(`${apiUrl}/api/users/${empId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            const empProfile = userData.user || userData;
            empDetails = { ...req, ...empProfile };
          }
        } catch (fetchErr) {
          console.warn('Could not fetch complete user profile for PDF:', fetchErr);
        }
      }

      const firstName = empDetails.first_name || empDetails.firstName || (empDetails.name ? empDetails.name.split(' ')[0] : '');
      const lastName = empDetails.last_name || empDetails.lastName || (empDetails.name ? empDetails.name.split(' ').slice(-1)[0] : '');
      const middleName = empDetails.middle_name || empDetails.middleName || empDetails.mname || empDetails.middle_initial || extractMiddleName(empDetails) || '';

      const rawFiling = extractFilingDate(empDetails);
      const cleanFilingDate = formatPdfDate(rawFiling);

      const salary = empDetails.monthly_salary || empDetails.salary || empDetails.monthly_pay || empDetails.base_salary || extractSalary(empDetails, user) || '';

      const combinedPayload = {
        ...empDetails,
        filingDate: cleanFilingDate,
        dateOfFiling: cleanFilingDate,
        dateFiled: cleanFilingDate,
        date_filed: cleanFilingDate,
        filing_date: cleanFilingDate,
        date_of_filing: cleanFilingDate,

        leaveType: empDetails.type || empDetails.leave_type || 'Vacation Leave',
        workingDays: empDetails.working_days || empDetails.days_applied || 1,
        inclusiveDateFrom: formatPdfDate(empDetails.start_date || empDetails.inclusive_date_from || empDetails.date_from),
        inclusiveDateTo: formatPdfDate(empDetails.end_date || empDetails.inclusive_date_to || empDetails.date_to),
        commutation: empDetails.commutation || 'not-requested',

        first_name: firstName,
        firstName: firstName,
        last_name: lastName,
        lastName: lastName,
        middle_name: middleName,
        middleName: middleName,
        mname: middleName,

        department: empDetails.department || empDetails.office_department || user?.department || 'GENERAL SERVICES OFFICE (GSO)',
        office_department: empDetails.department || empDetails.office_department || user?.department || 'GENERAL SERVICES OFFICE (GSO)',
        position_title: empDetails.position_title || empDetails.position || 'EMPLOYEE',
        position: empDetails.position_title || empDetails.position || 'EMPLOYEE',

        monthly_salary: salary,
        monthlySalary: salary,
        salary: salary
      };

      const pdfBytes = await buildLeavePdfBytes(combinedPayload, combinedPayload);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      finalBlobUrl = URL.createObjectURL(blob);

      setPreviewTitle('Leave Application Document Preview');
      setPreviewPdfUrl(finalBlobUrl);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Failed to generate PDF preview:', err);
      alert('Could not open document preview.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.name ? req.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesType = typeFilter === '' || req.type === typeFilter;
    const matchesStatus = statusFilter === '' || req.status === statusFilter;

    let matchesDate = true;
    if (startDate || endDate) {
      const requestDate = new Date(req.rawDate);
      if (!isNaN(requestDate.getTime())) {
        if (startDate) {
          const sDate = new Date(startDate);
          sDate.setHours(0, 0, 0, 0);
          if (requestDate < sDate) matchesDate = false;
        }
        if (endDate) {
          const eDate = new Date(endDate);
          eDate.setHours(23, 59, 59, 999);
          if (requestDate > eDate) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  return (
    <div className="dashboard-container hod-view-wrapper">
      <HodSidebar />

      <main className="dashboard-main-content fade-in-up">

        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <CheckSquare size={24} className="tr-icon-maroon" />
            <h2>
              <span className="cl-title-dark">Leave</span> <span className="cl-title-maroon">Approvals</span>
            </h2>
          </div>

          <Header user={user} onLogout={onLogout} />
        </header>

        <section className="filter-options-block">
          <span className="filter-block-legend">
            <span className="cl-badge-dot"></span> Filter Options
          </span>
          <div className="filter-inputs-row">

            <div className="filter-field-group">
              <label>Status</label>
              <div className="input-with-icon">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Needs Revision">Needs Revision</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown size={16} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-group">
              <label>Leave Type</label>
              <div className="input-with-icon">
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation Leave">Vacation Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Force Leave">Force Leave</option>
                </select>
                <ChevronDown size={16} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-group">
              <label>Date Filed (Between)</label>
              <div className="date-range-group">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  title="Start Date"
                />
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  title="End Date"
                />
              </div>
            </div>

            <div className="filter-field-group search-flex-grow">
              <label>Search Bar</label>
              <div className="input-with-icon">
                <Search size={16} className="field-icon-left" />
                <input 
                  type="text" 
                  placeholder="Search employee..." 
                  className="has-left-icon" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

          </div>
        </section>

        <section className="content-data-box leave-requests-master-container">
          <div className="box-header-title">
            {statusFilter ? `${statusFilter} Requests` : 'All Leave Requests'} ({filteredRequests.length})
          </div>
          
          <div className="table-full-height-wrapper">
            <table className="data-display-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th className="text-center">Status</th>
                  <th>Date Filed</th>
                  <th className="text-center">Form</th>
                  <th className="text-center">Attachments</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '24px', color: '#64748b' }}>
                      Loading leave requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '24px', color: '#64748b' }}>
                      No requests match your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const attachments = parseAttachments(request);
                    const validRemark = cleanSystemRemarks(request.hod_remarks || request.hodRemarks || request.remarks);

                    return (
                      <tr key={request.id || request.application_id}>
                        <td className="font-semibold">{request.name}</td>
                        <td>{request.type}</td>
                        <td className="text-center">
                          <span className={`status-pill-badge status-${request.status.toLowerCase().replace(' ', '-')}`}>
                            ● {request.status}
                          </span>
                        </td>
                        <td>{request.date}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="view-more-trigger"
                            onClick={() => handleOpenPreview(request)}
                            style={{
                              backgroundColor: '#800000',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              margin: '0 auto'
                            }}
                          >
                            <Eye size={12} /> View Form
                          </button>
                        </td>
                        <td className="text-center">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            {attachments.length === 0 ? (
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>No attachments</span>
                            ) : (
                              attachments.map((att, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleOpenAttachment(att)}
                                  style={{
                                    backgroundColor: '#EFF6FF',
                                    color: '#1D4ED8',
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
                                    ? (request.attachment_name || `Attachment ${idx + 1}`)
                                    : (att.requirementLabel || att.fileName || att.attachment_name || `Attachment ${idx + 1}`)}
                                </button>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                            {request.status === 'Pending' || request.status === 'Needs Revision' ? (
                              <>
                                <button
                                  className="action-btn-green"
                                  onClick={() => handleAction(request.id || request.application_id, 'Approved', '')}
                                  title="Approve Request"
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button
                                  className="action-btn-red"
                                  onClick={() => handleInitiateReject(request)}
                                  title="Reject Request"
                                >
                                  <X size={14} /> Reject
                                </button>
                              </>
                            ) : (
                              <span className={`action-finalized-text text-${request.status === 'Approved' ? 'green' : 'red'}`}>
                                {request.status}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => openRemarkModal(request)}
                              title={validRemark ? `Remarks: ${validRemark}` : "Add remark for employee"}
                              style={{
                                backgroundColor: validRemark ? '#FEF3C7' : '#F3F4F6',
                                color: validRemark ? '#D97706' : '#4B5563',
                                border: validRemark ? '1px solid #FCD34D' : '1px solid #D1D5DB',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              <MessageSquare size={13} />
                              {validRemark ? 'Note Added' : 'Remark'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Document / PDF Preview Modal */}
      {isPreviewOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              width: '100%',
              maxWidth: '900px',
              height: '90vh',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                backgroundColor: '#800000',
                color: '#fff',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              <span>{previewTitle}</span>
              <button
                onClick={handleClosePreview}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
              {previewPdfUrl ? (
                previewPdfUrl.startsWith('data:image') ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', overflow: 'auto', padding: '16px' }}>
                    <img src={previewPdfUrl} alt="Document Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <iframe
                    src={previewPdfUrl}
                    title="Document Preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                )
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280' }}>
                  Unable to display preview.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Remarks / Rejection Reason Modal */}
      {isRemarkModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
            }}
          >
            <div
              style={{
                backgroundColor: modalTargetAction === 'Rejected' ? '#991B1B' : '#800000',
                color: '#fff',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} />
                <span>
                  {modalTargetAction === 'Rejected' ? 'Rejection Reason' : 'Remarks / Feedback'} for {selectedRequest?.name}
                </span>
              </div>
              <button
                onClick={() => setIsRemarkModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>
                {modalTargetAction === 'Rejected' ? (
                  <>Please specify the reason for rejecting <b>{selectedRequest?.name}</b>'s <b>{selectedRequest?.type}</b> request (e.g., <i>"Invalid or unreadable documents attached"</i>).</>
                ) : (
                  <>Add comments or instructions for <b>{selectedRequest?.name}</b> regarding their <b>{selectedRequest?.type}</b> request.</>
                )}
              </p>

              <textarea
                value={hodComment}
                onChange={(e) => setHodComment(e.target.value)}
                placeholder="Enter HOD remarks here..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsRemarkModalOpen(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#fff',
                    color: '#374151',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingRemark}
                  onClick={() => handleSaveRemark()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: modalTargetAction === 'Rejected' ? '#991B1B' : '#800000',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {isSubmittingRemark ? 'Saving...' : `Submit as ${modalTargetAction}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}