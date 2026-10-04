import React, { useState, useRef, useEffect } from 'react';
import { 
  Wind, 
  Activity, 
  MapPin, 
  BarChart2, 
  ArrowLeftRight, 
  Sparkles, 
  Bell, 
  TrendingUp, 
  FileText, 
  Server, 
  RefreshCw,
  User,
  Shield,
  LogIn,
  LogOut,
  Sliders,
  Home,
  Bot,
  Globe,
  HeartPulse,
  Trophy,
  ChevronDown,
  Layers,
  Menu,
  X
} from 'lucide-react';
import LocationSearch from './LocationSearch';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  currentCity, 
  onCityChange, 
  lastUpdated, 
  onRefresh, 
  loading,
  isApiConnected,
  viewMode = 'dashboard',
  onViewModeChange
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNavItems = [
    { key: 'dashboard', label: 'Home', icon: Home },
    { key: 'city', label: 'Air Quality', icon: Activity },
    { key: 'map', label: 'Map', icon: MapPin },
    { key: 'rankings', label: 'Rankings', icon: Trophy },
    { key: 'compare', label: 'Compare', icon: ArrowLeftRight },
    { key: 'analytics', label: 'Analytics', icon: BarChart2 },
    { key: 'forecast', label: 'Forecast', icon: Sparkles },
    { key: 'alerts', label: 'Alerts', icon: Bell },
  ];

  const moreDropdownItems = [
    { key: 'trends', label: 'Historical Analysis', icon: TrendingUp },
    { key: 'pollutants', label: 'Pollutants Guide', icon: Layers },
    { key: 'globe', label: '3D Earth Studio', icon: Globe },
    { key: 'breathiq', label: 'BreathIQ 3D Simulator', icon: HeartPulse },
    { key: 'copilot', label: 'Environmental Copilot', icon: Bot },
    { key: 'reports', label: 'Reports & Audits', icon: FileText },
    { key: 'system', label: 'System Telemetry', icon: Server },
  ];

  const handleLogout = () => {
    logout();
    onViewModeChange('login');
  };

  const handleNavigate = (key) => {
    onViewModeChange(key);
    setMoreDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isMoreActive = moreDropdownItems.some(i => i.key === viewMode);

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 90 }}>
      <div className="navbar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Left: EcoSense Logo & Brand */}
        <div 
          className="navbar-brand" 
          onClick={() => handleNavigate('dashboard')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div className="brand-icon-wrapper" style={{ background: 'linear-gradient(135deg, #00f5a0 0%, #10b981 50%, #a3e635 100%)', boxShadow: '0 0 20px rgba(0, 245, 160, 0.45)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wind size={22} style={{ color: '#052317' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 className="brand-title" style={{ letterSpacing: '0.02em', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                EcoSense
              </h1>
              <span style={{ 
                fontSize: '0.62rem', 
                fontWeight: 700, 
                color: '#10b981', 
                background: 'rgba(16, 185, 129, 0.15)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                INTELLIGENCE
              </span>
            </div>
            <p className="brand-subtitle" style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
              Know the air around you.
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <div className="navbar-nav-tabs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = viewMode === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className={`nav-tab-button ${isActive ? 'active' : ''}`}
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* More ▼ Dropdown Button */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setMoreDropdownOpen(prev => !prev)}
              className={`nav-tab-button ${isMoreActive ? 'active' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>More</span>
              <ChevronDown size={13} style={{ transform: moreDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown Menu */}
            {moreDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '240px',
                  background: 'rgba(10, 20, 16, 0.98)',
                  border: '1px solid rgba(0, 245, 160, 0.25)',
                  borderRadius: '14px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 245, 160, 0.1)',
                  backdropFilter: 'blur(20px)',
                  padding: '6px',
                  zIndex: 100
                }}
              >
                {moreDropdownItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = viewMode === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNavigate(item.key)}
                      type="button"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'rgba(0, 245, 160, 0.15)' : 'transparent',
                        color: isActive ? '#00f5a0' : '#cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Icon size={16} style={{ color: isActive ? '#00f5a0' : '#94a3b8' }} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Search Location & User Session */}
        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Header Search Location */}
          <LocationSearch 
            currentCity={currentCity}
            onCityChange={onCityChange}
            variant="compact"
            disabled={loading}
          />

          {/* Refresh Action Button */}
          <button 
            onClick={onRefresh}
            className="refresh-action-btn"
            title="Sync telemetry"
            disabled={loading}
            aria-label="Refresh telemetry"
            style={{ 
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '7px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#fff'
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>

          {/* User Account / Role / Sign-in */}
          {isAuthenticated ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              <div
                onClick={() => handleNavigate(isAdmin ? 'admin' : 'user-dashboard')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Open user portal"
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  background: isAdmin ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #00f5a0, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isAdmin ? <Shield size={14} color="#ffffff" /> : <User size={14} color="#ffffff" />}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0] || (isAdmin ? 'Admin' : 'User')}
                </span>
              </div>

              {/* Admin console button if admin */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleNavigate('admin')}
                  title="Admin Dashboard"
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#818cf8',
                    borderRadius: '6px',
                    padding: '3px 6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Admin
                </button>
              )}

              {/* Settings */}
              <button
                type="button"
                onClick={() => handleNavigate('settings')}
                title="Settings"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <Sliders size={14} />
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleNavigate('login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f1f5f9',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LogIn size={13} /> Sign In
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'none', // Handled via media query in index.css
              background: 'none',
              border: 'none',
              color: '#00f5a0',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: '64px',
            background: 'rgba(6, 12, 9, 0.98)',
            zIndex: 99,
            padding: '20px',
            overflowY: 'auto',
            borderTop: '1px solid rgba(0, 245, 160, 0.2)'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <LocationSearch 
              currentCity={currentCity}
              onCityChange={(city) => {
                onCityChange(city);
                setMobileMenuOpen(false);
              }}
              variant="banner"
            />
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Main Navigation
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: viewMode === item.key ? 'rgba(0, 245, 160, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: viewMode === item.key ? '#00f5a0' : '#f8fafc',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textAlign: 'left'
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Intelligence Modules
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {moreDropdownItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: viewMode === item.key ? 'rgba(0, 245, 160, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: viewMode === item.key ? '#00f5a0' : '#f8fafc',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textAlign: 'left'
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
