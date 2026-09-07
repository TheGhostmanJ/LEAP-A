// src/features/leave/leave-preview-modal.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { generateLeavePdf } from './generateLeavePdf';
import './leave-preview-modal.css';

function PreviewCheck({ checked, label }) {
  return (
    <div className="preview-check-item">
      <span className={`preview-check-box ${checked ? 'is-checked' : ''}`}>
        {checked ? '✓' : ''}
      </span>
      <span>{label}</span>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return '—';
  }
}

export default function LeavePreviewModal({ formData = {}, user = {}, onClose, onConfirm }) {
  if (!formData) return null;

  const showVacationSpl = formData.leaveType === 'Vacation Leave' || formData.leaveType === 'Special Privilege Leave';
  const showSickLeave = formData.leaveType === 'Sick Leave';
  const showSpecialWomen = formData.leaveType === 'Special Leave Benefits for Women';
  const showStudyLeave = formData.leaveType === 'Study Leave';
  const showOthers = formData.leaveType === 'Others';

  const handleConfirm = async () => {
    if (onConfirm) await onConfirm();           // existing backend submission
    await generateLeavePdf(formData, user);       // triggers the filled PDF download
    if (onClose) onClose();
  };

  const modalContent = (
    <div className="leave-preview-backdrop" onClick={onClose}>
      <div className="leave-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <div>
            <p className="preview-eyebrow">Civil Service Form No. 6 Revised 2020</p>
            <h2 className="preview-title">Application for Leave — Preview</h2>
          </div>
          <button type="button" className="preview-close-btn" onClick={onClose} aria-label="Close preview">
            <X size={20} />
          </button>
        </div>

        <div className="preview-modal-body">
          <div className="preview-section">
            <div className="preview-grid-3col">
              <div className="preview-field">
                <span className="preview-label">1. Office/Department</span>
                <span className="preview-value">{user?.department || '—'}</span>
              </div>
              <div className="preview-field">
                <span className="preview-label">4. Position</span>
                <span className="preview-value">{user?.position_title || '—'}</span>
              </div>
              <div className="preview-field">
                <span className="preview-label">5. Salary</span>
                <span className="preview-value">
                  {user?.current_salary_amount ? `₱${Number(user.current_salary_amount).toLocaleString()}` : '—'}
                </span>
              </div>
            </div>

            <div className="preview-grid-3col">
              <div className="preview-field">
                <span className="preview-label">2. Last Name</span>
                <span className="preview-value">{user?.last_name || '—'}</span>
              </div>
              <div className="preview-field">
                <span className="preview-label">First Name</span>
                <span className="preview-value">{user?.first_name || '—'}</span>
              </div>
              <div className="preview-field">
                <span className="preview-label">Middle Name</span>
                <span className="preview-value">{user?.middle_name || '—'}</span>
              </div>
            </div>

            <div className="preview-field">
              <span className="preview-label">3. Date of Filing</span>
              <span className="preview-value">{formatDate(formData.filingDate)}</span>
            </div>
          </div>

          <div className="preview-divider" />

          <div className="preview-section">
            <h3 className="preview-section-title">6. Details of Application</h3>

            <div className="preview-grid-2col">
              <div className="preview-field">
                <span className="preview-label">6.A Type of Leave</span>
                <span className="preview-value preview-value-strong">
                  {formData.leaveType || '—'}
                  {showOthers && formData.othersSpecify ? ` (${formData.othersSpecify})` : ''}
                </span>
              </div>

              <div className="preview-field">
                <span className="preview-label">6.B Details of Leave</span>

                {showVacationSpl && (
                  <div className="preview-subgroup">
                    <PreviewCheck checked={formData.vacationSplLocation === 'within-ph'} label="Within Philippines" />
                    <PreviewCheck checked={formData.vacationSplLocation === 'abroad'} label={`Abroad${formData.abroadSpecify ? ` (${formData.abroadSpecify})` : ''}`} />
                  </div>
                )}

                {showSickLeave && (
                  <div className="preview-subgroup">
                    <PreviewCheck checked={formData.sickLeaveType === 'in-hospital'} label={`In Hospital${formData.illnessSpecify ? ` — ${formData.illnessSpecify}` : ''}`} />
                    <PreviewCheck checked={formData.sickLeaveType === 'out-patient'} label={`Out Patient${formData.illnessSpecify ? ` — ${formData.illnessSpecify}` : ''}`} />
                  </div>
                )}

                {showSpecialWomen && (
                  <div className="preview-subgroup">
                    <span className="preview-value">{formData.illnessSpecify || '—'}</span>
                  </div>
                )}

                {showStudyLeave && (
                  <div className="preview-subgroup">
                    <PreviewCheck checked={formData.studyLeavePurpose === 'masters'} label="Completion of Master's Degree" />
                    <PreviewCheck checked={formData.studyLeavePurpose === 'bar-board'} label="BAR/Board Exam Review" />
                  </div>
                )}

                {showOthers && (
                  <div className="preview-subgroup">
                    <PreviewCheck checked={formData.othersPurpose === 'monetization'} label="Monetization of Leave Credits" />
                    <PreviewCheck checked={formData.othersPurpose === 'terminal-leave'} label="Terminal Leave" />
                  </div>
                )}

                {!showVacationSpl && !showSickLeave && !showSpecialWomen && !showStudyLeave && !showOthers && (
                  <span className="preview-value preview-value-muted">None specified</span>
                )}
              </div>
            </div>

            <div className="preview-grid-2col" style={{ marginTop: '18px' }}>
              <div className="preview-field">
                <span className="preview-label">6.C Working Days</span>
                <span className="preview-value">{formData.workingDays || '—'}</span>
              </div>
              <div className="preview-field">
                <span className="preview-label">Inclusive Dates</span>
                <span className="preview-value">
                  {formatDate(formData.inclusiveDateFrom)} to {formatDate(formData.inclusiveDateTo)}
                </span>
              </div>
            </div>

            <div className="preview-field" style={{ marginTop: '18px' }}>
              <span className="preview-label">6.D Commutation</span>
              <div className="preview-subgroup">
                <PreviewCheck checked={formData.commutation === 'not-requested'} label="Not Requested" />
                <PreviewCheck checked={formData.commutation === 'requested'} label="Requested" />
              </div>
            </div>
          </div>
        </div>

        <div className="preview-modal-actions">
          <button type="button" className="form-btn-cancel" onClick={onClose}>Back to Edit</button>
          <button type="button" className="form-btn-submit" onClick={handleConfirm}>Confirm & Submit</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}