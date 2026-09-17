import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  ChevronDown, 
  Search, 
  SlidersHorizontal, 
  Download,
  Loader2,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';

/* SIDEBAR & HEADER COMPONENTS */
import HrSidebar from '../../components/hr-sidebar';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';

import './department-reports.css';

export default function DepartmentReports({ onLogout, user }) {
  const [reportData, setReportData] = useState(null);
  const [wfData, setWfData] = useState(null);
  const [anData, setAnData] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Role-Based Security & Filtering
  const isGlobal = user?.role === 'HR Admin' || user?.role === 'Super Admin';
  const displayDepartment = isGlobal ? 'All Departments (Global)' : user?.department || 'Unassigned';

  const fetchAllData = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // If Global, pass empty string. If HOD, pass their specific department.
      const repQuery = isGlobal ? '' : `?name=${encodeURIComponent(user.department || '')}`;
      const mlQuery = isGlobal ? '' : `?department=${encodeURIComponent(user.department || '')}`;
      
      // 2. Fetch all 3 APIs simultaneously for a unified report
      const [repRes, wfRes, anRes] = await Promise.all([
        fetch(`${apiUrl}/api/reports/department${repQuery}`),
        fetch(`${apiUrl}/api/workforce-forecast${mlQuery}`),
        fetch(`${apiUrl}/api/anomalies${mlQuery}`)
      ]);

      if (repRes.ok) setReportData(await repRes.json());
      if (wfRes.ok) setWfData(await wfRes.json());
      if (anRes.ok) setAnData(await anRes.json());
      
    } catch (error) {
      console.error("Failed to load unified report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      fetchAllData();
      setIsGenerating(false);
    }, 1200); // Simulate processing time for UX
  };

  const handleExport = () => {
    window.print(); // Simple browser print/PDF export
  };

  const renderSidebar = () => {
    switch (user?.role) {
      case 'HR Admin':
      case 'Super Admin':
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

  // Helper to draw the mini ML Workforce SVG Line
  const generateSvgPath = () => {
    if (!wfData || !wfData.forecast) return "";
    const points = wfData.forecast.map((day, index) => {
      const x = (index / 29) * 100;
      const clampedVal = Math.max(75, Math.min(100, day.availablePercentage));
      const y = ((100 - clampedVal) / 25) * 100; 
      return `${x},${y}`;
    });
    return points.join(' '); 
  };

  const maxMonthlyLeaves = reportData?.monthlyData ? 
    Math.max(...Object.values(reportData.monthlyData).map(m => 
      Object.values(m).reduce((a, b) => a + b, 0)
    )) : 10;

  return (
    <div className="dr-dashboard-container">
      {renderSidebar()}

      <main className="dr-main-content fade-in-up">
        
        {/* STANDARDIZED GLOBAL HEADER */}
        <header className="dr-header-row">
          <div className="dr-title-wrapper">
            <FileText size={28} className="dr-icon-maroon" /> 
            <div className="dr-title-text">
              <h2>
                <span className="dr-title-dark">{isGlobal ? 'Global' : 'Department'}</span> <span className="dr-title-maroon">Reports</span>
              </h2>
              <p className="dr-subtitle">
                Scope: <span className="dr-highlight-maroon">{displayDepartment}</span>
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
                <select id="report-type-select" defaultValue="comprehensive">
                  <option value="comprehensive">Comprehensive Dashboard</option>
                  <option value="leave">Leave & Attendance Only</option>
                  <option value="workforce">Workforce Forecast Only</option>
                  <option value="anomaly">Anomaly Alerts Only</option>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#64748b' }}>
            <Loader2 size={32} className="spin" style={{ color: '#800000', marginBottom: '16px' }} />
            <p>Compiling comprehensive ML and Department Data...</p>
          </div>
        ) : !reportData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#64748b' }}>
            No report data available for this scope.
          </div>
        ) : (
          <div className="dr-quad-grid">
            
            {/* Card 1: Leave Distribution Type */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Leave Distribution Type (YTD)</div>
              <div className="dr-card-body flex-center">
                <div className="dr-pie-wrapper">
                  <div className="dr-pie-circle"></div>
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

            {/* Card 3: Workforce Report (Now connected to Python ML Prophet) */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Workforce Forecast (30 Days)</div>
              <div className="dr-card-body" style={{ padding: '16px' }}>
                <div className="dr-line-chart-frame" style={{ height: '140px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '12px', color: '#64748b' }}>
                    Active Staff: <strong>{wfData?.totalStaff || 0}</strong>
                  </div>
                  
                  {/* ML Generated Mini-Graph */}
                  <div style={{ width: '100%', height: '100%', paddingTop: '20px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                      <polyline 
                        points={generateSvgPath()} 
                        fill="none" 
                        stroke="#800000" 
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>
                
                {wfData?.alerts?.some(a => a.type === 'critical') ? (
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fef2f2', borderLeft: '3px solid #dc2626', color: '#991b1b', fontSize: '13px' }}>
                    <TrendingDown size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom'}} />
                    <strong>Warning:</strong> Predicted availability drops below 90% soon.
                  </div>
                ) : (
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#ecfdf5', borderLeft: '3px solid #059669', color: '#065f46', fontSize: '13px' }}>
                    <strong>Stable:</strong> Operations projected to remain above 90% capacity.
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Anomaly Report (Now connected to Python ML Isolation Forest) */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Anomaly Intelligence Report</div>
              <div className="dr-card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: '700', color: '#800000' }}>
                      {anData?.stats?.totalFlagged || 0}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Active Alerts</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                      {anData?.stats?.resolvedThisMonth || 0}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Resolved (YTD)</span>
                  </div>
                </div>

                {anData?.stats?.highRisk > 0 ? (
                  <div style={{ padding: '10px', backgroundColor: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '6px', fontSize: '13px', color: '#be123c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} />
                    <span><strong>Action Required:</strong> {anData.stats.highRisk} employees marked as High-Risk behavioral anomalies.</span>
                  </div>
                ) : (
                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>
                    No high-risk anomalies detected.
                  </div>
                )}

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