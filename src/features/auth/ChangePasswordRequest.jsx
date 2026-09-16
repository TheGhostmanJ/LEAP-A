import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard, User, Building2, Briefcase, ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import './ChangePasswordRequest.css';

const REQUIRED_FIELDS = ['employeeId', 'firstName', 'lastName', 'department', 'position'];
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ChangePasswordRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    department: '',
    position: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/departments`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const list = data
            .map((item) => {
              if (typeof item === 'string') return item.trim();
              if (typeof item === 'object' && item !== null) {
                return (item.department || item.department_name || item.name || '').trim();
              }
              return '';
            })
            .filter((dept) => dept.length > 0);

          setDepartments(Array.from(new Set(list)));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch departments from backend:', err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validate = () => {
    const errors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!formData[field] || !formData[field].trim()) {
        errors[field] = 'This field is required';
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${API_BASE_URL}/api/password-reset-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: formData.employeeId.trim(),
          first_name: formData.firstName.trim(),
          middle_name: formData.middleName.trim(),
          last_name: formData.lastName.trim(),
          department: formData.department.trim(),
          position_title: formData.position.trim(), // Fixed mapping to match backend expectations
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || data.message || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch (err) {
      setErrorMessage('Could not reach the server. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="cpr-page">
        <div className="cpr-card cpr-card--center">
          <div className="cpr-success-icon">
            <CheckCircle2 size={54} />
          </div>
          <h2 className="cpr-title cpr-title--success">Request Submitted</h2>
          <p className="cpr-subtext">
            Your password change request has been sent to IT. Please wait for
            them to contact you with further instructions.
          </p>
          <button onClick={() => navigate('/login')} className="cpr-button">
            BACK TO LOGIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cpr-page">
      <div className="cpr-card cpr-split-card">
        {/* Left Hero Sidebar */}
        <div className="cpr-hero-sidebar">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="cpr-back-link cpr-back-link--hero"
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </button>

          <div className="cpr-hero-content">
            <div className="cpr-icon-badge cpr-icon-badge--hero">
              <KeyRound size={30} />
            </div>
            <h2 className="cpr-hero-title">Reset Access</h2>
            <p className="cpr-hero-description">
              Submit your verification details. IT will review and process your credentials request.
            </p>
            <div className="cpr-hero-tag">
              <ShieldCheck size={16} />
              <span>Secure IT Portal</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="cpr-form-container">
          <form onSubmit={handleSubmit} className="cpr-form" noValidate>
            <div className="cpr-row">
              <div className="cpr-field">
                <label className="cpr-label">Employee ID</label>
                <div className={`cpr-input-wrapper ${fieldErrors.employeeId ? 'cpr-input-wrapper--error' : ''}`}>
                  <span className="cpr-input-icon">
                    <IdCard size={18} />
                  </span>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="cpr-input"
                  />
                </div>
                {fieldErrors.employeeId && <span className="cpr-field-error">{fieldErrors.employeeId}</span>}
              </div>

              <div className="cpr-field">
                <label className="cpr-label">Department</label>
                <div className={`cpr-input-wrapper ${fieldErrors.department ? 'cpr-input-wrapper--error' : ''}`}>
                  <span className="cpr-input-icon">
                    <Building2 size={18} />
                  </span>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="cpr-input cpr-select"
                  >
                    <option value="" disabled>
                      Select department
                    </option>
                    {departments.map((deptName, index) => (
                      <option key={`${deptName}-${index}`} value={deptName}>
                        {deptName}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.department && <span className="cpr-field-error">{fieldErrors.department}</span>}
              </div>
            </div>

            <div className="cpr-row">
              <div className="cpr-field">
                <label className="cpr-label">First Name</label>
                <div className={`cpr-input-wrapper ${fieldErrors.firstName ? 'cpr-input-wrapper--error' : ''}`}>
                  <span className="cpr-input-icon">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="cpr-input"
                  />
                </div>
                {fieldErrors.firstName && <span className="cpr-field-error">{fieldErrors.firstName}</span>}
              </div>

              <div className="cpr-field">
                <label className="cpr-label">Last Name</label>
                <div className={`cpr-input-wrapper ${fieldErrors.lastName ? 'cpr-input-wrapper--error' : ''}`}>
                  <span className="cpr-input-icon">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="cpr-input"
                  />
                </div>
                {fieldErrors.lastName && <span className="cpr-field-error">{fieldErrors.lastName}</span>}
              </div>
            </div>

            <div className="cpr-row">
              <div className="cpr-field">
                <label className="cpr-label">
                  Middle Name <span className="cpr-optional">(optional)</span>
                </label>
                <div className="cpr-input-wrapper">
                  <span className="cpr-input-icon">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="cpr-input"
                  />
                </div>
              </div>

              <div className="cpr-field">
                <label className="cpr-label">Position</label>
                <div className={`cpr-input-wrapper ${fieldErrors.position ? 'cpr-input-wrapper--error' : ''}`}>
                  <span className="cpr-input-icon">
                    <Briefcase size={18} />
                  </span>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="cpr-input"
                  />
                </div>
                {fieldErrors.position && <span className="cpr-field-error">{fieldErrors.position}</span>}
              </div>
            </div>

            {status === 'error' && <p className="cpr-error">{errorMessage}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="cpr-button"
            >
              {status === 'loading' ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}