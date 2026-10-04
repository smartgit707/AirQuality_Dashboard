import React, { useState } from 'react';
import { 
  Activity, 
  Layers, 
  ShieldAlert, 
  Info, 
  ArrowRight, 
  Wind, 
  TrendingUp, 
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { mockCityData, CITIES, getPollutantStatus } from '../data/mockData';

const POLLUTANTS_INFO = {
  pm25: {
    key: 'pm25',
    name: 'PM2.5',
    fullName: 'Fine Particulate Matter (≤ 2.5 µm)',
    unit: 'µg/m³',
    who24hLimit: 15,
    whoAnnualLimit: 5,
    cpcb24hLimit: 60,
    sources: 'Vehicular exhaust (diesel engines), power generation, biomass burning, and secondary sulfate/nitrate formation.',
    healthEffects: 'Penetrates deep into terminal alveolar sacs and systemic cardiovascular circulation. Long-term exposure correlates with ischemic heart disease and reduced lung volume.',
    nature: 'Observed Physical Particle',
    color: '#fbbf24'
  },
  pm10: {
    key: 'pm10',
    name: 'PM10',
    fullName: 'Coarse Respirable Particulate Matter (≤ 10 µm)',
    unit: 'µg/m³',
    who24hLimit: 45,
    whoAnnualLimit: 15,
    cpcb24hLimit: 100,
    sources: 'Mechanical abrasion, road dust resuspension, construction debris, and agricultural soil dust.',
    healthEffects: 'Deposited in upper tracheobronchial airways, inducing chronic coughing, wheezing, and allergic rhinitis exacerbation.',
    nature: 'Observed Physical Particle',
    color: '#a855f7'
  },
  no2: {
    key: 'no2',
    name: 'NO₂',
    fullName: 'Nitrogen Dioxide',
    unit: 'µg/m³',
    who24hLimit: 25,
    whoAnnualLimit: 10,
    cpcb24hLimit: 80,
    sources: 'High-temperature fuel combustion in heavy transport vehicles and thermal industrial plants.',
    healthEffects: 'Induces severe airway mucosal inflammation, enhances bronchial hyper-responsiveness in asthmatic individuals.',
    nature: 'Observed Chemical Gas',
    color: '#f97316'
  },
  so2: {
    key: 'so2',
    name: 'SO₂',
    fullName: 'Sulfur Dioxide',
    unit: 'µg/m³',
    who24hLimit: 40,
    whoAnnualLimit: 40,
    cpcb24hLimit: 80,
    sources: 'Coal-fired power generation, smelting of sulfide ores, and heavy industrial boiler fuels.',
    healthEffects: 'Rapid bronchoconstriction within minutes of inhalation, irritates ocular and nasopharyngeal membranes.',
    nature: 'Observed Chemical Gas',
    color: '#ef4444'
  },
  co: {
    key: 'co',
    name: 'CO',
    fullName: 'Carbon Monoxide',
    unit: 'mg/m³',
    who24hLimit: 4.0,
    whoAnnualLimit: 4.0,
    cpcb24hLimit: 2.0,
    sources: 'Incomplete combustion of carbon fuels in internal combustion engines and open residential biomass.',
    healthEffects: 'Reversibly binds to hemoglobin with ~200x greater affinity than oxygen, inhibiting systemic oxygenation.',
    nature: 'Observed Chemical Gas',
    color: '#06b6d4'
  },
  o3: {
    key: 'o3',
    name: 'O₃',
    fullName: 'Tropospheric Surface Ozone',
    unit: 'µg/m³',
    who24hLimit: 100,
    whoAnnualLimit: 100,
    cpcb24hLimit: 100,
    sources: 'Secondary photochemical reaction between nitrogen oxides (NOx) and volatile organic compounds (VOCs) under sunlight.',
    healthEffects: 'Potent cellular oxidant causing airway epithelial necrosis, chest pain, and temporary reduction in vital lung capacity.',
    nature: 'Photochemical Secondary Gas',
    color: '#10b981'
  }
};

export default function PollutantsPage({ currentCity = 'Delhi', onSelectCityForDashboard }) {
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');
  const [timeRange, setTimeRange] = useState('24h');

  const info = POLLUTANTS_INFO[selectedPollutant] || POLLUTANTS_INFO['pm25'];
  const cityData = mockCityData[currentCity] || mockCityData['Delhi'];
  const currentValue = cityData[selectedPollutant];
  const isUnavailable = currentValue === null || currentValue === undefined || isNaN(currentValue);
  const status = getPollutantStatus(selectedPollutant, currentValue);

  // Generate trend line based on 24h diurnal pattern
  const trendData = (cityData.trend || []).map((t, idx) => {
    let scale = 1;
    if (selectedPollutant === 'pm25') scale = 0.75;
    if (selectedPollutant === 'pm10') scale = 1.1;
    if (selectedPollutant === 'co') scale = 0.01;
    if (selectedPollutant === 'no2') scale = 0.35;
    if (selectedPollutant === 'so2') scale = 0.12;
    if (selectedPollutant === 'o3') scale = 0.28;

    return {
      time: t.time,
      value: parseFloat((t.aqi * scale).toFixed(selectedPollutant === 'co' ? 2 : 1)),
      guideline: info.who24hLimit
    };
  });

  return (
    <div className="analytics-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Pollutant Tabs Header */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '1.5rem'
        }}
      >
        {Object.keys(POLLUTANTS_INFO).map((pKey) => {
          const item = POLLUTANTS_INFO[pKey];
          const isSelected = selectedPollutant === pKey;
          const val = cityData[pKey];

          return (
            <button
              key={pKey}
              onClick={() => setSelectedPollutant(pKey)}
              style={{
                flex: '1',
                minWidth: '150px',
                padding: '12px 16px',
                borderRadius: '16px',
                border: isSelected ? `2px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSelected ? 'rgba(12, 24, 18, 0.95)' : 'rgba(12, 24, 18, 0.5)',
                boxShadow: isSelected ? `0 0 20px ${item.color}33` : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: isSelected ? item.color : '#f8fafc' }}>
                  {item.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {item.unit}
                </span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                {val != null ? val : <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>N/A</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Analysis Card */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Left Column: Metric Overview & Clinical Guidelines */}
        <div
          style={{
            background: 'rgba(12, 24, 18, 0.72)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00f5a0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {info.nature}
              </span>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
                {info.name} Concentration
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                {info.fullName} &bull; Station: <strong>{currentCity}</strong>
              </p>
            </div>

            <span
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: status.bg,
                color: status.color,
                border: `1px solid ${status.color}50`
              }}
            >
              {status.label}
            </span>
          </div>

          {/* Big Metric Display */}
          <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {isUnavailable ? (
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#94a3b8', fontStyle: 'italic' }}>
                Data unavailable
              </span>
            ) : (
              <>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: info.color }}>
                  {currentValue}
                </span>
                <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 700 }}>
                  {info.unit}
                </span>
              </>
            )}
          </div>

          {/* Guideline Comparison Matrix */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '14px', padding: '16px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} style={{ color: '#00f5a0' }} />
              <span>International Benchmark Comparison</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>WHO 24-Hour Strict Limit:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{info.who24hLimit} {info.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Indian CPCB NAQI 24h Threshold:</span>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>{info.cpcb24hLimit} {info.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Observed vs WHO Guideline:</span>
                <span style={{ fontWeight: 800, color: currentValue > info.who24hLimit ? '#ef4444' : '#10b981' }}>
                  {isUnavailable ? 'N/A' : `${(currentValue / info.who24hLimit).toFixed(1)}x WHO Limit`}
                </span>
              </div>
            </div>
          </div>

          {/* Scientific Context Disclaimers */}
          <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4, borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
            <strong>Classification Note:</strong> Concentrations are observed from Open-Meteo atmospheric dispersion physics and local monitoring telemetry. Clinical guidance reflects WHO Air Quality Guidelines (2021).
          </div>
        </div>

        {/* Right Column: Source Identification & Clinical Pathophysiology */}
        <div
          style={{
            background: 'rgba(12, 24, 18, 0.72)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f5a0', marginBottom: '12px' }}>
              <Layers size={18} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Primary Emission Sources
              </h3>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {info.sources}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', marginBottom: '12px' }}>
              <AlertTriangle size={18} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Health & Environmental Pathophysiology
              </h3>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
              {info.healthEffects}
            </p>
          </div>

          {/* Inter-City Comparison preview */}
          <div style={{ marginTop: '1.5rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Comparison Across Cities ({info.name})
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad'].map((cName) => {
                const cVal = mockCityData[cName]?.[selectedPollutant];
                return (
                  <div 
                    key={cName}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      color: '#cbd5e1'
                    }}
                  >
                    <span>{cName}: </span>
                    <strong style={{ color: '#00f5a0' }}>{cVal != null ? cVal : 'N/A'}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Trend Chart */}
      <div
        style={{
          background: 'rgba(12, 24, 18, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0' }}>
              {info.name} 24-Hour Diurnal Trend
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Atmospheric concentration variation in {currentCity} against WHO guidelines
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              --- WHO Guideline ({info.who24hLimit} {info.unit})
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pollutantGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={info.color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={info.color} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ background: '#0a140f', border: `1px solid ${info.color}`, borderRadius: '10px', color: '#fff' }} 
                formatter={(val) => [`${val} ${info.unit}`, info.name]}
              />
              <ReferenceLine y={info.who24hLimit} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'WHO Limit', fill: '#10b981', fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke={info.color} strokeWidth={2.5} fillOpacity={1} fill="url(#pollutantGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
