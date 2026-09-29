import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Database, AlertCircle } from 'lucide-react';
import { getAQIStatus } from '../data/mockData';

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const status = getAQIStatus(val);

    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-time">{label} Observation</div>
        <div className="tooltip-value" style={{ color: status.color }}>
          <span>AQI {val}</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>({status.label})</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function AQIChart({ data = [], city }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="chart-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Air Quality Index (AQI) Trend</h2>
          <p className="panel-subtitle">Historical records from PostgreSQL for {city}</p>
        </div>
        <div className="source-badge">
          <Database size={13} style={{ marginRight: '4px' }} />
          <span>PostgreSQL Historical Records</span>
        </div>
      </div>

      <div className="chart-wrapper">
        {!hasData ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-muted)',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)'
          }}>
            <AlertCircle size={24} style={{ color: 'var(--text-secondary)' }} />
            <p style={{ fontSize: '0.9rem' }}>No historical telemetry records available for {city}.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                domain={[0, 'dataMax + 40']}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#aqiGradient)"
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0b1120', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
