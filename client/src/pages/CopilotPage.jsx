import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Activity, 
  Wind, 
  Thermometer, 
  Droplets, 
  ShieldCheck, 
  MapPin, 
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Heart
} from 'lucide-react';
import { apiAskCopilot, fetchCityLatest } from '../services/api';

const SCENARIOS = [
  {
    icon: '🏃',
    title: 'Outdoor Running & Cycling',
    desc: 'Verify if deep aerobic workouts are safe right now or when to reschedule.',
    prompt: 'Is it safe to go for an outdoor run or cycling session in this city right now?'
  },
  {
    icon: '😷',
    title: 'Mask & Commute Safety',
    desc: 'Check if you need an N95 respirator for road transit and walking.',
    prompt: 'Do I need to wear an N95 mask outdoors today, and what are the primary risks?'
  },
  {
    icon: '👶',
    title: 'Children, Seniors & Asthma',
    desc: 'Specialized health precautions for vulnerable pulmonary systems.',
    prompt: 'What precautions should parents take for school children and elderly asthma patients today?'
  },
  {
    icon: '⚖️',
    title: 'Compare vs Delhi',
    desc: 'Side-by-side air quality and particulate comparison against the national capital.',
    prompt: 'Compare the current air quality and PM2.5 levels of this city against Delhi.'
  },
  {
    icon: '🪟',
    title: 'Home Ventilation & Purifier',
    desc: 'Determine whether to open windows or seal doors and run HEPA filtration.',
    prompt: 'Should I open my home windows today for fresh air, or keep them sealed and run an air purifier?'
  },
  {
    icon: '🔬',
    title: 'Pollutant Root Causes',
    desc: 'Understand the atmospheric physics and chemical sources of PM2.5 and NO2.',
    prompt: 'Explain what is driving the current PM2.5 and NO2 numbers in this city.'
  }
];

const CITIES = ['Hyderabad', 'Delhi', 'Chennai', 'Mumbai', 'Bengaluru'];

