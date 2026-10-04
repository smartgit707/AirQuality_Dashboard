/**
 * EcoSense Client API Service
 * Centralized HTTP service interacting solely with Express Backend API
 */

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5001');

// Token storage helpers
export function getAuthToken() {
  return localStorage.getItem('ecosense_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('ecosense_token', token);
  } else {
    localStorage.removeItem('ecosense_token');
  }
}

async function request(endpoint, options = {}) {
  let response;
  const fullUrl = `${BACKEND_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers
  };

  try {
    response = await fetch(fullUrl, fetchOptions);
  } catch (err) {
    // Relative fallback if proxied or served together
    response = await fetch(endpoint, fetchOptions);
  }

  if (!response.ok) {
    let errMessage = `Error ${response.status}: Request failed`;
    try {
      const errJson = await response.json();
      if (errJson && (errJson.error || errJson.message)) {
        errMessage = errJson.error || errJson.message;
      }
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

/**
 * ============================================================
 * AUTHENTICATION API
 * ============================================================
 */
export async function apiLogin(email, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res.token) setAuthToken(res.token);
  return res;
}

export async function apiRegister(userData) {
  const res = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  if (res.token) setAuthToken(res.token);
  return res;
}

export async function apiGetMe() {
  return await request('/api/auth/me');
}

export async function apiUpdateProfile(data) {
  return await request('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function apiChangePassword(data) {
  return await request('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function apiLogout() {
  setAuthToken(null);
}

/**
 * ============================================================
 * USER DASHBOARD & PREFERENCES API
 * ============================================================
 */
export async function apiGetUserPreferences() {
  return await request('/api/user/preferences');
}

export async function apiUpdateUserPreferences(preferences) {
  return await request('/api/user/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences)
  });
}

export async function apiGetUserFavorites() {
  return await request('/api/user/favorites');
}

export async function apiAddUserFavorite(city) {
  return await request('/api/user/favorites', {
    method: 'POST',
    body: JSON.stringify({ city })
  });
}

export async function apiRemoveUserFavorite(city) {
  const encoded = encodeURIComponent(city.trim());
  return await request(`/api/user/favorites/${encoded}`, {
    method: 'DELETE'
  });
}

export async function apiGetUserAlerts() {
  return await request('/api/user/alerts');
}

/**
 * ============================================================
 * ADMIN PORTAL API
 * ============================================================
 */
export async function apiGetAdminUsers() {
  return await request('/api/admin/users');
}

export async function apiToggleUserStatus(userId) {
  return await request(`/api/admin/users/${userId}/toggle-status`, {
    method: 'PATCH'
  });
}

export async function apiChangeUserRole(userId, role) {
  return await request(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
}

export async function apiDeleteUser(userId) {
  return await request(`/api/admin/users/${userId}`, {
    method: 'DELETE'
  });
}

export async function apiGetAdminCities() {
  return await request('/api/admin/cities');
}

export async function apiBroadcastAlert(alertData) {
  return await request('/api/admin/alerts/broadcast', {
    method: 'POST',
    body: JSON.stringify(alertData)
  });
}

export async function apiGetAdminHistoricalData(city = 'all', limit = 50) {
  const encoded = encodeURIComponent(city);
  return await request(`/api/admin/data?city=${encoded}&limit=${limit}`);
}

export async function apiGetAdminSystemMetrics() {
  return await request('/api/admin/system');
}

