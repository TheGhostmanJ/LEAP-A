import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, AlertCircle } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 
import { loginUser } from './services/authService'; 
import { GoogleLogin } from '@react-oauth/google'; // Imported for Google OAuth integration
import './login.css'; 

export default function Login({ onLoginSuccess }) { 
  const navigate = useNavigate(); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const carouselData = [
    {
      title: "SMART PLANNING",
      description: "Planning ahead made simple. LEAP-A analyzes historical trends to help department heads look at future staff availability, ensuring teams are always supported and prepared for upcoming busy periods.",
      imgSrc: "/planning.png"
    },
    {
      title: "SCHEDULING ASSISTANCE",
      description: "Never worry about calendar conflicts. If you request leave during an under-capacity period, our smart assistant automatically suggests better alternative dates to make sure your time-off gets approved smoothly.",
      imgSrc: "/scheduling.png"
    },
    {
      title: "SMART AUDITING",
      description: "Keeping our workplace fair and consistent. LEAP-A automatically monitors and reviews uncharacteristic timeline shifts or unusual attendance patterns to maintain accurate and reliable records for everyone.",
      imgSrc: "/auditing.png"
    },
    {
      title: "UNIFIED PORTAL",
      description: "Your workspace, completely connected. Seamlessly track your biometric clock-ins, view your live leave credit balances, apply for monetization, and check your payroll records in one single, secure portal.",
      imgSrc: "/portal.png"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    try {
      const data = await loginUser(username, password);

      if (data.success) {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(data.user);
        }
      } else {
        setErrorMessage(data.message || "Invalid username or password");
      }
    } catch (err) {
      setErrorMessage("Incorrect username or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Google Authentication Handoff Handler ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const response = await fetch('http://localhost:3001/api/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      const data = await response.json();

      if (data.success) {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(data.user);
        }
      } else {
        setErrorMessage(data.message || "Google email not registered in system.");
      }
    } catch (err) {
      setErrorMessage("Google Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="main-card">
        
        {/* LEFT PANEL: Form Inputs */}
        <div className="left-panel">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="login-header">Log In</h1>
            <p className="login-subtext">Welcome back! Enter your credentials to access the system.</p>
          </div>

          {/* Clean State-Driven Error Feedback Alert */}
          {errorMessage && (
            <div className="error-banner" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-element">
            {/* Username Field */}
            <div>
              <label className="input-label">Employee Username</label>
              <div className="relative-input-wrapper">
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
              <div className="relative-input-wrapper" style={{ position: 'relative' }}>
                <span className="input-icon">
                  <svg style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' }} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m6 4.5v2.25m-6-6.75h10.5a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-6.75a2.25 2.25 0 0 1 2.25-2.25z" />
                  </svg>
                </span>

                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="••••••••" 
                  className="text-input" 
                  style={{ paddingRight: '40px' }} 
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0',
                    zIndex: 5
                  }}
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
                <a href="#forgot" className="forgot-password-link">Forgot Password?</a>
            </div>

            {/* Legal Footnote */}
            <p className="legal-footnote">
              By logging in, you agree to our{' '}
              <a href="#terms" className="legal-link">Terms of Service</a> and{' '}
              <a href="#privacy" className="legal-link">Privacy Policy</a>
            </p>

            {/* Login Button */}
            <div style={{ marginTop: '16px' }}>
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Authenticating...' : 'Login'}
              </button>
            </div>
          </form>

          {/* --- NEW: PLACED DIRECTLY BENEATH THE MAIN FORM UTILITY --- */}
          <div style={{ margin: '24px 0 16px 0', textAlign: 'center', color: '#a0aec0', fontSize: '13px', fontWeight: '500' }}>
            <span>─ OR ─</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMessage("Google Sign-In was aborted or failed.")}
              useOneTap
              uxMode="redirect"
            />
          </div>

        </div>

        {/* RIGHT PANEL: Gradient Info Display */}
        <div className="right-panel">
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
            <img src="/leaplogo.png" alt="LEAP-A Logo" className="logo-image" />
          </div>

          <div className="glass-slider-box">
            {carouselData.map((slide, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'all 0.7s ease-in-out',
                  opacity: index === currentSlide ? 1 : 0,
                  transform: index === currentSlide ? 'scale(1)' : 'scale(0.96)',
                  position: index === currentSlide ? 'relative' : 'absolute',
                  zIndex: index === currentSlide ? 10 : 0,
                  pointerEvents: index === currentSlide ? 'auto' : 'none'
                }}
              >
                <div className="carousel-image-wrapper">
                  <img src={slide.imgSrc} alt={slide.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>

                <div style={{ width: '68%', textAlign: 'left' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {carouselData.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    height: '3px',
                    border: 'none',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    padding: '0',
                    transition: 'all 0.3s ease',
                    width: index === currentSlide ? '20px' : '8px',
                    backgroundColor: index === currentSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.25)'
                  }}
                />
              ))}
            </div>
            <button type="button" onClick={handleNext} className="arrow-button"><ChevronRight size={22} /></button>
          </div>

        </div>

      </div>
    </div>
  );
}