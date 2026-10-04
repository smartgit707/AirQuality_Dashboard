import React, { useState, useEffect } from 'react';
import { apiGetAdminSystemMetrics } from '../../services/api';
import {
  Server,
  ArrowLeft,
  Activity,
  Cpu,
  HardDrive,
  Database,
  Clock,
  RotateCw,
  ShieldCheck
} from 'lucide-react';

export default function AdminSystemPage({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await apiGetAdminSystemMetrics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(51, 65, 85, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} /> Admin Console
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              System Infrastructure & Security Logs
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Hardware metrics, background daemon health, and security audit event logs
            </p>
          </div>
        </div>

        <button
          onClick={loadMetrics}
          style={{
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            color: '#f472b6',
            padding: '8px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <RotateCw size={14} /> Refresh Diagnostics
        </button>
      </div>

      {data && (
        <>
          {/* Diagnostics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '28px'
          }}>
            {/* Database Engine */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Database size={20} color="#8b5cf6" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Database Engine
                </h3>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <div>Status: <strong style={{ color: '#10b981' }}>{data.system.databaseStatus}</strong></div>
                <div>Telemetry Records: <strong>{data.counts.records}</strong></div>
                <div>User Accounts: <strong>{data.counts.users}</strong></div>
                <div>Advisories Dispatched: <strong>{data.counts.alerts}</strong></div>
              </div>
            </div>

            {/* Server Process */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Cpu size={20} color="#3b82f6" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Node.js Runtime
                </h3>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <div>Node Version: <strong>{data.system.nodeVersion}</strong></div>
                <div>Environment: <strong>{data.system.environment}</strong></div>
                <div>Process Memory (RSS): <strong>{data.system.processMemoryRSS_MB} MB</strong></div>
                <div>Server Uptime: <strong>{formatSeconds(data.system.serverUptime)}</strong></div>
              </div>
            </div>

            {/* Background Data Collector Worker */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Clock size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Background Daemon
                </h3>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <div>Telemetry Worker: <strong style={{ color: '#34d399' }}>{data.system.collectorStatus}</strong></div>
                <div>Sync Cadence: <strong>Every {data.system.collectorIntervalMinutes} minutes</strong></div>
                <div>Host Uptime: <strong>{formatSeconds(data.system.hostUptime)}</strong></div>
                <div>Free Host Memory: <strong>{data.system.freeMemoryMB} MB / {data.system.totalMemoryMB} MB</strong></div>
              </div>
            </div>
          </div>

          {/* Audit Trail Detailed View */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldCheck size={18} color="#10b981" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Complete Security Audit Trail (Latest 25 Events)
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Event ID</th>
                    <th style={{ padding: '10px 12px' }}>Timestamp</th>
                    <th style={{ padding: '10px 12px' }}>Action Type</th>
                    <th style={{ padding: '10px 12px' }}>Audit Description</th>
                    <th style={{ padding: '10px 12px' }}>Origin IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.auditLogs && data.auditLogs.length > 0 ? (
                    data.auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>#{log.id}</td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: 'rgba(51, 65, 85, 0.6)',
                            padding: '3px 8px',
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
                      <td colSpan="5" style={{ padding: '36px 0', textAlign: 'center', color: '#64748b' }}>
                        No audit events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
