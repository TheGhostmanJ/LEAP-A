import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Terminal, 
  Search, 
  Clock, 
  AlertCircle, 
  Activity, 
  Zap, 
  CheckCircle2, 
  ShieldAlert,
  Server
} from "lucide-react";
import ItSidebar from "../../components/it-sidebar.jsx";
import Header from "../../components/Header.jsx";
import "./api-gateway.css";

export default function ApiGateway({ onLogout, user }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [liveLogs, setLiveLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real logs from the Express Backend
  const fetchRealTimeLogs = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/gateway/logs`);
      if (response.ok) {
        const data = await response.json();
        setLiveLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch API gateway logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll the real backend every 5 seconds
  useEffect(() => {
    fetchRealTimeLogs(); // Initial fetch
    const interval = setInterval(fetchRealTimeLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = liveLogs.filter((log) =>
    log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toString().includes(searchTerm)
  );

  const totalRequests = liveLogs.length;
  
  // Dynamic Math based on real backend data
  const successRate = totalRequests > 0 
    ? ((liveLogs.filter(l => l.status >= 200 && l.status <= 299).length / totalRequests) * 100).toFixed(0) 
    : 0;
  
  const avgLatencyMs = totalRequests > 0 
    ? liveLogs.reduce((acc, log) => acc + (log.latencyMs || 0), 0) / totalRequests 
    : 0;

  return (
    <div className="app-layout-wrapper">
      {/* SIDEBAR */}
      <ItSidebar user={user} />

      {/* MAIN CONTENT AREA */}
      <main className="app-main-container fade-in-up" style={{ padding: '32px' }}>
        
        {/* STANDARDIZED HEADER BLOCK */}
        <header className="app-global-header">
          <div className="app-title-layout">
            <div className="app-title-icon-badge" style={{ backgroundColor: 'var(--color-maroon-tint)', color: 'var(--color-maroon)' }}>
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="app-title">API Gateway Monitor</h1>
              <p className="app-subtitle">
                Live <span className="app-subtitle-accent">Traffic & Endpoint Health</span>
              </p>
            </div>
          </div>
          
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* METRICS ROW */}
        <div className="apig-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div className="app-card apig-stat-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="apig-stat-icon-box maroon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-maroon-tint)', color: 'var(--color-maroon)' }}>
              <Activity size={24} />
            </div>
            <div className="apig-stat-info">
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block' }}>RECENT TRAFFIC</span>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{totalRequests} <span style={{ fontSize: '14px', fontWeight: '600' }}>Req</span></span>
            </div>
          </div>

          <div className="app-card apig-stat-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="apig-stat-icon-box green" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <CheckCircle2 size={24} />
            </div>
            <div className="apig-stat-info">
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block' }}>SUCCESS RATE</span>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-success)' }}>{successRate}%</span>
            </div>
          </div>

          <div className="app-card apig-stat-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="apig-stat-icon-box amber" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <Zap size={24} />
            </div>
            <div className="apig-stat-info">
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'block' }}>AVG LATENCY</span>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-warning)' }}>{Math.round(avgLatencyMs)}ms</span>
            </div>
          </div>
        </div>

        {/* UTILITY SEARCH BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '380px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="app-search-input"
              placeholder="Search endpoint path, method, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '13px', backgroundColor: 'var(--color-border-light)', padding: '6px 12px', borderRadius: '20px' }}>
            <Clock size={14} className={isLoading ? "" : "spin-slow"} />
            <span>Auto-refreshing every <strong>5s</strong></span>
          </div>
        </div>

        {/* TRAFFIC TABLE CARD */}
        <div className="app-card">
          <div className="app-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} />
              <span>Live Traffic Monitor</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
              Showing {filteredLogs.length} recent events
            </span>
          </div>

          <div className="responsive-table-overflow-scroller">
            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                <ShieldAlert size={32} style={{ margin: '0 auto 12px auto', color: 'var(--color-border)' }} />
                <p>No endpoint logs matching standard search query "{searchTerm}"</p>
              </div>
            ) : (
              <table className="record-grid-system">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Method</th>
                    <th>Endpoint Path</th>
                    <th style={{ textAlign: 'center' }}>Response Code</th>
                    <th style={{ textAlign: 'right' }}>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>{log.time}</td>
                      <td>
                        <span style={{ 
                          backgroundColor: log.method === 'GET' ? '#E0F2FE' : log.method === 'POST' ? '#DCFCE7' : log.method === 'DELETE' ? '#FEE2E2' : '#FEF3C7',
                          color: log.method === 'GET' ? '#0369A1' : log.method === 'POST' ? '#166534' : log.method === 'DELETE' ? '#991B1B' : '#92400E',
                          padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' 
                        }}>
                          {log.method}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--color-text-primary)' }}>{log.endpoint}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`app-status-badge ${log.status >= 200 && log.status <= 299 ? "status-success" : "status-danger"}`}>
                          {log.status}
                          {log.status >= 400 && <AlertCircle size={14} style={{ marginLeft: '4px' }} />}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: log.latency.includes("s") && !log.latency.includes("ms") ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                        {log.latency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}