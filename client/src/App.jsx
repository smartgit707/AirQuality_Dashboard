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
import { fetchCityLatest, fetchCityHistory, refreshCityTelemetry } from './services/api';

export default function App() {
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [dashboardData, setDashboardData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Just now');

  // Load telemetry from Express backend API
  const loadCityData = useCallback(async (city, isRefresh = false) => {
    setLoading(true);
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

      setDashboardData(latest);
      setHistoryData(history || []);
      setIsApiConnected(true);
      setIsDbConnected(Boolean(latest.dbConnected));
      setLastRefreshedAt(isRefresh ? 'Just now' : (latest.lastUpdated || 'Just now'));
      setError(null);
    } catch (err) {
      console.warn(`[API] Telemetry fetch issue for ${city}:`, err.message);
      setIsApiConnected(false);
      setIsDbConnected(false);
      setError("Unable to fetch the latest environmental data. Please check connection.");
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
    if (loading) return; // Prevent duplicate requests
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
        {viewMode === 'dashboard' && (
          <Dashboard 
            data={dashboardData}
            historyData={historyData}
            currentCity={selectedCity}
            loading={loading}
            error={error}
            isApiConnected={isApiConnected}
            isDbConnected={isDbConnected}
            onRetry={handleRefresh}
          />
        )}

        {viewMode === 'map' && (
          <MapPage onSelectCityForDashboard={handleSelectCityFromMap} />
        )}

        {viewMode === 'analytics' && (
          <AnalyticsPage defaultCity={selectedCity} />
        )}

        {viewMode === 'compare' && (
          <ComparePage />
        )}

        {viewMode === 'forecast' && (
          <ForecastPage defaultCity={selectedCity} />
        )}

        {viewMode === 'alerts' && (
          <AlertsPage />
        )}

        {viewMode === 'trends' && (
          <TrendsPage defaultCity={selectedCity} />
        )}

        {viewMode === 'reports' && (
          <ReportsPage defaultCity={selectedCity} />
        )}

        {viewMode === 'system' && (
          <SystemStatusPage />
        )}
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
            <span className="footer-tag">Interactive Map</span>
            <span className="footer-tag">Diurnal Forecasting</span>
            <span className="footer-tag">Automated Collector</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
