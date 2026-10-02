import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, ExternalLink, Trash2, Award } from 'lucide-react';
import './EventCertificates.css';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

async function readError(res, fallback) {
  try {
    const data = await res.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

/**
 * HR modal: lists everyone registered for an event and lets HR upload a PDF
 * certificate for each one.
 *
 * Props:
 *   event   - { id, name }
 *   apiBase - e.g. "http://localhost:3001/api" (same API_BASE as your page)
 *   onClose - function to close the modal
 */
export default function EventCertificates({ event, apiBase, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/events/${event.id}/registrants`);
      if (!res.ok) throw new Error(await readError(res, 'Failed to load registrants.'));
      setRows(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, event.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (employeeKey, file) => {
    if (!file) return;
    setError('');
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
      setError('Only PDF, PNG or JPG files are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('File is too large (max 5 MB).');
      return;
    }

    setBusyKey(employeeKey);
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      const res = await fetch(
        `${apiBase}/events/${event.id}/certificates/${employeeKey}`,
        { method: 'POST', body: formData }
      );
      if (!res.ok) throw new Error(await readError(res, 'Upload failed.'));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  const handleRemove = async (employeeKey) => {
    if (!window.confirm('Remove this certificate?')) return;
    setBusyKey(employeeKey);
    setError('');
    try {
      const res = await fetch(`${apiBase}/events/${event.id}/certificates/${employeeKey}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(await readError(res, 'Failed to remove certificate.'));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  const uploadedCount = rows.filter((r) => r.has_certificate).length;

  return (
    <div className="ec-overlay" onClick={onClose}>
      <div className="ec-card" onClick={(e) => e.stopPropagation()}>
        <div className="ec-header">
          <div>
            <span className="ec-eyebrow">CERTIFICATES</span>
            <h3>{event.name}</h3>
            <p className="ec-sub">
              {uploadedCount} of {rows.length} uploaded
            </p>
          </div>
          <button className="ec-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ec-body">
          {error && <p className="ec-error">{error}</p>}

          {loading ? (
            <p className="ec-empty">Loading registrants...</p>
          ) : rows.length === 0 ? (
            <p className="ec-empty">No employees have registered for this event.</p>
          ) : (
            rows.map((r) => (
              <div key={r.employee_key} className="ec-row">
                <div className="ec-person">
                  <Award size={18} className={r.has_certificate ? 'ec-icon-done' : 'ec-icon-pending'} />
                  <div>
                    <strong>{r.first_name} {r.last_name}</strong>
                    <span>
                      {r.department || 'No department'}
                      {r.has_certificate && r.certificate_name ? ` • ${r.certificate_name}` : ''}
                    </span>
                  </div>
                </div>

                <div className="ec-actions">
                  {r.has_certificate && (
                    <>
                      <button
                        className="ec-btn"
                        onClick={() =>
                          window.open(
                            `${apiBase}/events/${event.id}/certificates/${r.employee_key}`,
                            '_blank'
                          )
                        }
                      >
                        <ExternalLink size={13} /> View
                      </button>
                      <button
                        className="ec-btn danger"
                        disabled={busyKey === r.employee_key}
                        onClick={() => handleRemove(r.employee_key)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}

                  <label className={`ec-btn primary ${busyKey === r.employee_key ? 'disabled' : ''}`}>
                    <Upload size={13} />
                    {busyKey === r.employee_key
                      ? 'Uploading...'
                      : r.has_certificate
                      ? 'Replace'
                      : 'Upload file'}
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg"
                      hidden
                      disabled={busyKey === r.employee_key}
                      onChange={(e) => {
                        handleUpload(r.employee_key, e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="ec-footer">
          <button className="ec-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
