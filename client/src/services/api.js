/**
 * EcoSense Client API Service
 * Centralized HTTP service interacting solely with Express Backend API
 */

const BACKEND_BASE_URL = 'http://localhost:5001';

async function request(endpoint, options = {}) {
  let response;
  const fullUrl = `${BACKEND_BASE_URL}${endpoint}`;
  try {
    response = await fetch(fullUrl, options);
  } catch (err) {
    // Relative fallback if proxied or served together
    response = await fetch(endpoint, options);
  }

  if (!response.ok) {
    let errMessage = `Error ${response.status}: Request failed`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) errMessage = errJson.message;
    } catch (_) {}
    const error = new Error(errMessage);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

/**
 * 1. Cities List
 */
export async function fetchCities() {
  return await request('/api/cities');
}

/**
 * 2. City Latest Environmental Telemetry
 */
export async function fetchCityLatest(city) {
  const encoded = encodeURIComponent(city.trim());
  const json = await request(`/api/air-quality/${encoded}`);
  return json.data || json;
}

/**
 * 3. City Historical Records
 */
export async function fetchCityHistory(city) {
  const encoded = encodeURIComponent(city.trim());
  const json = await request(`/api/air-quality/${encoded}/history`);
  return json.history || json.trend || [];
}

/**
 * 4. Force Telemetry Refresh
 */
export async function refreshCityTelemetry(city) {
  const encoded = encodeURIComponent(city.trim());
  return await request(`/api/refresh/${encoded}`, { method: 'POST' });
}

/**
 * 5. City Comparison (Dual & Multi-City up to 5)
 */
export async function fetchCityComparison(city1, city2) {
  const c1 = encodeURIComponent(city1.trim());
  const c2 = encodeURIComponent(city2.trim());
  return await request(`/api/air-quality/compare?city1=${c1}&city2=${c2}`);
}

export async function fetchMultiComparison(citiesArray) {
  const list = encodeURIComponent(citiesArray.join(','));
  return await request(`/api/comparison?cities=${list}`);
}

/**
 * 6. Historical Analytics
 */
export async function fetchAnalytics(city, metric = 'aqi', range = '24h') {
  const encoded = encodeURIComponent(city.trim());
  return await request(`/api/analytics/${encoded}?metric=${metric}&range=${range}`);
}

/**
 * 7. Diurnal Trend Forecast
 */
export async function fetchForecast(city) {
  const encoded = encodeURIComponent(city.trim());
  return await request(`/api/forecast/${encoded}`);
}

/**
 * 8. Smart Alerts
 */
export async function fetchAlerts() {
  return await request('/api/alerts');
}

export async function markAlertRead(alertId) {
  return await request(`/api/alerts/${alertId}/read`, { method: 'PATCH' });
}

/**
 * 9. Activity & Health Recommendations
 */
export async function fetchRecommendations(city) {
  const encoded = encodeURIComponent(city.trim());
  return await request(`/api/recommendations/${encoded}`);
}

/**
 * 10. System Status & Diagnostics
 */
export async function fetchSystemStatus() {
  return await request('/api/system/status');
}

/**
 * 11. Backend Health
 */
export async function fetchHealth() {
  return await request('/api/health');
}
