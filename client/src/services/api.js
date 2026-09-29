/**
 * API Service for Air Quality & Environment Telemetry
 * Communicates ONLY with the Express.js Backend API
 */

const BACKEND_BASE_URL = 'http://localhost:5001';

/**
 * Fetch latest environmental metrics for a specific city from Express API
 */
export async function fetchCityLatest(city) {
  const encodedCity = encodeURIComponent(city.trim());
  let response;

  try {
    // Primary: direct call to Express backend
    response = await fetch(`${BACKEND_BASE_URL}/api/air-quality/${encodedCity}`);
  } catch (netErr) {
    // Fallback to Vite dev server proxy
    response = await fetch(`/api/air-quality/${encodedCity}`);
  }

  if (!response.ok) {
    let errMessage = `Error ${response.status}: Failed to fetch data for ${city}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) errMessage = errJson.message;
    } catch (_) {}
    const error = new Error(errMessage);
    error.status = response.status;
    throw error;
  }

  const json = await response.json();
  return json.data || json;
}

/**
 * Fetch historical AQI data points for the trend chart from Express API
 */
export async function fetchCityHistory(city) {
  const encodedCity = encodeURIComponent(city.trim());
  let response;

  try {
    // Primary: direct call to Express backend
    response = await fetch(`${BACKEND_BASE_URL}/api/air-quality/${encodedCity}/history`);
  } catch (netErr) {
    // Fallback to Vite dev server proxy
    response = await fetch(`/api/air-quality/${encodedCity}/history`);
  }

  if (!response.ok) {
    let errMessage = `Error ${response.status}: Failed to fetch historical data for ${city}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) errMessage = errJson.message;
    } catch (_) {}
    const error = new Error(errMessage);
    error.status = response.status;
    throw error;
  }

  const json = await response.json();
  return json.history || json.trend || [];
}
