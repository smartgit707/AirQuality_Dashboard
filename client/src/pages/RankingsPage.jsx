import React, { useState } from 'react';
import { 
  Trophy, 
  ArrowDownUp, 
  Flame, 
  ShieldCheck, 
  Globe, 
  MapPin, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Clock
} from 'lucide-react';
import { getLiveCityRankings, getAQIStatus } from '../data/mockData';

export default function RankingsPage({ onSelectCityForDashboard, onNavigate }) {
  const [activeTab, setActiveTab] = useState('polluted'); // 'polluted' | 'cleanest'
  const [filterRegion, setFilterRegion] = useState('all'); // 'all' | 'india' | 'world'
  const [searchQuery, setSearchQuery] = useState('');

  const rawList = getLiveCityRankings(activeTab, filterRegion);
  const filteredList = rawList.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.city.toLowerCase().includes(q) ||
      (item.state || '').toLowerCase().includes(q) ||
      (item.country || 'India').toLowerCase().includes(q)
    );
  });

  return (
    <div className="analytics-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(12, 24, 18, 0.95) 0%, rgba(6, 12, 9, 0.98) 100%)',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          borderRadius: '24px',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), inset 0 0 35px rgba(0, 245, 160, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(0, 245, 160, 0.12)', border: '1px solid rgba(0, 245, 160, 0.3)', color: '#00f5a0', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Trophy size={14} />
            <span>GLOBAL & NATIONAL AIR INTELLIGENCE LEADERBOARD</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
            Real-Time City Air Quality Rankings
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '780px', lineHeight: 1.5, margin: 0 }}>
            Live comparative ranking of metropolitan hubs evaluated strictly against National Ambient Air Quality Standards (NAQI) and WHO criteria guidelines.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <span className="pulse-dot"></span>
              <strong>Live Telemetry Ranking</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <Clock size={14} />
              <span>Continuously synchronized with Open-Meteo & PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Tabs & Filters Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          background: 'rgba(12, 24, 18, 0.65)',
          padding: '12px 18px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Most Polluted vs Cleanest Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button
            onClick={() => setActiveTab('polluted')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'polluted' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'transparent',
              color: activeTab === 'polluted' ? '#fff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'polluted' ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            <Flame size={15} />
            <span>Most Polluted Cities</span>
          </button>

          <button
            onClick={() => setActiveTab('cleanest')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'cleanest' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              color: activeTab === 'cleanest' ? '#fff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'cleanest' ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <ShieldCheck size={15} />
            <span>Cleanest Cities</span>
          </button>
        </div>

        {/* Region Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Region:</span>
          {['all', 'india', 'world'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRegion(r)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: filterRegion === r ? '1px solid #00f5a0' : '1px solid rgba(255, 255, 255, 0.1)',
                background: filterRegion === r ? 'rgba(0, 245, 160, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: filterRegion === r ? '#00f5a0' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {r === 'all' ? 'All Stations' : r === 'india' ? 'India' : 'International'}
            </button>
          ))}
        </div>

        {/* Search within table */}
        <div>
          <input
            type="text"
            placeholder="Filter city or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none',
              width: '180px'
            }}
          />
        </div>
      </div>

      {/* Main Rankings Data Table */}
      <div 
        style={{
          background: 'rgba(12, 24, 18, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.35)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City & Location</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live AQI</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PM2.5 (µg/m³)</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dominant</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Updated</th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, idx) => {
                const status = item.status;
                const isLeader = idx === 0;

                return (
                  <tr 
                    key={item.city}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelectCityForDashboard && onSelectCityForDashboard(item.city)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 245, 160, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Rank Number */}
                    <td style={{ padding: '16px 20px' }}>
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          background: isLeader 
                            ? (activeTab === 'polluted' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)')
                            : 'rgba(255, 255, 255, 0.05)',
                          color: isLeader 
                            ? (activeTab === 'polluted' ? '#ef4444' : '#10b981')
                            : '#94a3b8',
                          border: isLeader
                            ? `1px solid ${activeTab === 'polluted' ? '#ef4444' : '#10b981'}`
                            : '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {item.rank}
                      </div>
                    </td>

                    {/* City & Location */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{item.city}</span>
                        {item.country && item.country !== 'India' && (
                          <span style={{ fontSize: '0.7rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.country}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {item.state ? `${item.state}, ` : ''}{item.country || 'India'}
                      </div>
                    </td>

                    {/* AQI Score */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: status.color, textShadow: `0 0 20px ${status.color}33` }}>
                        {item.aqi}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px 20px' }}>
                      <span 
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          backgroundColor: status.badgeBg,
                          color: status.color,
                          border: `1px solid ${status.badgeBorder}`
                        }}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* PM2.5 */}
                    <td style={{ padding: '16px 20px', color: '#f8fafc', fontWeight: 700 }}>
                      {item.pm25 != null ? `${item.pm25} µg/m³` : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unavailable</span>}
                    </td>

                    {/* Dominant Pollutant */}
                    <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                      {item.aqi > 100 ? 'PM2.5 (Fine)' : 'Ozone (O₃)'}
                    </td>

                    {/* Last Updated */}
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.8rem' }}>
                      {item.lastUpdated || 'Just now'}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectCityForDashboard) onSelectCityForDashboard(item.city);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(0, 245, 160, 0.1)',
                          border: '1px solid rgba(0, 245, 160, 0.3)',
                          color: '#00f5a0',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Analyze</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
