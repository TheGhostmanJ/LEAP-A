import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  SlidersHorizontal, 
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

/* SIDEBAR & HEADER COMPONENTS */
import HodSidebar from '../../components/hod-sidebar'; 
import HrSidebar from '../../components/hr-sidebar'; 
import Header from '../../components/Header';

import './workforce-forecast.css';

export default function WorkforceForecast({ onLogout, user }) {
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        // HR Admins see global data, HODs see their department
        const deptParam = user?.role === 'HR Admin' ? '' : `?department=${encodeURIComponent(user?.department || '')}`;
        
        const response = await fetch(`${apiUrl}/api/workforce-forecast${deptParam}`);
        if (response.ok) {
          const data = await response.json();
          setForecastData(data);
        }
      } catch (error) {
        console.error("Failed to load workforce forecast:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchForecast();
  }, [user]);

  const renderSidebar = () => {
    switch (user?.role) {
      case 'HR Admin':
        return <HrSidebar user={user} />;
      case 'Department Head':
      default:
        return <HodSidebar user={user} />;
    }
  };

// Helper to draw the SVG Line graph dynamically based on 30-day percentages
  const generateSvgPath = () => {
    if (!forecastData || !forecastData.forecast) return "";
    const points = forecastData.forecast.map((day, index) => {
      const x = (index / 29) * 100; // Spread evenly across 100% width
      // Y axis maps 75% to 100%. (100 - value) / 25 * 100
      const clampedVal = Math.max(75, Math.min(100, day.availablePercentage));
      const y = ((100 - clampedVal) / 25) * 100; 
      return `${x},${y}`;
    });
    
    // FIXED: <polyline> just wants space-separated coordinates, no 'M' or 'L'
    return points.join(' '); 
  };

  return (
    <div className="wf-dashboard-container">
      {/* Navigation Column */}
      {renderSidebar()}

      {/* Main Viewport Area */}
      <main className="wf-main-content fade-in-up">
        
        {/* STANDARDIZED HEADER */}
        <header className="wf-header-row">
          
          
          <Header user={user} onLogout={onLogout} />
        </header>

        {isLoading || !forecastData ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#64748b' }}>
            <Loader2 size={32} className="spin" style={{ color: '#800000', marginBottom: '16px' }} />
            <p>Analyzing workforce availability patterns...</p>
          </div>
        ) : (
          <>
            {/* SUMMARY METRICS ROW */}
            <section className="wf-metrics-grid">
              <div className="wf-stat-card">
                <div className="wf-stat-info">
                  <span className="wf-stat-label">Total Staff</span>
                  <span className="wf-stat-subtext">Active Employees</span>
                </div>
                <div className="wf-stat-number text-green">{forecastData.totalStaff}</div>
                <Info size={16} className="wf-info-icon" />
              </div>

              <div className="wf-stat-card">
                <div className="wf-stat-info">
                  <span className="wf-stat-label">Available Staff</span>
                  <span className="wf-stat-subtext">On-duty today</span>
                </div>
                <div className="wf-stat-number text-dark">{forecastData.availableToday}</div>
                <Info size={16} className="wf-info-icon" />
              </div>

              <div className="wf-stat-card">
                <div className="wf-stat-info">
                  <span className="wf-stat-label">On Leave</span>
                  <span className="wf-stat-subtext">Pending Approvals: <b>{forecastData.pendingLeaves}</b></span>
                </div>
                <div className="wf-stat-number text-amber">{forecastData.onLeaveToday}</div>
                <Info size={16} className="wf-info-icon" />
              </div>
            </section>

            {/* TWO-COLUMN LAYOUT GRID */}
            <div className="wf-grid-split">
              
              {/* LEFT COLUMN: GRAPH & BREAKDOWN TABLE */}
              <div className="wf-left-col">
                
                {/* 30-Day Forecast Box */}
                <div className="wf-card-box">
                  <div className="wf-card-header">
                    <h3>30 Day Workforce Availability Forecast</h3>
                    <SlidersHorizontal size={18} className="wf-header-icon" />
                  </div>

                  <div className="wf-chart-body">
                    <div className="wf-graph-container">
                      <div className="wf-y-axis">
                        <span>100%</span>
                        <span>90%</span>
                        <span>85%</span>
                        <span>80%</span>
                        <span>75%</span>
                      </div>

                      <div className="wf-graph-canvas" style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {/* Dynamic SVG Line Graph */}
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
                           <polyline 
                              points={generateSvgPath()} 
                              fill="none" 
                              stroke="#800000" 
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                           />
                           {/* Add points for critical dips */}
                           {forecastData.forecast.map((day, i) => {
                              if (day.availablePercentage < 90) {
                                const x = (i / 29) * 100;
                                const y = ((100 - Math.max(75, day.availablePercentage)) / 25) * 100;
                                return (
                                  <circle key={i} cx={`${x}%`} cy={`${y}%`} r="3" fill="#dc2626" />
                                );
                              }
                              return null;
                           })}
                        </svg>
                        
                        {forecastData.alerts.some(a => a.type === 'critical') && (
                          <div className="wf-dip-pulse" style={{ left: '50%', top: '40%' }}>
                            <span className="wf-dip-pill">Critical Availability Dip &lt;90%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* X-Axis Days */}
                    <div className="wf-x-axis-row">
                      <div className="wf-x-spacer"></div>
                      <div className="wf-x-days">
                        {forecastData.forecast.map((day, i) => (
                          // Only show every 3rd day to prevent crowding
                          i % 3 === 0 ? <span key={i}>{day.dateStr}</span> : <span key={i}></span>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="wf-graph-legend">
                      <span className="wf-legend-item">
                        <span className="wf-line maroon"></span> Current Forecast
                      </span>
                      <span className="wf-legend-item">
                        <span className="wf-line dashed"></span> Historical Avg
                      </span>
                      <span className="wf-legend-item">
                        <span className="wf-square gray"></span> Weekend
                      </span>
                    </div>
                  </div>

                  <div 
                    className="wf-card-footer-link" 
                    onClick={() => setIsModalOpen(true)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <span>View Full Forecast Detail <ArrowRight size={14} /></span>
                  </div>
                </div>

                {/* Availability Breakdown Table */}
                <div className="wf-card-box">
                  <div className="wf-card-header">
                    <h3>Workforce Availability Breakdown</h3>
                    <SlidersHorizontal size={18} className="wf-header-icon" />
                  </div>

                  <div className="wf-table-wrapper">
                    <table className="wf-data-table">
                      <thead>
                        <tr>
                          <th>Date Range</th>
                          <th className="text-center">Available Staff</th>
                          <th className="text-center">Required (90%)</th>
                          <th className="text-center">Risk Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecastData.breakdowns.length === 0 ? (
                          <tr><td colSpan="4" className="text-center" style={{padding: '16px', color: '#64748b'}}>All operations stable for the next 30 days.</td></tr>
                        ) : (
                          forecastData.breakdowns.map((br, idx) => (
                            <tr key={idx}>
                              <td className="wf-td-bold">{br.dateRange}</td>
                              <td className="text-center">{br.available}</td>
                              <td className="text-center">{br.required}</td>
                              <td className="text-center">
                                <span className={`wf-risk-badge ${br.riskLevel === 'High' ? 'critical' : br.riskLevel === 'Moderate' ? 'mod' : 'low'}`}>
                                  {br.riskLevel} Risk
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: RISKS & SUGGESTIONS */}
              <div className="wf-right-col">
                
                {/* Risk Alerts */}
                <div className="wf-card-box">
                  <div className="wf-card-header">
                    <h3>Staffing Risk Alerts</h3>
                  </div>

                  <div className="wf-alert-list">
                    {forecastData.alerts.length === 0 ? (
                      <div style={{ padding: '16px', color: '#059669', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={18} /> No critical alerts at this time.
                      </div>
                    ) : (
                      forecastData.alerts.map((alert, idx) => (
                        <div key={idx} className="wf-alert-item">
                          {alert.type === 'critical' ? (
                            <AlertCircle size={20} className="icon-red" />
                          ) : (
                            <AlertTriangle size={20} className="icon-amber" />
                          )}
                          <p className="wf-alert-msg">
                            <span className={`wf-alert-tag ${alert.type === 'critical' ? 'text-red' : 'text-amber'}`}>
                              {alert.tag}:
                            </span> {alert.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Automated Scheduling Suggestion */}
                <div className="wf-suggestion-card">
                  <div className="wf-suggestion-header">
                    <AlertCircle size={20} className="wf-icon-maroon" />
                    <h3>Automated Scheduling Suggestion</h3>
                  </div>
                  <div className="wf-suggestion-body">
                    <p className="suggestion-description">
                      {forecastData.suggestion || "Workforce levels are optimal. No automated scheduling interventions are required at this time."}
                    </p>
                    {forecastData.suggestion && (
                      <button type="button" className="wf-action-btn">
                        Apply Deferral Plan
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

        {/* FULL FORECAST MODAL */}
        {isModalOpen && forecastData && (
          <div className="wf-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="wf-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
              
              <div className="wf-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#800000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={24} /> Detailed Analytics & Forecast
                </h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Historical Insights Panel */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', marginTop: 0, color: '#334155' }}>Historical Pattern Recognition</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    Insights derived from 5 years of longitudinal attendance data via time-series analysis.
                  </p>
                  
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><strong style={{color: '#0f172a'}}>Structural Shift Detected:</strong> Model recognizes the transition to a Monday-Thursday workweek in 2026. Friday baseline expectations adjusted to 0.</li>
                    <li><strong style={{color: '#0f172a'}}>Seasonal Spikes:</strong> Higher historical incidence of sick/emergency leaves during the Habagat season (July - September).</li>
                    <li><strong style={{color: '#0f172a'}}>Punctuality Trends:</strong> Average check-in time remains stable around 07:45 AM, with a 15-minute standard deviation leading to a ~16% natural tardiness rate.</li>
                  </ul>
                </div>

                {/* Day-by-Day Forecast Table */}
                <div>
                  <h3 style={{ fontSize: '16px', marginTop: 0, color: '#334155' }}>30-Day Daily Prediction Matrix</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Date</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #cbd5e1' }}>Predicted Absences</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #cbd5e1' }}>Expected Availability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecastData.forecast.map((day, idx) => (
                          <tr key={idx} style={{ backgroundColor: day.isWeekend ? '#f8fafc' : '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px', fontWeight: '500', color: day.isWeekend ? '#94a3b8' : '#334155' }}>
                              {day.dateStr} {day.isWeekend && "(Weekend)"}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center', color: '#dc2626', fontWeight: '600' }}>
                              {day.isWeekend ? "-" : Math.round(day.absences)}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: day.availablePercentage < 90 && !day.isWeekend ? '#dc2626' : '#059669' }}>
                              {day.isWeekend ? "100%" : `${Math.round(day.availablePercentage)}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}