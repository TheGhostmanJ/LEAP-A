// src/features/leave/leave-preview-modal.jsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { buildLeavePdfBytes, downloadPdfBytes } from './generateLeavePdf';
import './leave-preview-modal.css';

export default function LeavePreviewModal({ formData = {}, user = {}, onClose, onConfirm }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const bytesRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    async function build() {
      setLoading(true);
      setError(null);
      try {
        // Normalize user keys to guarantee matches with PDF generator
        const normalizedUser = {
          ...user,
          last_name: user?.last_name || '',
          first_name: user?.first_name || '',
          middle_name: user?.middle_name || '',
          department: user?.department || '',
          position_title: user?.position_title || '',
          current_salary_amount: user?.current_salary_amount || ''
        };

        // FIXED: Correctly mapped the inclusive dates from your LeaveApplication state!
        const normalizedForm = {
          ...formData,
          filingDate: formData?.filingDate || new Date().toISOString().split('T')[0],
          leaveType: formData?.leaveType || '',
          workingDays: formData?.workingDays || '',
          startDate: formData?.inclusiveDateFrom || '',
          endDate: formData?.inclusiveDateTo || ''
        };

        const bytes = await buildLeavePdfBytes(normalizedForm, normalizedUser);
        if (cancelled) return;

        bytesRef.current = bytes;
        const blob = new Blob([bytes], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        console.error('Failed to build leave application PDF preview:', err);
        if (!cancelled) setError('Could not generate the PDF preview. Check the console for details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    build();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [formData, user]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // 1. Fire the backend submission from the parent component
      if (onConfirm) await onConfirm();
      
      // 2. Automatically download the filled PDF to the user's computer for their records
      if (bytesRef.current) {
        downloadPdfBytes(bytesRef.current, formData, user);
      }
      
      // 3. Close the modal
      if (onClose) onClose();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="leave-preview-backdrop" onClick={onClose}>
      <div className="leave-preview-modal leave-preview-modal-pdf" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <div>
            <p className="preview-eyebrow">Civil Service Form No. 6 Revised 2020</p>
            <h2 className="preview-title">Application for Leave — Preview</h2>
          </div>
          <button type="button" className="preview-close-btn" onClick={onClose} aria-label="Close preview">
            <X size={20} />
          </button>
        </div>

        <div className="preview-pdf-body">
          {loading && (
            <div className="preview-pdf-status">
              <Loader2 size={22} className="preview-spin" />
              <span>Generating your official form preview…</span>
            </div>
          )}

          {!loading && error && (
            <div className="preview-pdf-status preview-pdf-status-error">
              <AlertTriangle size={22} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && pdfUrl && (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title="Leave Application PDF Preview"
              className="preview-pdf-frame"
            />
          )}
        </div>

        <div className="preview-modal-actions">
          <button type="button" className="form-btn-cancel" onClick={onClose} disabled={submitting}>
            Back to Edit
          </button>
          <button
            type="button"
            className="form-btn-submit"
            onClick={handleConfirm}
            disabled={loading || !!error || submitting}
          >
            {submitting ? 'Submitting…' : 'Confirm & Submit'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}