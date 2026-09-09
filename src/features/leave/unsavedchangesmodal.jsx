// src/features/leave/UnsavedChangesModal.jsx
import React from 'react';
import { AlertTriangle, Save, LogOut } from 'lucide-react';
import './unsavedchangesmodal.css';

export default function UnsavedChangesModal({ onKeepEditing, onDiscard, onSaveDraft }) {
  return (
    <div className="unsaved-modal-overlay">
      <div className="unsaved-modal-card">
        <div className="unsaved-modal-header">
          <div className="unsaved-modal-icon-wrapper">
            <AlertTriangle size={24} />
          </div>
          <div className="unsaved-modal-title-group">
            <h3 className="unsaved-modal-title">Unsaved Changes</h3>
            <span className="unsaved-modal-subtitle">You have unsubmitted changes</span>
          </div>
        </div>

        <p className="unsaved-modal-body">
          Are you sure you want to leave this page? You can save your current progress as a draft or discard your changes.
        </p>

        <div className="unsaved-modal-actions">
          <button type="button" className="btn-unsaved-save" onClick={onSaveDraft}>
            <Save size={16} /> Save Draft & Exit
          </button>

          <button type="button" className="btn-unsaved-discard" onClick={onDiscard}>
            <LogOut size={16} /> Discard Changes & Leave
          </button>

          <button type="button" className="btn-unsaved-keep" onClick={onKeepEditing}>
            Keep Editing
          </button>
        </div>
      </div>
    </div>
  );
}