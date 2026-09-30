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
  ShieldAlert,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
  const [isExporting, setIsExporting] = useState(false); // NEW: disables export buttons mid-export

  // NEW: actual filter state — the dropdown and search box were rendered before but
  // weren't controlled or wired to anything, so nothing happened when you used them.
  const [reportType, setReportType] = useState('comprehensive');
  const [searchQuery, setSearchQuery] = useState('');

  // NEW: Date Range was a readOnly text field with a decorative (non-clickable) calendar
  // icon next to it — there was no button there to "not work" because nothing was wired
  // to it at all. Replaced with a real preset dropdown + an Advanced Filters panel that
  // the sliders icon now actually toggles.
  const [dateRangePreset, setDateRangePreset] = useState('ytd2026');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

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

  const handlePrint = () => {
    window.print(); // Simple browser print fallback (kept for quick on-screen printing)
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

  // FIX: Math.max(...[]) returns -Infinity when monthlyData is empty, which rendered as
  // "NaN" on the Y-axis labels even though the bar area correctly said "Insufficient
  // timeline data". Guard against the empty-object case explicitly.
  const monthKeys = reportData?.monthlyData ? Object.keys(reportData.monthlyData) : [];
  const maxMonthlyLeaves = monthKeys.length > 0
    ? Math.max(...Object.values(reportData.monthlyData).map(m => 
        Object.values(m).reduce((a, b) => a + b, 0)
      ))
    : 10;

  // ==========================================
  // FILTERING: which sections are visible/exported, and search-narrowed data
  // ==========================================
  const showLeave = reportType === 'comprehensive' || reportType === 'leave';
  const showWorkforce = reportType === 'comprehensive' || reportType === 'workforce';
  const showAnomaly = reportType === 'comprehensive' || reportType === 'anomaly';

  const reportTypeLabels = {
    comprehensive: 'Comprehensive Dashboard',
    leave: 'Leave & Attendance Report',
    workforce: 'Workforce Forecast Report',
    anomaly: 'Anomaly Alerts Report'
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Human-readable label for whichever date range is active — presets, or the two
  // custom dates once both are picked.
  const dateRangeLabels = {
    ytd2026: 'YTD 2026',
    last30: 'Last 30 Days',
    quarter: 'This Quarter',
    custom: 'Custom Range'
  };
  const activeDateRangeLabel =
    dateRangePreset === 'custom' && customFrom && customTo
      ? `${customFrom} to ${customTo}`
      : dateRangeLabels[dateRangePreset];

  // Search narrows the Leave Distribution legend by leave type...
  const filteredDistribution = reportData
    ? reportData.distribution.filter(d =>
        !normalizedQuery || d.type.toLowerCase().includes(normalizedQuery)
      )
    : [];

  // ...and narrows the Anomaly list by employee name.
  const filteredAnomalyAlerts = anData?.alerts
    ? anData.alerts.filter(a =>
        !normalizedQuery || a.employee_name?.toLowerCase().includes(normalizedQuery)
      )
    : [];

  // ==========================================
  // EXPORT: shared metadata block used by both PDF and Excel exports
  // ==========================================
  const buildReportMeta = () => ({
    title: reportTypeLabels[reportType] || 'Department Report',
    subtitle: displayDepartment,
    period: activeDateRangeLabel,
    generatedAt: new Date().toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' }),
    generatedBy: user
      ? (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown')
      : 'Unknown',
    filenameSafeDept: (displayDepartment || 'Department').replace(/[^a-z0-9]+/gi, '_')
  });

  // ==========================================
  // EXPORT: PDF (jsPDF + jspdf-autotable)
  // Run: npm install jspdf jspdf-autotable
  // ==========================================
  const handleExportPDF = () => {
    if (!reportData) return;
    setIsExporting(true);

    try {
      const meta = buildReportMeta();
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- Header block. Swap in the actual city seal via doc.addImage() before deployment. ---
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('City Government of Lipa', pageWidth / 2, 40, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Human Resource Management Office', pageWidth / 2, 56, { align: 'center' });

      doc.setDrawColor(128, 0, 0);
      doc.setLineWidth(1);
      doc.line(40, 66, pageWidth - 40, 66);

      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text(`${meta.title} \u2014 ${meta.subtitle}`, pageWidth / 2, 86, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`Period: ${meta.period}`, 40, 106);
      doc.text(`Generated: ${meta.generatedAt}`, 40, 120);
      doc.text(`Prepared by: ${meta.generatedBy}`, 40, 134);

      let cursorY = 156;
      const tableTheme = {
        headStyles: { fillColor: [128, 0, 0], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 5 },
        margin: { left: 40, right: 40 }
      };

      // --- Table 1: Leave Distribution (skipped unless the Report Type filter includes Leave) ---
      if (showLeave) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Leave Distribution (YTD)', 40, cursorY);
        autoTable(doc, {
          startY: cursorY + 8,
          head: [['Leave Type', 'Share of Total']],
          body: filteredDistribution.length
            ? filteredDistribution.map(d => [d.type, `${d.percentage}%`])
            : [['No leave data matches the current filter', '\u2014']],
          ...tableTheme
        });
        cursorY = doc.lastAutoTable.finalY + 24;

        // --- Table 2: Monthly Trend (pivoted: one column per leave type) ---
        const leaveTypes = Array.from(
          monthKeys.reduce((set, m) => {
            Object.keys(reportData.monthlyData[m]).forEach(t => set.add(t));
            return set;
          }, new Set())
        ).filter(t => !normalizedQuery || t.toLowerCase().includes(normalizedQuery));

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Monthly Leave Trend', 40, cursorY);
        autoTable(doc, {
          startY: cursorY + 8,
          head: [['Month', ...leaveTypes, 'Total']],
          body: monthKeys.length && leaveTypes.length
            ? monthKeys.map(m => {
                const row = leaveTypes.map(t => reportData.monthlyData[m][t] || 0);
                const total = row.reduce((a, b) => a + b, 0);
                return [m, ...row, total];
              })
            : [['No monthly data matches the current filter', ...leaveTypes.map(() => '\u2014'), '\u2014']],
          ...tableTheme
        });
        cursorY = doc.lastAutoTable.finalY + 24;
      }

      // --- Table 3: Workforce Forecast summary (skipped unless filter includes Workforce) ---
      if (showWorkforce && wfData) {
        if (cursorY > pageHeight - 160) { doc.addPage(); cursorY = 40; }
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Workforce Forecast (30-Day Snapshot)', 40, cursorY);
        autoTable(doc, {
          startY: cursorY + 8,
          head: [['Metric', 'Value']],
          body: [
            ['Total Active Staff', wfData.totalStaff ?? '\u2014'],
            ['Available Today', wfData.availableToday ?? '\u2014'],
            ['On Leave Today', wfData.onLeaveToday ?? '\u2014'],
            ['Pending Leave Requests', wfData.pendingLeaves ?? '\u2014']
          ],
          ...tableTheme
        });
        cursorY = doc.lastAutoTable.finalY + 24;
      }

      // --- Table 4: Anomaly Alerts (skipped unless filter includes Anomaly) ---
      if (showAnomaly && anData) {
        if (cursorY > pageHeight - 160) { doc.addPage(); cursorY = 40; }
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Anomaly Intelligence Report', 40, cursorY);
        autoTable(doc, {
          startY: cursorY + 8,
          head: [['Employee', 'Pattern', 'Risk Score', 'Status', 'Flagged']],
          body: filteredAnomalyAlerts.length
            ? filteredAnomalyAlerts.map(a => [
                a.employee_name,
                a.anomaly_pattern,
                a.risk_score,
                a.status,
                a.flagged_at ? new Date(a.flagged_at).toLocaleDateString('en-PH') : '\u2014'
              ])
            : [['No anomaly alerts match the current filter', '\u2014', '\u2014', '\u2014', '\u2014']],
          ...tableTheme,
          styles: { ...tableTheme.styles, fontSize: 8 }
        });
      }

      // --- Footer on every page: confidentiality line + page numbers ---
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text(
          'For official use only \u2014 City Government of Lipa HR Management System',
          40,
          pageHeight - 20
        );
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
      }

      doc.save(`Department_Report_${meta.filenameSafeDept}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to generate the PDF. Check the browser console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // EXPORT: Excel (SheetJS / xlsx)
  // Run: npm install xlsx
  // ==========================================
  const handleExportExcel = () => {
    if (!reportData) return;
    setIsExporting(true);

    try {
      const meta = buildReportMeta();
      const wb = XLSX.utils.book_new();

      // Sheet 0: Cover / metadata (kept first so it's the sheet that opens by default)
      const wsCover = XLSX.utils.aoa_to_sheet([
        ['City Government of Lipa \u2014 Department Report'],
        ['Human Resource Management Office'],
        [],
        ['Department', meta.subtitle],
        ['Period', meta.period],
        ['Generated', meta.generatedAt],
        ['Prepared by', meta.generatedBy]
      ]);
      wsCover['!cols'] = [{ wch: 18 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsCover, 'Cover');

      // Sheets 1-2: Leave Distribution + Monthly Trend (skipped unless filter includes Leave)
      if (showLeave) {
        const wsDist = XLSX.utils.aoa_to_sheet([
          ['Leave Type', 'Share of Total (%)'],
          ...(filteredDistribution.length
            ? filteredDistribution.map(d => [d.type, d.percentage])
            : [['No leave data matches the current filter', '']])
        ]);
        XLSX.utils.book_append_sheet(wb, wsDist, 'Leave Distribution');

        const leaveTypes = Array.from(
          monthKeys.reduce((set, m) => {
            Object.keys(reportData.monthlyData[m]).forEach(t => set.add(t));
            return set;
          }, new Set())
        ).filter(t => !normalizedQuery || t.toLowerCase().includes(normalizedQuery));

        const wsTrend = XLSX.utils.aoa_to_sheet([
          ['Month', ...leaveTypes, 'Total'],
          ...(monthKeys.length && leaveTypes.length
            ? monthKeys.map(m => {
                const row = leaveTypes.map(t => reportData.monthlyData[m][t] || 0);
                const total = row.reduce((a, b) => a + b, 0);
                return [m, ...row, total];
              })
            : [['No monthly data matches the current filter', ...leaveTypes.map(() => ''), '']])
        ]);
        XLSX.utils.book_append_sheet(wb, wsTrend, 'Monthly Trend');
      }

      // Sheet 3: Workforce Forecast (summary + full 30-day series, skipped unless filter includes Workforce)
      if (showWorkforce && wfData) {
        const wfRows = [
          ['Metric', 'Value'],
          ['Total Active Staff', wfData.totalStaff ?? ''],
          ['Available Today', wfData.availableToday ?? ''],
          ['On Leave Today', wfData.onLeaveToday ?? ''],
          ['Pending Leave Requests', wfData.pendingLeaves ?? ''],
          [],
          ['Date', 'Available %', 'Absences']
        ];
        (wfData.forecast || []).forEach(f => {
          wfRows.push([f.dateStr, f.availablePercentage?.toFixed(1), f.absences]);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wfRows), 'Workforce Forecast');
      }

      // Sheet 4: Anomaly Alerts (skipped unless filter includes Anomaly)
      if (showAnomaly && anData) {
        const anRows = [
          ['Employee', 'Pattern', 'Risk Score', 'Status', 'Flagged At'],
          ...(filteredAnomalyAlerts.length
            ? filteredAnomalyAlerts.map(a => [
                a.employee_name,
                a.anomaly_pattern,
                a.risk_score,
                a.status,
                a.flagged_at ? new Date(a.flagged_at).toLocaleDateString('en-PH') : ''
              ])
            : [['No anomaly alerts match the current filter', '', '', '', '']])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(anRows), 'Anomaly Alerts');
      }

      XLSX.writeFile(wb, `Department_Report_${meta.filenameSafeDept}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to generate the Excel file. Check the browser console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="dr-dashboard-container">
      {renderSidebar()}

      <main className="dr-main-content fade-in-up">
        
        {/* STANDARDIZED GLOBAL HEADER */}
        <header className="dr-header-row">
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* FILTER OPTIONS TOOLBELT PANEL */}
        <div className="dr-filter-card">
          <span className="dr-filter-panel-title">Filter Options</span>
          <div className="dr-filter-grid">
            
            <div className="dr-field-group">
              <label htmlFor="date-range-select">Date Range</label>
              <div className="dr-input-wrapper">
                <Calendar size={18} className="dr-input-icon left-icon" />
                <select
                  id="date-range-select"
                  className="padded-left"
                  value={dateRangePreset}
                  onChange={(e) => setDateRangePreset(e.target.value)}
                >
                  <option value="ytd2026">YTD 2026</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="quarter">This Quarter</option>
                  <option value="custom">Custom Range</option>
                </select>
                <ChevronDown size={18} className="dr-input-icon right-icon pointer-none" />
              </div>
            </div>

            <div className="dr-field-group">
              <label htmlFor="report-type-select">Report Type</label>
              <div className="dr-input-wrapper">
                <select
                  id="report-type-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
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
                <input
                  id="report-search-input"
                  type="text"
                  placeholder="Search leave type or employee name..."
                  className="padded-left"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="dr-filter-actions">
              <button
                type="button"
                className={`dr-filter-btn ${showAdvancedFilters ? 'dr-filter-btn-active' : ''}`}
                aria-label="Toggle Advanced Filters"
                aria-pressed={showAdvancedFilters}
                onClick={() => setShowAdvancedFilters(v => !v)}
              >
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

          {showAdvancedFilters && (
            <div className="dr-advanced-filters-row">
              <div className="dr-field-group">
                <label htmlFor="custom-from">From</label>
                <div className="dr-input-wrapper">
                  <input
                    id="custom-from"
                    type="date"
                    value={customFrom}
                    onChange={(e) => { setCustomFrom(e.target.value); setDateRangePreset('custom'); }}
                  />
                </div>
              </div>
              <div className="dr-field-group">
                <label htmlFor="custom-to">To</label>
                <div className="dr-input-wrapper">
                  <input
                    id="custom-to"
                    type="date"
                    value={customTo}
                    onChange={(e) => { setCustomTo(e.target.value); setDateRangePreset('custom'); }}
                  />
                </div>
              </div>
              <p className="dr-advanced-filters-note">
                This sets the date range label shown on-screen and in exports. It doesn't narrow the underlying data yet — that needs the backend report queries to accept a date range, which they don't yet.
              </p>
            </div>
          )}
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
            
            {showLeave && (
            <>
            {/* Card 1: Leave Distribution Type */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Leave Distribution Type (YTD)</div>
              <div className="dr-card-body flex-center">
                <div className="dr-pie-wrapper">
                  <div className="dr-pie-circle"></div>
                  <div className="dr-pie-legend">
                    {filteredDistribution.length === 0 ? (
                      <span>{normalizedQuery ? 'No leave types match your search.' : 'No leave data recorded.'}</span>
                    ) : (
                      filteredDistribution.map(dist => (
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
                        // Search narrows which leave types contribute to each bar's stack/total.
                        const filteredTypes = Object.fromEntries(
                          Object.entries(types).filter(([type]) =>
                            !normalizedQuery || type.toLowerCase().includes(normalizedQuery)
                          )
                        );
                        const totalForMonth = Object.values(filteredTypes).reduce((a, b) => a + b, 0);
                        const heightMultiplier = 100 / (maxMonthlyLeaves || 1);

                        return (
                          <div className="dr-bar-column" key={month}>
                            <div className="dr-stacked-pillar" style={{ height: `${totalForMonth * heightMultiplier}%` }}>
                              {Object.entries(filteredTypes).map(([type, count]) => {
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
            </>
            )}

            {showWorkforce && (
            <>
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
            </>
            )}

            {showAnomaly && (
            <>
            {/* Card 4: Anomaly Report (Now connected to Python ML Isolation Forest) */}
            <div className="dr-chart-card">
              <div className="dr-card-header">Anomaly Intelligence Report</div>
              <div className="dr-card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: '700', color: '#800000' }}>
                      {normalizedQuery ? filteredAnomalyAlerts.length : (anData?.stats?.totalFlagged || 0)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{normalizedQuery ? 'Matching Alerts' : 'Active Alerts'}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                      {anData?.stats?.resolvedThisMonth || 0}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Resolved (YTD)</span>
                  </div>
                </div>

                {normalizedQuery && filteredAnomalyAlerts.length === 0 ? (
                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>
                    No employees match "{searchQuery}".
                  </div>
                ) : anData?.stats?.highRisk > 0 ? (
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
            </>
            )}

          </div>
        )}

        {/* BOTTOM EXPORT ACTIONS FOOTER */}
        <div className="dr-export-row">
          <button
            type="button"
            className="dr-btn-secondary dr-export-btn"
            onClick={handlePrint}
            disabled={!reportData}
            title="Quick browser print"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          <button
            type="button"
            className="dr-btn-secondary dr-export-btn"
            onClick={handleExportExcel}
            disabled={!reportData || isExporting}
          >
            {isExporting ? <Loader2 size={16} className="spin" /> : <FileSpreadsheet size={16} />}
            <span>Export as Excel</span>
          </button>

          <button
            type="button"
            className="dr-btn-primary dr-export-btn"
            onClick={handleExportPDF}
            disabled={!reportData || isExporting}
          >
            {isExporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
            <span>{isExporting ? 'Exporting...' : 'Export as PDF'}</span>
          </button>
        </div>

      </main>
    </div>
  );
}
