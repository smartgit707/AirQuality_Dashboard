import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { fetchCityLatest, fetchCityHistory } from './services/api';
import { mockCityData } from './data/mockData';

export default function App() {
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
      setHistoryData(history);
      setIsApiConnected(true);
      setIsDbConnected(Boolean(latest.dbConnected));
      setLastRefreshedAt(isRefresh ? 'Just now' : (latest.lastUpdated || 'Just now'));
      setError(null);
    } catch (err) {
      console.warn(`[API] Telemetry fetch issue for ${city}:`, err.message);
      setIsApiConnected(false);
      setIsDbConnected(false);
      setError(`Database/API Notice: ${err.message}. Using offline telemetry view.`);
      
      // Fallback to client mock data so dashboard remains interactive
      const fallback = mockCityData[city] || mockCityData['Chennai'];
      setDashboardData(fallback);
      setHistoryData(fallback.trend || []);
      setLastRefreshedAt('Just now (Cached)');
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
    setSelectedCity(newCity);
    loadCityData(newCity, false);
  };

  // Handle refresh action button
  const handleRefresh = () => {
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
      />

      {/* Main Dashboard Body */}
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

      {/* Presentation Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div>
            <strong>Air Quality and Environment Monitoring Dashboard</strong> &mdash; Full Stack College Project (Phase 3: React &rarr; Express &rarr; PostgreSQL)
          </div>
          <div className="footer-tags">
            <span className="footer-tag">React 18</span>
            <span className="footer-tag">Express.js API</span>
            <span className="footer-tag">PostgreSQL Records</span>
            <span className="footer-tag">Recharts 2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
