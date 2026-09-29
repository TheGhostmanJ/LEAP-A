import React, { useState, useRef } from 'react';
import { X, Briefcase, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const EMPTY_FORM = { full_name: '', email: '', contact_number: '', message: '' };

export default function OpenPositionsModal({ openings, onClose }) {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const recaptchaRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/public/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: selected.department_id,
          position_title: selected.position_title,
          ...form,
          captchaToken,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not submit your application. Please try again.');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setError('');
    setCaptchaToken(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{selected ? 'Apply for Position' : 'Open Positions'}</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* SUCCESS */}
          {submitted && (
            <div className="apply-success">
              <CheckCircle size={44} />
              <h3>Application Submitted</h3>
              <p>
                Thank you for applying for <strong>{selected.position_title}</strong>. The City
                Personnel Office will review your application and contact you.
              </p>
              <button className="apply-primary-btn" onClick={onClose}>Close</button>
            </div>
          )}

          {/* LIST OF OPENINGS */}
          {!submitted && !selected && (
            <>
              <p className="modal-updated">
                These positions are open to external applicants.
              </p>
              {openings.map((job) => (
                <div className="opening-card" key={`${job.department_id}-${job.position_title}`}>
                  <div className="opening-info">
                    <Briefcase size={18} />
                    <div>
                      <div className="opening-title">{job.position_title}</div>
                      <div className="opening-dept">{job.department_name}</div>
                    </div>
                  </div>
                  <button className="apply-primary-btn" onClick={() => setSelected(job)}>
                    Apply
                  </button>
                </div>
              ))}
            </>
          )}

          {/* APPLY FORM */}
          {!submitted && selected && (
            <form onSubmit={handleSubmit} className="apply-form">
              <button type="button" className="apply-back-btn" onClick={handleBack}>
                <ArrowLeft size={14} /> Back to positions
              </button>

              <div className="apply-selected">
                <strong>{selected.position_title}</strong>
                <span>{selected.department_name}</span>
              </div>

              {error && (
                <div className="error-banner">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="input-label">Full Name</label>
                <input name="full_name" type="text" required className="text-input plain-input"
                  placeholder="Juan Dela Cruz" value={form.full_name} onChange={handleChange} disabled={isSubmitting} />
              </div>

              <div>
                <label className="input-label">Email</label>
                <input name="email" type="email" required className="text-input plain-input"
                  placeholder="you@email.com" value={form.email} onChange={handleChange} disabled={isSubmitting} />
              </div>

              <div>
                <label className="input-label">Contact Number</label>
                <input name="contact_number" type="tel" required className="text-input plain-input"
                  placeholder="09XXXXXXXXX" value={form.contact_number} onChange={handleChange} disabled={isSubmitting} />
              </div>

              <div>
                <label className="input-label">Short Message (optional)</label>
                <textarea name="message" rows={3} className="text-input plain-input"
                  placeholder="Tell us briefly about your qualifications" value={form.message}
                  onChange={handleChange} disabled={isSubmitting} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={setCaptchaToken}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>

              <button type="submit" className="apply-primary-btn apply-submit"
                disabled={isSubmitting || !captchaToken}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
