import React, { useState } from 'react';
import BreathIQSimulator3D from '../components/BreathIQSimulator3D';
import { mockCityData } from '../data/mockData';
import {
  Activity,
  HeartPulse,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Zap,
  Clock,
  Compass,
  ArrowRight,
  Flame,
  Info,
  Sparkles
} from 'lucide-react';

const CITIES = ['Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai'];

const ACTIVITIES = [
  {
    key: 'resting',
    label: 'Resting Adult',
    ventilation: 6, // Liters per min
    desc: 'Sedentary indoor work or rest (12 breaths/min)'
  },
  {
    key: 'commuter',
    label: 'Roadside Commuter',
    ventilation: 18, // Liters per min
    desc: 'Walking or two-wheeler transit (20 breaths/min)'
  },
  {
    key: 'jogger',
    label: 'Cardio / Morning Runner',
    ventilation: 48, // Liters per min
    desc: 'Aerobic running or cycling (32 breaths/min)'
  }
];

export default function BreathIQPage({ onSelectCityForDashboard }) {
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [activity, setActivity] = useState('jogger');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [isN95Active, setIsN95Active] = useState(false);

  const cityData = mockCityData[selectedCity] || mockCityData['Delhi'];
  const aqi = cityData.aqi || 120;
  const pm25 = cityData.pm25 || 65;

  const activeAct = ACTIVITIES.find(a => a.key === activity) || ACTIVITIES[2];

  // Mathematical Physiological Calculations:
  // Total air inhaled in cubic meters (1 L = 0.001 m^3)
  const totalLitersInhaled = activeAct.ventilation * durationMinutes;
  const totalM3Inhaled = totalLitersInhaled / 1000;

  // Total PM2.5 inhaled in micrograms: PM2.5 (ug/m^3) * m^3
  const rawPm25Mass = pm25 * totalM3Inhaled;

  // Pulmonary Alveolar Deposition fraction (~65% of PM2.5 deposits in deep lungs)
  const depositionFraction = 0.65;
  const unprotectedDeposition = rawPm25Mass * depositionFraction;

  // With N95 filter (95% reduction)
  const actualDeposition = isN95Active ? unprotectedDeposition * 0.05 : unprotectedDeposition;

  // Berkeley Earth Cigarette Equivalence formula: 1 cigarette ~ 22 ug PM2.5 inhaled
  const cigaretteEquivalence = (actualDeposition / 22).toFixed(1);

  // Bloodstream translocation risk
  const getRiskLevel = () => {
    if (actualDeposition < 10) return { label: 'MINIMAL', color: '#00f5a0' };
    if (actualDeposition < 30) return { label: 'MODERATE', color: '#facc15' };
    if (actualDeposition < 60) return { label: 'ELEVATED', color: '#fb923c' };
    return { label: 'CRITICAL BURDEN', color: '#ef4444' };
  };
  const risk = getRiskLevel();

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(0, 245, 160, 0.2))',
              border: '1px solid rgba(0, 245, 160, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00f5a0'
            }}>
              <HeartPulse size={22} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              BreathIQ™ <span style={{ color: '#00f5a0', fontSize: '1rem', fontWeight: 600 }}>BIO-INHALATION SIMULATOR</span>
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, maxWidth: '680px' }}>
            Interactive 3D pulmonary respiratory model linking live urban particulate pollution to tidal inhalation volume and deep alveolar lung deposition.
          </p>
        </div>

        {/* N95 Quick Filter Toggle */}
        <button
          onClick={() => setIsN95Active(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            background: isN95Active ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(0, 245, 160, 0.25))' : 'rgba(15, 23, 42, 0.7)',
            border: `1.5px solid ${isN95Active ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)'}`,
            color: isN95Active ? '#38bdf8' : '#94a3b8',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.25s',
            boxShadow: isN95Active ? '0 0 20px rgba(56, 189, 248, 0.35)' : 'none'
          }}
        >
          {isN95Active ? <ShieldCheck size={18} color="#38bdf8" /> : <Shield size={18} />}
          <span>N95 Particulate Defense: {isN95Active ? 'ACTIVE (95% DEFLECTED)' : 'OFF (UNPROTECTED)'}</span>
        </button>
      </div>

      {/* City Selector Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {CITIES.map(c => {
          const isSelected = selectedCity === c;
          const data = mockCityData[c] || { aqi: 75, pm25: 35 };
          return (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 15px',
                borderRadius: '10px',
                background: isSelected ? 'rgba(0, 245, 160, 0.18)' : 'rgba(15, 23, 42, 0.65)',
                border: `1px solid ${isSelected ? '#00f5a0' : 'rgba(255, 255, 255, 0.08)'}`,
                color: isSelected ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.82rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Compass size={14} color={isSelected ? '#00f5a0' : '#64748b'} />
              <span>{c}</span>
              <span style={{ fontSize: '0.72rem', color: isSelected ? '#00f5a0' : '#64748b' }}>
                PM2.5: {data.pm25}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Activity Profile & Exposure Duration */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '18px 24px',
        marginBottom: '20px'
      }}>
        {/* Activity Profile Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
            Physiological Activity Level
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ACTIVITIES.map(a => (
              <button
                key={a.key}
                onClick={() => setActivity(a.key)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: activity === a.key ? 'rgba(0, 245, 160, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${activity === a.key ? '#00f5a0' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: activity === a.key ? '#00f5a0' : '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: activity === a.key ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {a.label} ({a.ventilation} L/min)
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
            {activeAct.desc}
          </div>
        </div>

        {/* Exposure Duration Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Outdoor Exposure Duration
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00f5a0' }}>
              {durationMinutes} Minutes
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={120}
            step={15}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00f5a0', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
            <span>15 min</span>
            <span>30 min</span>
            <span>45 min</span>
            <span>60 min</span>
            <span>90 min</span>
            <span>120 min</span>
          </div>
        </div>
      </div>

      {/* Main 3D Simulation Canvas */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
        <BreathIQSimulator3D
          aqi={aqi}
          pm25={pm25}
          activityType={activity}
          isN95Active={isN95Active}
          height="540px"
        />

        {/* Floating Inhalation HUD Card */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            maxWidth: '320px',
            background: 'rgba(5, 26, 20, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 245, 160, 0.4)',
            borderRadius: '16px',
            padding: '16px 20px',
            color: '#f8fafc',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8' }}>
              {selectedCity} Exposure HUD
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              background: `${risk.color}22`,
              color: risk.color,
              border: `1px solid ${risk.color}55`
            }}>
              {risk.label}
            </span>
          </div>

          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
            {actualDeposition.toFixed(1)} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>µg PM2.5 Deposited</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4', marginTop: '6px' }}>
            {isN95Active
              ? `Filtered airway: Saved your lungs from ${(unprotectedDeposition - actualDeposition).toFixed(1)} µg of deep soot.`
              : `Unprotected: Particles reaching terminal alveolar sacs and capillary membranes.`}
          </div>

          {onSelectCityForDashboard && (
            <button
              onClick={() => onSelectCityForDashboard(selectedCity)}
              style={{
                width: '100%',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00f5a0, #10b981)',
                border: 'none',
                color: '#052317',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <span>Inspect {selectedCity} in Overview</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Pulmonary HUD Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f5a0', marginBottom: '6px' }}>
            <Activity size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Inhaled Air Volume</span>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f8fafc' }}>
            {totalM3Inhaled.toFixed(2)} m³
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {totalLitersInhaled.toLocaleString()} Liters ambient air inhaled
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '6px' }}>
            <Flame size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Cigarette Equivalence</span>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f8fafc' }}>
            {cigaretteEquivalence} Cigarettes
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Based on Berkeley Earth PM2.5 toxicity model
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '6px' }}>
            <ShieldCheck size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>N95 Filter Protection</span>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: isN95Active ? '#38bdf8' : '#94a3b8' }}>
            {isN95Active ? '95% Shielded' : '0% (Exposed)'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {isN95Active ? 'Bypasses alveolar capillary transfer' : 'Toggle N95 defense above to reduce burden'}
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: risk.color, marginBottom: '6px' }}>
            <HeartPulse size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Pulmonary Stress</span>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: risk.color }}>
            {risk.label}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {actualDeposition > 40 ? 'High systemic inflammation probability' : 'Within physiological clearance range'}
          </div>
        </div>
      </div>
    </div>
  );
}
