import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Trash2, 
  Activity, 
  Wind, 
  ShieldCheck, 
  MapPin, 
  ArrowRight,
  Info
} from 'lucide-react';
import { apiAskCopilot } from '../services/api';

const QUICK_PROMPTS = [
  { text: "🏃 Can I go for a run outside right now?", label: "Running Safety" },
  { text: "😷 Do I need to wear an N95 mask today?", label: "Mask Advisory" },
  { text: "⚖️ Compare this city with Delhi", label: "City Comparison" },
  { text: "🔬 What are the main sources of PM2.5 here?", label: "Pollution Sources" }
];

const CITIES = ['Hyderabad', 'Delhi', 'Chennai', 'Mumbai', 'Bengaluru'];

export default function CopilotWidget({ currentCity = 'Hyderabad', onOpenFullPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `### 🌿 Welcome to EcoSense AI Copilot!\n\nI am your atmospheric intelligence assistant, grounded directly in **real-time sensor telemetry** across Indian metropolitan monitoring stations.\n\nAsk me about **workout timing**, **mask advisories**, **city comparisons**, or **sensitive demographic precautions**!`,
      suggestions: [
        `Can I jog outside in ${currentCity} right now?`,
        `Do I need a mask in ${currentCity}?`,
        `Compare ${currentCity} vs Delhi`
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync city when prop changes
  useEffect(() => {
    if (currentCity) {
      setSelectedCity(currentCity);
    }
  }, [currentCity]);

  // Scroll to bottom on message update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, loading]);

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
        throw new Error(response.error || 'Failed to fetch response');
      }
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Connection Note**: I was unable to retrieve live telemetry data right now (${err.message}). Please verify that your EcoSense backend is running.`,
        suggestions: [`Retry asking about ${selectedCity}`],
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
        text: `### 🌿 Conversation Reset\n\nI am ready with live readings for **${selectedCity}**. What would you like to explore?`,
        suggestions: [
          `Safe outdoor times in ${selectedCity}?`,
          `Mask advice for ${selectedCity}`,
          `Compare ${selectedCity} vs Chennai`
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Simple Markdown renderer helper for bold, lists, and headings
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Headings
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ margin: '8px 0 6px 0', fontSize: '0.98rem', fontWeight: 700, color: '#00f5a0' }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} style={{ margin: '10px 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>{line.replace('## ', '')}</h3>;
      }
      // Table rows (simple rendering)
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim().length > 0);
        if (line.includes(':---') || line.includes('---')) return null;
        return (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: '6px', fontSize: '0.78rem', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {cells.map((c, i) => (
              <span key={i} style={{ color: i === 0 ? '#cbd5e1' : '#f8fafc', fontWeight: i === 0 ? 600 : 400 }}>{c.trim()}</span>
            ))}
          </div>
        );
      }
      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const textWithoutBullet = line.trim().replace(/^[\*\-]\s*/, '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '6px', margin: '4px 0', fontSize: '0.84rem', lineHeight: 1.5, color: '#cbd5e1' }}>
            <span style={{ color: '#00f5a0' }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(textWithoutBullet) }} />
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '6px' }} />;
      }
      // Regular paragraph
      return (
        <p key={idx} style={{ margin: '4px 0', fontSize: '0.84rem', lineHeight: 1.55, color: '#e2e8f0' }}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    });
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff;font-weight:700">$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.4);padding:2px 5px;border-radius:4px;font-size:0.78rem;color:#00f5a0">$1</code>');
  };

  return (
    <>
      {/* ============================================================
          FLOATING LAUNCHER BUTTON (ALWAYS ACCESSIBLE BOTTOM-RIGHT)
          ============================================================ */}
      {!isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Subtle Callout Badge */}
          <div 
            onClick={() => setIsOpen(true)}
            style={{
              cursor: 'pointer',
              background: 'rgba(12, 24, 18, 0.92)',
              border: '1px solid rgba(0, 245, 160, 0.3)',
              backdropFilter: 'blur(12px)',
              padding: '8px 14px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              color: '#f8fafc',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="copilot-callout"
          >
            <Sparkles size={14} color="#00f5a0" />
            <span>Ask EcoSense Copilot</span>
          </div>

          {/* Glowing Pulse Button */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open EcoSense AI Copilot"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              color: '#042416',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 245, 160, 0.45), 0 0 0 1px rgba(0, 245, 160, 0.2)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Bot size={28} color="#042416" />
          </button>
        </div>
      )}

      {/* ============================================================
          EXPANDABLE CHAT DRAWER / WINDOW
          ============================================================ */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          height: isMinimized ? '64px' : '620px',
          maxHeight: 'calc(100vh - 48px)',
          background: 'rgba(8, 16, 12, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 245, 160, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 245, 160, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          overflow: 'hidden',
          transition: 'height 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'rgba(12, 24, 18, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#042416',
                boxShadow: '0 0 12px rgba(0, 245, 160, 0.4)'
              }}>
                <Bot size={20} color="#042416" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.01em' }}>
                    EcoSense Copilot
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(0, 245, 160, 0.15)',
                    color: '#00f5a0',
                    border: '1px solid rgba(0, 245, 160, 0.3)'
                  }}>
                    LIVE SENSOR AI
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={11} color="#00f5a0" />
                  <span>Context: </span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#00f5a0',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      outline: 'none',
                      padding: 0
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
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleClearChat}
                title="Clear Conversation"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Trash2 size={16} />
              </button>
              {onOpenFullPage && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullPage();
                  }}
                  title="Expand to Fullscreen View"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Maximize2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Restore" : "Minimize"}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Telemetry Strip */}
              <div style={{
                padding: '6px 14px',
                background: 'rgba(0, 245, 160, 0.08)',
                borderBottom: '1px solid rgba(0, 245, 160, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#cbd5e1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={12} color="#00f5a0" />
                  <span>Real-time grounding active for <strong>{selectedCity}</strong></span>
                </div>
                <span style={{ color: '#00f5a0', fontWeight: 600 }}>Zero Hallucination Mode</span>
              </div>

              {/* Message List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {/* Quick Prompts Row (if 1 or 2 messages) */}
                {messages.length <= 2 && (
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Suggested Inquiries
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {QUICK_PROMPTS.map((qp, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(qp.text)}
                          style={{
                            background: 'rgba(12, 24, 18, 0.75)',
                            border: '1px solid rgba(0, 245, 160, 0.25)',
                            color: '#cbd5e1',
                            borderRadius: '999px',
                            padding: '5px 11px',
                            fontSize: '0.74rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#00f5a0';
                            e.currentTarget.style.color = '#00f5a0';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.25)';
                            e.currentTarget.style.color = '#cbd5e1';
                          }}
                        >
                          {qp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
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
                        maxWidth: '88%',
                        padding: '12px 14px',
                        borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isUser
                          ? 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)'
                          : 'rgba(12, 24, 18, 0.85)',
                        border: isUser
                          ? 'none'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isUser ? '#042416' : '#f8fafc',
                        boxShadow: isUser
                          ? '0 4px 14px rgba(0, 245, 160, 0.3)'
                          : '0 4px 14px rgba(0, 0, 0, 0.3)',
                        fontSize: '0.85rem'
                      }}>
                        {isUser ? (
                          <div style={{ fontWeight: 600 }}>{msg.text}</div>
                        ) : (
                          <div>{renderFormattedText(msg.text)}</div>
                        )}
                      </div>

                      {/* Source or Timestamp */}
                      <div style={{
                        fontSize: '0.68rem',
                        color: '#64748b',
                        marginTop: '4px',
                        padding: '0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {msg.timestamp}
                        {msg.source && (
                          <span>• {msg.source}</span>
                        )}
                      </div>

                      {/* AI Follow-up Suggestion Chips */}
                      {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginTop: '8px',
                          maxWidth: '90%'
                        }}>
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug)}
                              style={{
                                background: 'rgba(0, 245, 160, 0.1)',
                                border: '1px solid rgba(0, 245, 160, 0.25)',
                                color: '#00f5a0',
                                padding: '4px 9px',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.15s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 245, 160, 0.2)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 245, 160, 0.1)'}
                            >
                              <span>{sug}</span>
                              <ArrowRight size={11} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f5a0', fontSize: '0.8rem', padding: '8px 0' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(0, 245, 160, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Bot size={16} />
                    </div>
                    <span>Analyzing sensor streams & atmospheric models...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(12, 24, 18, 0.98)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ask about ${selectedCity}'s air or health safety...`}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00f5a0'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: inputValue.trim()
                        ? 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: inputValue.trim() ? '#042416' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: inputValue.trim() ? 'pointer' : 'default',
                      boxShadow: inputValue.trim() ? '0 4px 12px rgba(0, 245, 160, 0.35)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
