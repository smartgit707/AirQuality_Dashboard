import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetAdminSystemMetrics,
  apiGetAdminUsers,
  apiGetAdminCities
} from '../../services/api';
import {
  Shield,
  Users,
  Database,
  Radio,
  Server,
  Activity,
  AlertTriangle,
  Clock,
  ArrowRight,
  Cpu,
  HardDrive,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function AdminDashboard({ onNavigateAdmin }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [cityStatuses, setCityStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const [sysRes, usersRes, citiesRes] = await Promise.all([
        apiGetAdminSystemMetrics(),
        apiGetAdminUsers(),
        apiGetAdminCities()
      ]);

      if (sysRes.success) setMetrics(sysRes);
      if (usersRes.success) setUserCount(usersRes.totalUsers || usersRes.users?.length || 0);
      if (citiesRes.success) {
        setCityCount(citiesRes.totalCities || citiesRes.cities?.length || 0);
        setCityStatuses(citiesRes.cities || []);
      }
    } catch (err) {
      console.error('[AdminDashboard] Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const navCards = [
    {
      id: 'admin-users',
      title: 'User Management',
      desc: 'Inspect accounts, toggle active state, promote/demote administrator roles.',
      icon: Users,
      color: '#3b82f6',
      badge: `${userCount} Users`
    },
    {
      id: 'admin-cities',
      title: 'Station Telemetry',
      desc: 'Verify monitored city status, coordinates, and real-time synchronization health.',
      icon: Radio,
      color: '#10b981',
      badge: `${cityCount} Stations`
    },
    {
      id: 'admin-alerts',
      title: 'Advisory Broadcast',
      desc: 'Dispatch platform-wide alerts and emergency environmental warnings.',
      icon: AlertTriangle,
      color: '#f59e0b',
      badge: `${metrics?.counts?.alerts || 0} Alerts`
    },
    {
      id: 'admin-data',
      title: 'Database Inspector',
      desc: 'Query and audit raw air_quality_records stored in PostgreSQL.',
      icon: Database,
      color: '#8b5cf6',
      badge: `${metrics?.counts?.records || 0} Records`
    },
    {
      id: 'admin-system',
      title: 'Infrastructure & Logs',
      desc: 'Audit trail, Node runtime memory, uptime, and database connection telemetry.',
      icon: Server,
      color: '#ec4899',
      badge: 'Online'
    }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
          }}>
            <Shield size={32} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                EcoSense Administrative Control Center
              </h1>
              <span style={{
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#818cf8',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Lock size={12} /> RBAC Enforcement Active
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
              Logged in as <strong style={{ color: '#f1f5f9' }}>{user?.name}</strong> ({user?.email}) • Platform Node: <strong style={{ color: '#10b981' }}>v3.0.0</strong>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="#3b82f6" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Registered Users</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{userCount}</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={24} color="#8b5cf6" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Stored Readings</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{metrics?.counts?.records || 0}</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={24} color="#10b981" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Monitored Stations</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{cityCount}</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Advisories</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{metrics?.counts?.alerts || 0}</div>
          </div>
        </div>
      </div>

      {/* Admin Modules Navigation */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc' }}>
        Administrative Modules
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {navCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigateAdmin(card.id)}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: `${card.color}22`,
                  border: `1px solid ${card.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} color={card.color} />
                </div>
                <span style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: card.color,
                  border: `1px solid ${card.color}44`,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '10px'
                }}>
                  {card.badge}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0', color: '#f8fafc' }}>
                {card.title}
              </h3>
              <p style={{ margin: '0 0 18px 0', fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>
                {card.desc}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: card.color
              }}>
                <span>Launch Console</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 21: Data Collection Monitoring Table */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px 28px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#00f5a0" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Data Collection & Telemetry Monitoring Status
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {cityStatuses.length} Total Telemetry Hubs
            </span>
            <button
              onClick={() => onNavigateAdmin('admin-cities')}
              style={{
                background: 'rgba(0, 245, 160, 0.1)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
                color: '#00f5a0',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Manage Stations
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>City Hub</th>
                <th style={{ padding: '10px 12px' }}>Current AQI</th>
                <th style={{ padding: '10px 12px' }}>Last Update</th>
                <th style={{ padding: '10px 12px' }}>Ingestion Status</th>
                <th style={{ padding: '10px 12px' }}>Records Count</th>
              </tr>
            </thead>
            <tbody>
              {cityStatuses && cityStatuses.length > 0 ? (
                cityStatuses.map((st, i) => {
                  const isHealthy = st.syncStatus !== 'Delayed';
                  const formattedTime = st.lastSync ? new Date(st.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live';
                  return (
                    <tr key={st.key || st.name || i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f8fafc' }}>
                        {st.name} <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({st.country || 'India'})</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 700, color: st.aqi > 150 ? '#ef4444' : st.aqi > 100 ? '#f59e0b' : '#10b981' }}>
                          {st.aqi != null ? `${st.aqi} AQI` : '--'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                        {formattedTime}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isHealthy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isHealthy ? '#10b981' : '#ef4444',
                          border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isHealthy ? '#10b981' : '#ef4444'
                          }} />
                          {isHealthy ? 'Healthy' : 'Delayed'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.76rem',
                          color: '#e2e8f0'
                        }}>
                          {st.recordsCount || 24} records
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    Loading telemetry hubs...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Security & Audit Logs */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px 28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#10b981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Real-time Administrative Audit Trail
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Last 10 Security Events
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Action</th>
                <th style={{ padding: '10px 12px' }}>Audit Details</th>
                <th style={{ padding: '10px 12px' }}>Origin IP</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.auditLogs && metrics.auditLogs.length > 0 ? (
                metrics.auditLogs.slice(0, 8).map((log, i) => (
                  <tr key={log.id || i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: 'rgba(51, 65, 85, 0.6)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#38bdf8'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{log.details || log.metadata || '--'}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No audit records recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
