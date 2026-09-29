import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { mockCityData } from './data/mockData';

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Just now');

  // Fetch city data through Express backend API
  const loadCityData = useCallback(async (city, isRefresh = false) => {
    setLoading(true);
    try {
      // Primary call to Express backend API (Port 5001 with CORS)
      let response;
      try {
        response = await fetch(`http://localhost:5001/api/air-quality/${encodeURIComponent(city)}`);
      } catch (networkErr) {
        // Vite proxy fallback
        response = await fetch(`/api/air-quality/${encodeURIComponent(city)}`);
      }

      if (response && response.ok) {
        const json = await response.json();
        const cityData = json.data || json;
        if (cityData && cityData.city) {
          setDashboardData(cityData);
          setIsApiConnected(true);
          const updateText = isRefresh ? 'Just now' : (cityData.lastUpdated || 'Just now');
          setLastRefreshedAt(updateText);
          setLoading(false);
          return;
        }
      }
      throw new Error('API response invalid or backend unavailable');
    } catch (err) {
      console.warn(`Backend API unreachable. Falling back to local mock data for ${city}:`, err.message);
      setIsApiConnected(false);
      const fallback = mockCityData[city] || mockCityData['Chennai'];
      setDashboardData(fallback);
      setLastRefreshedAt(isRefresh ? 'Just now' : (fallback.lastUpdated || 'Just now'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCityData(selectedCity, false);
  }, []);

  // Handle location dropdown change
  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    loadCityData(newCity, false);
  };

  // Handle refresh button click
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
        currentCity={selectedCity}
        isApiConnected={isApiConnected}
      />

      {/* Project Presentation Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div>
            <strong>Air Quality and Environment Monitoring Dashboard</strong> &mdash; Full Stack Web Development Project (Phase 1 Prototype)
          </div>
          <div className="footer-tags">
            <span className="footer-tag">React.js</span>
            <span className="footer-tag">Node.js / Express</span>
            <span className="footer-tag">PostgreSQL Ready</span>
            <span className="footer-tag">Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
