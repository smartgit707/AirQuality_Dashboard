import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CityComparison from './components/CityComparison';
import { fetchCityLatest, fetchCityHistory } from './services/api';

export default function App() {
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'compare'
  const [selectedCity, setSelectedCity] = useState('Chennai');
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
      setError("Unable to fetch the latest environmental data. Please try again.");
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
    if (loading) return; // Prevent accidental duplicate requests during refresh
    loadCityData(selectedCity, true);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
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

      {/* Main View: Single City Dashboard vs Dual City Comparison */}
      {viewMode === 'compare' ? (
        <main className="dashboard-container">
          <CityComparison defaultCity1="Delhi" defaultCity2="Bengaluru" />
        </main>
      ) : (
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

      {/* Presentation Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div>
            <strong>Air Quality and Environment Monitoring Dashboard</strong> &mdash; Dual City Comparison & Real Data Pipeline
          </div>
          <div className="footer-tags">
            <span className="footer-tag">City Comparison Mode</span>
            <span className="footer-tag">Open-Meteo Live API</span>
            <span className="footer-tag">PostgreSQL Stored Records</span>
            <span className="footer-tag">React 18 & Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
