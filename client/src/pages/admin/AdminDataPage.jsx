import React, { useState, useEffect } from 'react';
import { apiGetAdminHistoricalData, fetchCities } from '../../services/api';
import {
  Database,
  ArrowLeft,
  Download,
  Filter,
  RotateCw
} from 'lucide-react';

export default function AdminDataPage({ onBack }) {
  const [records, setRecords] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const cityRes = await fetchCities();
      if (cityRes.cities) setCities(cityRes.cities);
      loadRecords();
    }
    init();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [selectedCity, limit]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await apiGetAdminHistoricalData(selectedCity, limit);
      if (res.success) {
        setRecords(res.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['id', 'city', 'aqi', 'temperature', 'humidity', 'pm25', 'pm10', 'co', 'no2', 'so2', 'o3', 'wind_speed', 'pressure', 'recorded_at'];
    const csvRows = [headers.join(',')];

    for (const r of records) {
      const row = [
        r.id,
        r.city,
        r.aqi,
        r.temperature,
        r.humidity,
        r.pm25,
        r.pm10,
        r.co,
        r.no2,
        r.so2,
        r.o3,
        r.wind_speed,
        r.pressure,
        `"${new Date(r.recorded_at).toISOString()}"`
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosense_telemetry_${selectedCity}_${Date.now()}.csv`;
    a.click();
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
              Database Records Inspector
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Audit raw time-series environmental records in PostgreSQL
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={records.length === 0}
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#60a5fa',
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
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter size={16} color="#94a3b8" />
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>City Filter:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="all">All Monitored Cities</option>
            {cities.map(c => (
              <option key={c.key} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Row Limit:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value={25}>25 Rows</option>
            <option value={50}>50 Rows</option>
            <option value={100}>100 Rows</option>
          </select>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            ({records.length} records shown)
          </span>
        </div>
      </div>

      {/* Raw Table */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>ID</th>
              <th style={{ padding: '10px 12px' }}>City</th>
              <th style={{ padding: '10px 12px' }}>AQI</th>
              <th style={{ padding: '10px 12px' }}>Temp</th>
              <th style={{ padding: '10px 12px' }}>Humidity</th>
              <th style={{ padding: '10px 12px' }}>PM2.5</th>
              <th style={{ padding: '10px 12px' }}>PM10</th>
              <th style={{ padding: '10px 12px' }}>CO</th>
              <th style={{ padding: '10px 12px' }}>NO2</th>
              <th style={{ padding: '10px 12px' }}>SO2</th>
              <th style={{ padding: '10px 12px' }}>O3</th>
              <th style={{ padding: '10px 12px' }}>Wind</th>
              <th style={{ padding: '10px 12px' }}>Recorded At</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((r, i) => (
                <tr key={r.id || i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>#{r.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f8fafc' }}>{r.city}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#38bdf8' }}>{r.aqi}</td>
                  <td style={{ padding: '10px 12px' }}>{r.temperature}°C</td>
                  <td style={{ padding: '10px 12px' }}>{r.humidity}%</td>
                  <td style={{ padding: '10px 12px' }}>{r.pm25} µg</td>
                  <td style={{ padding: '10px 12px' }}>{r.pm10} µg</td>
                  <td style={{ padding: '10px 12px' }}>{r.co} mg</td>
                  <td style={{ padding: '10px 12px' }}>{r.no2} µg</td>
                  <td style={{ padding: '10px 12px' }}>{r.so2} µg</td>
                  <td style={{ padding: '10px 12px' }}>{r.o3} µg</td>
                  <td style={{ padding: '10px 12px' }}>{r.wind_speed} km/h</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                    {new Date(r.recorded_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" style={{ padding: '36px 0', textAlign: 'center', color: '#64748b' }}>
                  No telemetry records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
