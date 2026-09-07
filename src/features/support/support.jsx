import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CalendarPlus,
  Wallet,
  FileEdit,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  X,
  Search,
  BookOpen,
  Copy,
  Check,
  Send,
  ArrowRight
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';
import Header from '../../components/Header.jsx';
import './support.css';

export default function Support({ onLogout, user }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openFaq, setOpenFaq] = useState(null);
  const [activeGuideModal, setActiveGuideModal] = useState(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [copiedText, setCopiedText] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const guidesContent = {
    leave: {
      title: "How to File a Leave Application",
      steps: [
        "Navigate to 'My Leave Application' from the left sidebar.",
        "Click on the 'File New Leave' button located at the top right of the dashboard.",
        "Select your specific Leave Type (e.g., Vacation Leave, Sick Leave, Emergency Leave).",
        "Specify the Start Date and End Date for your requested leave.",
        "Attach any required supporting documentation (e.g., Medical Certificate for sick leaves over 2 days).",
        "Review your details and click 'Submit Application'. Your request will be routed to your Department Head for approval."
      ]
    },
    credits: {
      title: "Understanding Your Leave Credits",
      steps: [
        "Leave credits are earned monthly in accordance with Civil Service regulations.",
        "Vacation and Sick Leave credits accumulate at a rate of 1.25 days per month of full service.",
        "You can view your real-time available balances on your Dashboard or Leave History page.",
        "Monetization of Leave Credits requires a minimum remaining balance of 15 days of Vacation Leave credits.",
        "For special leave types (Maternity, Paternity, Solo Parent), specific statutory conditions apply."
      ]
    },
    attendance: {
      title: "Resolving Attendance & Biometric Issues",
      steps: [
        "Biometric logs are automatically synchronized every 15 minutes.",
        "If your time-in or time-out is unrecorded, check the 'My Attendance' module for missing stamps.",
        "To request a biometric correction, submit a Certificate of Appearance (CA) or Official Business (OB) slip through the portal.",
        "Repeated uncharacteristic timeline shifts will flag a prompt in the smart auditing engine.",
        "For hardware or scanner errors at the kiosk, contact IT Support immediately."
      ]
    }
  };

  const faqData = [
    {
      question: "How do I apply for leave monetization?",
      answer: "Navigate to the Leave Management page, click 'Monetization Request', select the number of leave credits you wish to monetize (minimum 10 days), and submit the form for administrative approval."
    },
    {
      question: "How to apply for a leave application?",
      answer: "Click on 'File New Leave' from your dashboard, fill out the start/end dates, choose the leave category, attach necessary documents, and click 'Submit'."
    },
    {
      question: "What are leave credits and how are they calculated?",
      answer: "Leave credits are earned days off accrued through official government service. Standard employees earn 1.25 days of Sick Leave and 1.25 days of Vacation Leave per month."
    },
    {
      question: "What should I do if my biometric clock-in failed?",
      answer: "Notify your HR department head or submit an Attendance Adjustment request via the portal within 48 hours of the missed punch."
    },
    {
      question: "How long does it take for a leave application to get approved?",
      answer: "Standard approvals by Department Heads typically take 1 to 3 working days. You can track status updates directly in your dashboard."
    },
    {
      question: "Can I cancel or edit an already submitted leave application?",
      answer: "You can cancel a leave request as long as it remains in 'Pending' status. Once 'Approved', a formal request to HR is required to reverse or modify the dates."
    }
  ];

  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  const displayedFaqs = showAllFaqs ? filteredFaqs : filteredFaqs.slice(0, 3);

  return (
    <div className="support-layout-container">
      <Sidebar />

      {/* MAIN WORKSPACE CANVAS */}
      <main className="support-main-content">

        {/* TOP VIEW HEADER */}
        <header className="support-header">
          <div className="header-title-group">
            <div className="icon-badge">
              <HelpCircle size={20} className="icon-maroon" />
            </div>
            <h2 className="header-title">Support Center</h2>
          </div>

          {/* Shared Header Component */}
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* HERO HEADER BANNER */}
        <section className="support-hero-banner">
          <h1 className="hero-title">How can we help you today?</h1>
          <p className="hero-subtitle">
            Search our knowledge base or browse quick guide topics below.
          </p>

          {/* HERO SEARCH BAR */}
          <div className="hero-search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search guides, leave rules, or attendance FAQs..."
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              className="hero-search-input"
            />
          </div>
        </section>

        {/* 3-COLUMN QUICK GUIDE TILES */}
        <section className="guide-tiles-grid">
          
          {/* CARD 1 */}
          <div className="support-guide-card">
            <div className="card-top-content">
              <div className="card-icon-box">
                <CalendarPlus size={22} />
              </div>
              <div>
                <span className="guide-tag">3 min guide</span>
                <h3 className="card-title">How to File a Leave</h3>
                <p className="card-description">Step-by-step leave submission process.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveGuideModal('leave')}
              className="card-action-btn"
            >
              View Guide <ArrowRight size={14} />
            </button>
          </div>

          {/* CARD 2 */}
          <div className="support-guide-card">
            <div className="card-top-content">
              <div className="card-icon-box">
                <Wallet size={22} />
              </div>
              <div>
                <span className="guide-tag">Policy info</span>
                <h3 className="card-title">Leave Credit Rules</h3>
                <p className="card-description">Accrual & monetization breakdown.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveGuideModal('credits')}
              className="card-action-btn"
            >
              View Guide <ArrowRight size={14} />
            </button>
          </div>

          {/* CARD 3 */}
          <div className="support-guide-card">
            <div className="card-top-content">
              <div className="card-icon-box">
                <FileEdit size={22} />
              </div>
              <div>
                <span className="guide-tag">Troubleshooting</span>
                <h3 className="card-title">Attendance Correction</h3>
                <p className="card-description">Resolve biometric clock-in slips.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveGuideModal('attendance')}
              className="card-action-btn"
            >
              View Guide <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="faq-section">
          <div className="section-header-flex">
            <h3 className="section-title">Frequently Asked Questions</h3>
            <span className="faq-counter">Showing {displayedFaqs.length} of {filteredFaqs.length} questions</span>
          </div>

          <div className="faq-container">
            {displayedFaqs.length > 0 ? (
              displayedFaqs.map((faq, index) => (
                <div key={index} className="faq-row-item">
                  <div
                    onClick={() => toggleFaq(index)}
                    className={`faq-question-toggle ${openFaq === index ? 'active' : ''}`}
                  >
                    <span>{faq.question}</span>
                    <div className={`faq-chevron-badge ${openFaq === index ? 'active' : ''}`}>
                      {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {openFaq === index && (
                    <div className="faq-answer-content">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="faq-empty-state">
                No questions found matching "{faqSearchQuery}".
              </div>
            )}

            {filteredFaqs.length > 3 && (
              <div className="faq-footer-action">
                <span
                  onClick={() => setShowAllFaqs(!showAllFaqs)}
                  className="toggle-all-faqs-btn"
                >
                  {showAllFaqs ? "Show Less ↑" : "View More Questions →"}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* HELPDESK CONTACT DIRECTORY DECK */}
        <section className="contact-section">
          <h3 className="section-title">Still Need Help? Contact Support</h3>
          
          <div className="contact-cards-grid">
            
            {/* HR SUPPORT CARD */}
            <div className="contact-card">
              <div>
                <div className="contact-card-header">
                  <h4 className="contact-office-title">HR Support Office</h4>
                  <span className="status-badge">
                    <span className="status-dot"></span> Mon-Fri, 8AM - 5PM
                  </span>
                </div>

                <div className="contact-info-row">
                  <Phone size={14} className="icon-maroon" />
                  <span>(043) 756-1234 (Loc. 102)</span>
                </div>
                <div className="contact-info-row email-row">
                  <Mail size={14} className="icon-maroon" />
                  <span>hrsupport@lipacity.gov.ph</span>
                </div>
              </div>

              <div className="contact-action-group">
                <button
                  onClick={() => handleCopy('(043) 756-1234')}
                  className="contact-btn secondary"
                >
                  {copiedText === '(043) 756-1234' ? <Check size={14} className="icon-green" /> : <Copy size={14} />}
                  {copiedText === '(043) 756-1234' ? 'Copied' : 'Copy Phone'}
                </button>
                <a
                  href="mailto:hrsupport@lipacity.gov.ph"
                  className="contact-btn primary"
                >
                  <Send size={14} /> Send Email
                </a>
              </div>
            </div>

            {/* IT SUPPORT CARD */}
            <div className="contact-card">
              <div>
                <div className="contact-card-header">
                  <h4 className="contact-office-title">IT Systems Support</h4>
                  <span className="status-badge">
                    <span className="status-dot"></span> Mon-Fri, 8AM - 5PM
                  </span>
                </div>

                <div className="contact-info-row">
                  <Phone size={14} className="icon-maroon" />
                  <span>(043) 756-1234 (Loc. 404)</span>
                </div>
                <div className="contact-info-row email-row">
                  <Mail size={14} className="icon-maroon" />
                  <span>itsupport@lipacity.gov.ph</span>
                </div>
              </div>

              <div className="contact-action-group">
                <button
                  onClick={() => handleCopy('itsupport@lipacity.gov.ph')}
                  className="contact-btn secondary"
                >
                  {copiedText === 'itsupport@lipacity.gov.ph' ? <Check size={14} className="icon-green" /> : <Copy size={14} />}
                  {copiedText === 'itsupport@lipacity.gov.ph' ? 'Copied' : 'Copy Email'}
                </button>
                <a
                  href="mailto:itsupport@lipacity.gov.ph"
                  className="contact-btn primary"
                >
                  <Send size={14} /> Send Email
                </a>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* GUIDE DETAILS MODAL */}
      {activeGuideModal && (
        <div className="modal-overlay" onClick={() => setActiveGuideModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <BookOpen size={18} />
                </div>
                <h3 className="modal-title">
                  {guidesContent[activeGuideModal].title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveGuideModal(null)} 
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-steps-list">
              {guidesContent[activeGuideModal].steps.map((step, idx) => (
                <div key={idx} className="modal-step-item">
                  <span className="step-number">{idx + 1}</span>
                  <p className="step-text">{step}</p>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setActiveGuideModal(null)}
                className="modal-dismiss-btn"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}