import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ComparePage from './pages/ComparePage';
import ForecastPage from './pages/ForecastPage';
import AlertsPage from './pages/AlertsPage';
import TrendsPage from './pages/TrendsPage';
import ReportsPage from './pages/ReportsPage';
import SystemStatusPage from './pages/SystemStatusPage';
import CopilotPage from './pages/CopilotPage';
import CopilotWidget from './components/CopilotWidget';
import GlobePage from './pages/GlobePage';
import BreathIQPage from './pages/BreathIQPage';

// Auth & User Portal Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import MyEnvironmentPage from './pages/MyEnvironmentPage';
import SettingsPage from './pages/SettingsPage';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCitiesPage from './pages/admin/AdminCitiesPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminDataPage from './pages/admin/AdminDataPage';
import AdminSystemPage from './pages/admin/AdminSystemPage';

import { useAuth } from './context/AuthContext';
import { fetchCityLatest, fetchCityHistory, refreshCityTelemetry } from './services/api';
import { mockCityData } from './data/mockData';

export default function App() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [dashboardData, setDashboardData] = useState(() => mockCityData['Delhi'] || null);
  const [historyData, setHistoryData] = useState(() => mockCityData['Delhi']?.trend || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isApiConnected, setIsApiConnected] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Live Telemetry');

  // Load telemetry from Express backend API
  const loadCityData = useCallback(async (city, isRefresh = false) => {
    if (isRefresh) setLoading(true);
    setError(null);

    try {
      if (isRefresh) {
        await refreshCityTelemetry(city);
      }

      // Concurrently query latest metrics and historical records from Express API
      const [latest, history] = await Promise.all([
        fetchCityLatest(city),
        fetchCityHistory(city)
      ]);

      if (latest) {
        setDashboardData(latest);
        setHistoryData(history || latest.trend || []);
        setIsApiConnected(true);
        setIsDbConnected(Boolean(latest.dbConnected));
        setLastRefreshedAt(isRefresh ? 'Just now' : (latest.lastUpdated || 'Just now'));
        setError(null);
      }
    } catch (err) {
      console.warn(`[API] Telemetry fetch issue for ${city}:`, err.message);
      const fallback = mockCityData[city] || mockCityData['Delhi'];
      setDashboardData({
        ...fallback,
        isLive: false,
        source: 'EcoSense Resilient Mode',
        lastUpdated: 'Live Simulation'
      });
      setHistoryData(fallback.trend || []);
      setIsApiConnected(false);
      setIsDbConnected(false);
      setLastRefreshedAt('Live Simulation');
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on component mount
  useEffect(() => {
    loadCityData(selectedCity, false);
  }, []);

  // Handle location dropdown change
  const handleCityChange = (newCity) => {
    if (loading) return;
    setSelectedCity(newCity);
    loadCityData(newCity, false);
  };

  // Handle refresh action button
  const handleRefresh = () => {
    if (loading) return;
    loadCityData(selectedCity, true);
  };

  // Handler for jumping from Map pin to Dashboard
  const handleSelectCityFromMap = (targetCity) => {
    setSelectedCity(targetCity);
    loadCityData(targetCity, false);
    setViewMode('dashboard');
  };

  // Route Guarding Helper
  const renderCurrentView = () => {
    // 1. Authentication Pages
    if (viewMode === 'login') {
      return <LoginPage onNavigate={setViewMode} />;
    }
    if (viewMode === 'register') {
      return <RegisterPage onNavigate={setViewMode} />;
    }

    // 2. User Protected Views
    if (viewMode === 'user-dashboard') {
      if (!isAuthenticated) return <LoginPage onNavigate={setViewMode} />;
      return <UserDashboard onNavigate={setViewMode} onSelectCity={handleCityChange} />;
    }
    if (viewMode === 'my-environment') {
      if (!isAuthenticated) return <LoginPage onNavigate={setViewMode} />;
      return <MyEnvironmentPage onNavigate={setViewMode} />;
    }
    if (viewMode === 'settings') {
      if (!isAuthenticated) return <LoginPage onNavigate={setViewMode} />;
      return <SettingsPage />;
    }

    // 3. Admin Protected Views
    if (viewMode.startsWith('admin')) {
      if (!isAuthenticated) return <LoginPage onNavigate={setViewMode} />;
      if (!isAdmin) {
        return (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#f8fafc' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#ef4444', marginBottom: '10px' }}>403 — Unauthorized Access</h2>
            <p style={{ color: '#94a3b8', maxWidth: '480px', margin: '0 auto 24px auto' }}>
              Administrative privileges are required to view this console. Your current role is <strong>{user?.role}</strong>.
            </p>
            <button
              onClick={() => setViewMode('dashboard')}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Return to Public Dashboard
            </button>
          </div>
        );
      }

      if (viewMode === 'admin') return <AdminDashboard onNavigateAdmin={setViewMode} />;
      if (viewMode === 'admin-users') return <AdminUsersPage onBack={() => setViewMode('admin')} />;
      if (viewMode === 'admin-cities') return <AdminCitiesPage onBack={() => setViewMode('admin')} />;
      if (viewMode === 'admin-alerts') return <AdminAlertsPage onBack={() => setViewMode('admin')} />;
      if (viewMode === 'admin-data') return <AdminDataPage onBack={() => setViewMode('admin')} />;
      if (viewMode === 'admin-system') return <AdminSystemPage onBack={() => setViewMode('admin')} />;
    }

    // 4. Public Environmental Views
    if (viewMode === 'breathiq') {
      return <BreathIQPage onSelectCityForDashboard={handleSelectCityFromMap} />;
    }
    if (viewMode === 'copilot') {
      return <CopilotPage defaultCity={selectedCity} />;
    }
    if (viewMode === 'globe') {
      return <GlobePage onSelectCityForDashboard={handleSelectCityFromMap} />;
    }
    if (viewMode === 'map') {
      return <MapPage onSelectCityForDashboard={handleSelectCityFromMap} />;
    }
    if (viewMode === 'analytics') {
      return <AnalyticsPage defaultCity={selectedCity} />;
    }
    if (viewMode === 'compare') {
      return <ComparePage />;
    }
    if (viewMode === 'forecast') {
      return <ForecastPage defaultCity={selectedCity} />;
    }
    if (viewMode === 'alerts') {
      return <AlertsPage />;
    }
    if (viewMode === 'trends') {
      return <TrendsPage defaultCity={selectedCity} />;
    }
    if (viewMode === 'reports') {
      return <ReportsPage defaultCity={selectedCity} />;
    }
    if (viewMode === 'system') {
      return <SystemStatusPage />;
    }

    // Default Overview
    return (
      <Dashboard 
        data={dashboardData}
        historyData={historyData}
        currentCity={selectedCity}
        loading={loading}
        error={error}
        isApiConnected={isApiConnected}
        isDbConnected={isDbConnected}
        onRetry={handleRefresh}
        onNavigate={setViewMode}
      />
    );
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar with EcoSense Branding & Modules */}
      <Navbar
        currentCity={selectedCity}
        onCityChange={handleCityChange}
        lastUpdated={lastRefreshedAt}
        onRefresh={handleRefresh}
        loading={loading}
        isApiConnected={isApiConnected}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main View Router */}
      <main className="main-content-area">
        {renderCurrentView()}
      </main>

      {/* Presentation Footer */}
      <footer className="dashboard-footer no-print">
        <div className="footer-content">
          <div>
            <strong>EcoSense</strong> &mdash; Intelligent Air Quality & Environmental Monitoring Platform
          </div>
          <div className="footer-tags">
            <span className="footer-tag">Open-Meteo API</span>
            <span className="footer-tag">Express Backend</span>
            <span className="footer-tag">PostgreSQL Records</span>
            <span className="footer-tag">AI Copilot</span>
            <span className="footer-tag">Interactive Map</span>
            <span className="footer-tag">Diurnal Forecasting</span>
            <span className="footer-tag">Automated Collector</span>
          </div>
        </div>
      </footer>

      {/* Global Floating AI Copilot Assistant */}
      <CopilotWidget 
        currentCity={selectedCity} 
        onOpenFullPage={() => setViewMode('copilot')} 
      />
    </div>
  );
}