export default function CopilotPage({ defaultCity = 'Hyderabad' }) {
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [telemetry, setTelemetry] = useState(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🌿 Welcome to the EcoSense AI Copilot Studio!\n\nI am connected to the live monitoring stations across India. I translate real-time sensor streams (AQI, PM2.5, NO2, micro-climates) into **concrete health guidance** and **scientific insights**.\n\nSelect a scenario on the left or type your own question below!`,
      suggestions: [
        `Can I go for a jog in ${defaultCity} right now?`,
        `Do I need an N95 mask in ${defaultCity}?`,
        `Compare ${defaultCity} vs Chennai`
      ],
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load city telemetry for the sidebar card
  const loadCityTelemetry = async (city) => {
    setLoadingTelemetry(true);
    try {
      const data = await fetchCityLatest(city);
      setTelemetry(data);
    } catch (err) {
      console.warn('Telemetry load failed:', err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    loadCityTelemetry(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await apiAskCopilot(query, selectedCity);
      if (response && response.success) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.reply,
          suggestions: response.suggestions || [],
          source: response.source,
          city: response.city,
          aqi: response.aqi,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(response.error || 'Failed to generate response');
      }
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Connection Note**: I could not complete the query (${err.message}). Ensure the backend is reachable.`,
        suggestions: [`Retry query for ${selectedCity}`],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `### 🌿 Workspace Refreshed\n\nReady for new inquiries regarding **${selectedCity}**. How can I help you understand the air today?`,
        suggestions: [
          `Safe outdoor workout hours in ${selectedCity}?`,
          `Mask advice for ${selectedCity}`,
          `Compare ${selectedCity} vs Delhi`
        ],
        timestamp: 'Just now'
      }
    ]);
  };

  // Helper formatting for markdown
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ margin: '10px 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#00f5a0' }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} style={{ margin: '12px 0 6px 0', fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim().length > 0);
        if (line.includes(':---') || line.includes('---')) return null;
        return (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: '8px', fontSize: '0.82rem', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {cells.map((c, i) => (
              <span key={i} style={{ color: i === 0 ? '#cbd5e1' : '#f8fafc', fontWeight: i === 0 ? 600 : 400 }}>{c.trim()}</span>
            ))}
          </div>
        );
      }
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const textWithoutBullet = line.trim().replace(/^[\*\-]\s*/, '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', margin: '5px 0', fontSize: '0.88rem', lineHeight: 1.55, color: '#cbd5e1' }}>
            <span style={{ color: '#00f5a0' }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(textWithoutBullet) }} />
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '8px' }} />;
      }
      return (
        <p key={idx} style={{ margin: '5px 0', fontSize: '0.88rem', lineHeight: 1.6, color: '#e2e8f0' }}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    });
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff;font-weight:700">$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;font-size:0.8rem;color:#00f5a0">$1</code>');
  };

  const getAqiBadgeColor = (val) => {
    const a = Number(val) || 0;
    if (a <= 50) return '#10b981';
    if (a <= 100) return '#fbbf24';
    if (a <= 150) return '#f97316';
    if (a <= 200) return '#ef4444';
    return '#881337';
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#042416',
            boxShadow: '0 0 20px rgba(0, 245, 160, 0.4)'
          }}>
            <Bot size={28} color="#042416" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                EcoSense AI Copilot
              </h1>
              <span style={{
                background: 'rgba(0, 245, 160, 0.15)',
                border: '1px solid rgba(0, 245, 160, 0.35)',
                color: '#00f5a0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                ATMOSPHERIC REASONING
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Conversational intelligence grounded in real-time sensor streams and World Health Organization benchmarks.
            </p>
          </div>
        </div>

        {/* City Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(12, 24, 18, 0.8)',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          padding: '8px 16px',
          borderRadius: '14px'
        }}>
          <MapPin size={16} color="#00f5a0" />
          <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500 }}>Target Station:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00f5a0',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {CITIES.map(c => (
              <option key={c} value={c} style={{ background: '#08100c', color: '#f8fafc' }}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Dual-Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* ============================================================
            LEFT COLUMN: SENSOR TELEMETRY & PRESET SCENARIO CARDS
            ============================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Station Readout Card */}
          <div style={{
            background: 'rgba(12, 24, 18, 0.8)',
            border: '1px solid rgba(0, 245, 160, 0.2)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', fontWeight: 600 }}>
                Live Station Grounding
              </span>
              <span style={{
                fontSize: '0.72rem',
                color: '#00f5a0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}>
                <Activity size={12} /> Active Telemetry
              </span>
            </div>

            {telemetry ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                  <span style={{
                    fontSize: '3.2rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: getAqiBadgeColor(telemetry.aqi)
                  }}>
                    {telemetry.aqi}
                  </span>
                  <div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: `${getAqiBadgeColor(telemetry.aqi)}22`,
                      color: getAqiBadgeColor(telemetry.aqi),
                      border: `1px solid ${getAqiBadgeColor(telemetry.aqi)}55`
                    }}>
                      {telemetry.aqi <= 50 ? 'GOOD' : telemetry.aqi <= 100 ? 'MODERATE' : 'UNHEALTHY'}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                      Composite AQI Index
                    </div>
                  </div>
                </div>

                {/* Metric Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>PM2.5 Particles</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                      {telemetry.pm25} <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>µg/m³</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>PM10 Coarse</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                      {telemetry.pm10} <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>µg/m³</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Temperature</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                      {telemetry.temperature}°C
                    </div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Wind Velocity</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                      {telemetry.windSpeed || telemetry.wind_speed} <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Fetching station readings...
              </div>
            )}
          </div>

          {/* Preset Scenario Cards */}
          <div style={{
            background: 'rgba(12, 24, 18, 0.8)',
            border: '1px solid rgba(0, 245, 160, 0.2)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 14px 0', color: '#f8fafc' }}>
              Quick Environmental Scenarios
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SCENARIOS.map((sc, i) => (
                <div
                  key={i}
                  onClick={() => handleSendMessage(sc.prompt)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.4)';
                    e.currentTarget.style.background = 'rgba(0, 245, 160, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '1rem' }}>{sc.icon}</span>
                    <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{sc.title}</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {sc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT COLUMN: CONVERSATION DIALOGUE CONSOLE
            ============================================================ */}
        <div style={{
          background: 'rgba(8, 16, 12, 0.88)',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          height: '740px',
          overflow: 'hidden'
        }}>
          {/* Console Header */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(12, 24, 18, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 245, 160, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f5a0'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                  Atmospheric Dialogue Stream
                </span>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Grounded in {selectedCity} telemetry • Instant Response
                </div>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={13} /> Reset Stream
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div style={{
                    maxWidth: '82%',
                    padding: '14px 18px',
                    borderRadius: isUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    background: isUser
                      ? 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)'
                      : 'rgba(12, 24, 18, 0.85)',
                    border: isUser
                      ? 'none'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isUser ? '#042416' : '#f8fafc',
                    boxShadow: isUser
                      ? '0 4px 16px rgba(0, 245, 160, 0.35)'
                      : '0 4px 16px rgba(0, 0, 0, 0.3)',
                    fontSize: '0.88rem'
                  }}>
                    {isUser ? (
                      <div style={{ fontWeight: 700 }}>{msg.text}</div>
                    ) : (
                      <div>{renderFormattedText(msg.text)}</div>
                    )}
                  </div>

                  {/* Message Meta */}
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#64748b',
                    marginTop: '5px',
                    padding: '0 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {msg.timestamp}
                    {msg.source && <span>• {msg.source}</span>}
                  </div>

                  {/* Suggestion Chips */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '10px',
                      maxWidth: '85%'
                    }}>
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          style={{
                            background: 'rgba(0, 245, 160, 0.08)',
                            border: '1px solid rgba(0, 245, 160, 0.25)',
                            color: '#00f5a0',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 245, 160, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 245, 160, 0.08)'}
                        >
                          <span>{sug}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking status */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00f5a0', fontSize: '0.85rem', padding: '10px 0' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(0, 245, 160, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={18} />
                </div>
                <span>Analyzing real-time pollutants & running atmospheric models...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Console Input Footer */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(12, 24, 18, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask Copilot anything about ${selectedCity}'s air, workout safety, or pollution trends...`}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '14px',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00f5a0'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                style={{
                  padding: '12px 22px',
                  borderRadius: '14px',
                  background: inputValue.trim()
                    ? 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: inputValue.trim() ? '#042416' : '#64748b',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: inputValue.trim() ? 'pointer' : 'default',
                  boxShadow: inputValue.trim() ? '0 4px 16px rgba(0, 245, 160, 0.4)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                <span>Send</span>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
