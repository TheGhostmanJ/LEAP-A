import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  ChevronDown, 
  Search, 
  SlidersHorizontal, 
  Download,
  Loader2
} from 'lucide-react';

/* SIDEBAR & HEADER COMPONENTS */
import HrSidebar from '../../components/hr-sidebar';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';

import './department-reports.css';

export default function DepartmentReports({ onLogout, user }) {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReportData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const deptQuery = user.department ? `?name=${encodeURIComponent(user.department)}` : '';
      
      const response = await fetch(`${apiUrl}/api/reports/department${deptQuery}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error("Failed to load report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [user]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      fetchReportData();
      setIsGenerating(false);
    }, 1200); // Simulate processing time for UX
  };

  const handleExport = () => {
    window.print(); // Simple browser print/PDF export
  };

  const renderSidebar = () => {
    switch (user?.role) {
      case 'HR Admin':
        return <HrSidebar user={user} />;
      case 'Department Head':
      default:
        return <HodSidebar user={user} />;
    }
  };

  // Helper to assign consistent colors to leave types
  const getColorClass = (type) => {
    const t = type.toLowerCase();
    if (t.includes('sick')) return 'maroon';
    if (t.includes('vacation')) return 'gold';
    if (t.includes('emergency')) return 'slate';
    return 'olive';
  };

  // Calculate the maximum total in a month to scale the Bar Chart properly
  const maxMonthlyLeaves = reportData?.monthlyData ? 
    Math.max(...Object.values(reportData.monthlyData).map(m => 
      Object.values(m).reduce((a, b) => a + b, 0)
    )) : 10; // Fallback to avoid division by 0

  return (
    <div className="dr-dashboard-container">
      {/* Fixed Navigation Column */}
      {renderSidebar()}

      {/* Main Viewport Content Surface */}
      <main className="dr-main-content fade-in-up">
        
        {/* STANDARDIZED GLOBAL HEADER */}
        <header className="dr-header-row">
          <div className="dr-title-wrapper">
            <FileText size={28} className="dr-icon-maroon" /> 
            <div className="dr-title-text">
              <h2>
                <span className="dr-title-dark">Department</span> <span className="dr-title-maroon">Reports</span>
              </h2>
              <p className="dr-subtitle">
                Department: <span className="dr-highlight-maroon">{user?.department || 'City Administration'}</span>
              </p>
            </div>
          </div>
          
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* FILTER OPTIONS TOOLBELT PANEL */}
        <div className="dr-filter-card">
          <span className="dr-filter-panel-title">Filter Options</span>
          <div className="dr-filter-grid">
            
            <div className="dr-field-group">
              <label htmlFor="date-range-input">Date Range</label>
              <div className="dr-input-wrapper">
                <input id="date-range-input" type="text" placeholder="Select date range..." readOnly value="YTD 2026" />
                <Calendar size={18} className="dr-input-icon right-icon" />
              </div>
            </div>

            <div className="dr-field-group">
              <label htmlFor="report-type-select">Report Type</label>
              <div className="dr-input-wrapper">
                <select id="report-type-select" defaultValue="leave">
                  <option value="leave">Leave & Attendance Report</option>
                  <option value="workforce">Workforce Forecast</option>
                  <option value="anomaly">Anomaly Alert</option>
                </select>
                <ChevronDown size={18} className="dr-input-icon right-icon pointer-none" />
              </div>
            </div>

            <div className="dr-field-group flex-grow">
              <label htmlFor="report-search-input">Search Bar</label>
              <div className="dr-input-wrapper">
                <Search size={18} className="dr-input-icon left-icon" />
                <input id="report-search-input" type="text" placeholder="Search parameters..." className="padded-left" />
              </div>
            </div>

            <div className="dr-filter-actions">
              <button type="button" className="dr-filter-btn" aria-label="Toggle Advanced Filters">
                <SlidersHorizontal size={20} />
              </button>
              <button 
                type="button" 
                className="dr-btn-primary"
                onClick={handleGenerateReport}
                disabled={isLoading || isGenerating}
              >
                {isGenerating ? <Loader2 size={16} className="spin" style={{marginRight: '6px'}} /> : null}
                {isGenerating ? 'Analyzing...' : 'Generate Report'}
              </button>
            </div>

          </div>
        </div>

        {/* 2x2 DATA VISUALIZATIONS GRID LAYOUT */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={32} className="spin" style={{ color: '#800000' }} />
          </div>
        ) : !reportData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#64748b' }}>
            No report data available for this department.
          </div>
        ) : (
          <div className="dr-quad-grid">
            
            {/* Card 1: Leave Distribution Type */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Leave Distribution Type (YTD)</div>
              <div className="dr-card-body flex-center">
                <div className="dr-pie-wrapper">
                  <div className="dr-pie-circle">
                    {/* Simulated CSS Pie overlay - Uses CSS conic-gradients if implemented in CSS, otherwise falls back to ring */}
                  </div>
                  <div className="dr-pie-legend">
                    {reportData.distribution.length === 0 ? (
                      <span>No leave data recorded.</span>
                    ) : (
                      reportData.distribution.map(dist => (
                        <span key={dist.type}>
                          <span className={`legend-dot color-${getColorClass(dist.type)}`}></span> 
                          {dist.type} <strong>{dist.percentage}%</strong>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Monthly Leave Trend */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Monthly Leave Trend</div>
              <div className="dr-card-body">
                <div className="dr-bar-chart-frame">
                  <div className="dr-y-axis">
                    <span>{Math.ceil(maxMonthlyLeaves)}</span>
                    <span>{Math.ceil(maxMonthlyLeaves * 0.75)}</span>
                    <span>{Math.ceil(maxMonthlyLeaves * 0.5)}</span>
                    <span>{Math.ceil(maxMonthlyLeaves * 0.25)}</span>
                    <span>0</span>
                  </div>
                  <div className="dr-bars-container">
                    {Object.keys(reportData.monthlyData).length === 0 ? (
                      <div style={{ alignSelf: 'center', color: '#94a3b8', width: '100%', textAlign: 'center' }}>Insufficient timeline data</div>
                    ) : (
                      Object.entries(reportData.monthlyData).map(([month, types]) => {
                        const totalForMonth = Object.values(types).reduce((a, b) => a + b, 0);
                        const heightMultiplier = 100 / (maxMonthlyLeaves || 1);

                        return (
                          <div className="dr-bar-column" key={month}>
                            <div className="dr-stacked-pillar" style={{ height: `${totalForMonth * heightMultiplier}%` }}>
                              {Object.entries(types).map(([type, count]) => {
                                const percentOfStack = (count / totalForMonth) * 100;
                                return (
                                  <div 
                                    key={type} 
                                    className={`stack-part ${getColorClass(type)}`} 
                                    style={{ height: `${percentOfStack}%` }}
                                    title={`${count} ${type}`}
                                  ></div>
                                );
                              })}
                            </div>
                            <span className="dr-x-label">{month}<br/><small>2026</small></span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Workforce Report */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Workforce Report (Rolling 30 Days)</div>
              <div className="dr-card-body">
                <div className="dr-line-chart-frame">
                  <div className="dr-trendline-area">
                    <div className="dr-critical-badge">Availability consistently &gt;90%</div>
                  </div>
                  <div className="dr-timeline-x">
                    {Array.from({ length: 15 }, (_, i) => <span key={i + 1}>{i * 2 + 1}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Anomaly Report */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Anomaly Report</div>
              <div className="dr-card-body">
                <div className="dr-anomaly-frame">
                  <div className="dr-anomaly-stats">
                    <span>Peak: <strong>{reportData.anomaly.peak}</strong></span>
                    <span>Avg. Check-In: <strong>{reportData.anomaly.avgCheckIn}</strong></span>
                  </div>
                  <div className="dr-wave-area">
                    <div className="pulse-node pos-a"></div>
                    <div className="pulse-node pos-b"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* BOTTOM EXPORT ACTIONS FOOTER */}
        <div className="dr-export-row">
          <button type="button" className="dr-btn-primary dr-export-btn" onClick={handleExport}>
            <Download size={16} />
            <span>Export As PDF</span>
          </button>
        </div>

      </main>
    </div>
  );
}