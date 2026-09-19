import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, AlertCircle, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { loginUser } from './services/authService';
import AuthSplashScreen from '../../components/AuthSplashScreen';
import './login.css';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  
  // Auth & UI State
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  
  const recaptchaRef = useRef(null);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (token) setErrorMessage('');
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!captchaToken) {
      setErrorMessage("Please complete the reCAPTCHA verification before logging in.");
      return;
    }

    setIsSubmitting(true);

    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    try {
      const data = await loginUser(username, password, captchaToken);
      
      if (data.success) {
        sessionStorage.removeItem('splash_shown');
        setShowSplash(true);

        setTimeout(() => {
          if (typeof onLoginSuccess === 'function') {
            onLoginSuccess(data.user);
          }
        }, 400);
      } else {
        setErrorMessage(data.message || "Invalid username or password.");
        setIsSubmitting(false);
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
      }
    } catch (err) {
      console.error("Login endpoint error details:", err);
      const serverErrorMsg = err?.response?.data?.message || err?.message;
      setErrorMessage(serverErrorMsg || "Bad Request (400). Please verify your inputs or reCAPTCHA configuration.");
      
      setIsSubmitting(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <>
      {/* Dynamic Animated Splash Screen Overlay */}
      {showSplash && <AuthSplashScreen />}

      <div className="screen-container">
        <div className="main-card">

          {/* LEFT PANEL: Form Inputs */}
          <div className="left-panel">
            <div className="login-header-wrapper">
              <h1 className="login-header">Log In</h1>
              <p className="login-subtext">Welcome back! Enter your credentials to access the system.</p>
            </div>

            {errorMessage && (
              <div className="error-banner">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-element">
              {/* Username Field */}
              <div>
                <label className="input-label">Employee Username</label>
                <div className="relative-input-wrapper">
                  <span className="input-icon">
                    <User size={16} />
                  </span>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="Enter Username"
                    className="text-input"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="input-label">Password</label>
                <div className="relative-input-wrapper password-input-wrapper">
                  <span className="input-icon">
                    <svg className="icon-svg" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m6 4.5v2.25m-6-6.75h10.5a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-6.75a2.25 2.25 0 0 1 2.25-2.25z" />
                    </svg>
                  </span>

                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter Password"
                    className="text-input text-input-password"
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="options-row">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" name="rememberMe" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/change-password-request')}
                  className="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>

              {/* CAPTCHA */}
              <div className="captcha-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                  onExpired={handleCaptchaExpired}
                />
              </div>

              {/* Legal Footnote */}
              <p className="legal-footnote">
                By logging in, you agree to our{' '}
                <button type="button" className="legal-link" onClick={() => setActiveModal('terms')}>Terms of Service</button> and{' '}
                <button type="button" className="legal-link" onClick={() => setActiveModal('privacy')}>Privacy Policy</button>
              </p>

              {/* Login Button */}
              <div className="submit-button-wrapper">
                <button
                  type="submit"
                  className={`submit-button ${isSubmitting ? 'submit-button-disabled' : ''}`}
                  disabled={isSubmitting || !captchaToken}
                >
                  {isSubmitting ? 'Authenticating...' : 'Login'}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: Carousel Display */}
          <div className="right-panel">
            <div className="logo-wrapper">
              <img src="/leaplogo.png" alt="LEAP-A Logo" className="logo-image" />
            </div>

            <div className="glass-slider-box">
              {carouselData.map((slide, index) => (
                <div
                  key={index}
                  className={`carousel-slide ${index === currentSlide ? 'active' : 'inactive'}`}
                >
                  <div className="carousel-image-wrapper">
                    <img src={slide.imgSrc} alt={slide.title} className="carousel-image" />
                  </div>

                  <div className="carousel-text">
                    <h3 className="carousel-title">{slide.title}</h3>
                    <div className="carousel-divider" />
                    <p className="carousel-description">{slide.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controllers */}
            <div className="carousel-controls-row">
              <button type="button" onClick={handlePrev} className="arrow-button"><ChevronLeft size={22} /></button>
              <div className="carousel-dots">
                {carouselData.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  />
                ))}
              </div>
              <button type="button" onClick={handleNext} className="arrow-button"><ChevronRight size={22} /></button>
            </div>
          </div>

        </div>

        {/* TERMS OF SERVICE MODAL */}
        {activeModal === 'terms' && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Terms of Service</h2>
                <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <p className="modal-updated">Last updated: September 2026</p>
                <h3>1. Purpose of This System</h3>
                <p>LEAP-A (Labor Engagement and Analytics Platform for Administration) is an internal Human Resource Information System developed for the City Personnel Office of Lipa City Hall. It is intended solely for authorized personnel to manage employee records, attendance, leave applications, training records, and related HR functions.</p>

                <h3>2. Authorized Use</h3>
                <p>Access to this system is limited to employees, department heads, HR administrators, and IT staff who have been granted valid login credentials. You are responsible for keeping your username and password confidential. Any activity performed under your account is considered your responsibility.</p>

                <h3>3. Acceptable Use</h3>
                <p>You agree to use this system only for legitimate work-related purposes. You must not attempt to access records, modules, or accounts outside your assigned role or permission level. Any attempt to bypass security controls, tamper with attendance or leave records, or misuse administrative privileges may result in disciplinary action.</p>

                <h3>4. Data Accuracy</h3>
                <p>Users are expected to ensure that any information they submit — including leave applications, profile updates, and attendance-related requests — is accurate and truthful. Falsification of records submitted through this system may be subject to City Personnel Office policy and applicable civil service regulations.</p>

                <h3>5. System Availability</h3>
                <p>While LEAP-A is designed to be reliable, it is provided on an "as-is" basis. Scheduled maintenance, updates, or unforeseen technical issues may temporarily affect availability. Critical HR transactions should always be confirmed with the City Personnel Office when the system is unavailable.</p>

                <h3>6. Account Termination</h3>
                <p>Access may be suspended or revoked upon end of employment, role reassignment, or violation of these terms, at the discretion of the City Personnel Office and system administrators.</p>

                <h3>7. Changes to These Terms</h3>
                <p>These terms may be updated as the system evolves. Continued use of LEAP-A after changes are posted constitutes acceptance of the revised terms.</p>

                <h3>8. Contact</h3>
                <p>For questions regarding these terms, please contact the City Personnel Office or your assigned system administrator.</p>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY MODAL */}
        {activeModal === 'privacy' && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Privacy Policy</h2>
                <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <p className="modal-updated">Last updated: September 2026</p>

                <h3>1. Information We Collect</h3>
                <p>LEAP-A collects and processes employee information necessary for HR administration, including but not limited to: full name, employee ID, department, position, contact details, biometric attendance logs, leave records, payroll-related data, and training history.</p>

                <h3>2. How We Use Your Information</h3>
                <p>Your information is used exclusively to support HR operations such as attendance tracking, leave management, payroll processing, performance evaluation, training records, and workforce analytics conducted by the City Personnel Office.</p>

                <h3>3. Biometric Data</h3>
                <p>If your organization uses biometric clock-in features, this data (such as fingerprint-derived identifiers) is used solely for attendance verification. Raw biometric images are not stored or shared outside the system's attendance verification process.</p>

                <h3>4. Data Access and Role-Based Permissions</h3>
                <p>Access to your personal data is restricted based on your role. Department Heads and HR Admins can only view information relevant to their supervisory or administrative responsibilities. System Administrators have technical access limited to maintaining system integrity, not routine viewing of personal records.</p>

                <h3>5. Data Sharing</h3>
                <p>Your information is not sold, rented, or shared with third parties for commercial purposes. Data may only be disclosed as required by law, city ordinance, or civil service regulations governing government employee records.</p>

                <h3>6. Data Security</h3>
                <p>We implement reasonable technical and administrative safeguards — including role-based access control and authentication — to protect your data from unauthorized access, alteration, or disclosure. However, no system can guarantee absolute security.</p>

                <h3>7. Data Retention</h3>
                <p>Employee records are retained in accordance with the City Personnel Office's records retention policy and applicable civil service or archival regulations, even after separation from employment, where legally required.</p>

                <h3>8. Your Rights</h3>
                <p>You may request to review or correct your personal information held within LEAP-A by coordinating with the City Personnel Office. Certain records (e.g., official attendance and payroll history) may be subject to retention requirements and cannot be freely deleted upon request.</p>

                <h3>9. Changes to This Policy</h3>
                <p>This Privacy Policy may be updated periodically to reflect system or regulatory changes. Significant changes will be communicated through official City Personnel Office channels.</p>

                <h3>10. Contact</h3>
                <p>For privacy-related concerns or data access requests, please contact the City Personnel Office directly.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
