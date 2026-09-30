# Air Quality & Environment Monitoring Dashboard (Phase 4 Real Data Pipeline)

An interactive, responsive full-stack environmental monitoring dashboard that connects directly to **live real-world atmospheric telemetry** through the **Open-Meteo Air Quality & Weather API**, persisting observations into a **PostgreSQL database**, and presenting real-time intelligence through a modern **React.js dashboard**.

---

## 1. System Architecture & Data Flow

```text
+-------------------------------------------------------------------------+
|                         React Frontend (Vite)                           |
|  - City Selector (Chennai, Hyderabad, Delhi, Mumbai, Bengaluru)         |
|  - Live AQI Card & Dynamic NAQI Health Categorization                   |
|  - Pollutants Grid (PM2.5, PM10, CO, NO2, SO2, O3)                      |
|  - Environmental Conditions (Temp, Humidity, Wind Speed, Pressure)      |
|  - Recharts Historical Trend Line                                       |
+-------------------------------------------------------------------------+
                                    │
                                    │ 1. HTTP GET /api/air-quality/:city
                                    ▼
+-------------------------------------------------------------------------+
|                       Express.js Backend (Node.js)                      |
|  - City Coordinate Resolution (server/config/cities.js)                 |
|  - Open-Meteo Integration Service (server/services/openMeteoService.js)|
|  - Standard AQI Calculation & Unit Formatting                           |
|  - Controller & Error Handling Layer                                    |
+-------------------------------------------------------------------------+
            │                                             │
            │ 2. Fetch Live Telemetry                     │ 4. Store Observation
            ▼                                             ▼
+------------------------------------+   +--------------------------------+
|          Open-Meteo APIs           |   |      PostgreSQL Database       |
| - Air Quality API (PM2.5, PM10,    |   | - Table: air_quality_records   |
|   CO, NO2, SO2, O3, US AQI)        |   | - Historical telemetry storage |
| - Weather API (Temp, Humidity,     |   | - Serves /api/air-quality/     |
|   Wind Speed, Surface Pressure)    |   |   :city/history to trend chart |
+------------------------------------+   +--------------------------------+
```

---

## 2. External API Used & Implementation

### Open-Meteo Air Quality & Weather API
- **Provider**: Open-Meteo (open-source, non-commercial/academic friendly, zero API key required).
- **APIs Queried by Express Backend**:
  1. **Air Quality API**:
     `https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&hourly=us_aqi,pm2_5,pm10&past_days=1&forecast_days=0`
     - Retrieves live criteria air pollutants: PM2.5, PM10, Carbon Monoxide (CO), Nitrogen Dioxide (NO2), Sulphur Dioxide (SO2), Ozone (O3), and US AQI index.
  2. **Weather Forecast API**:
     `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m`
     - Retrieves ambient temperature, relative humidity, wind speed, and barometric pressure.

### AQI Calculation Logic
- The backend determines the AQI using Open-Meteo's standard `us_aqi` metric.
- If unavailable, the backend dynamically calculates AQI from PM2.5 concentrations using the standard **US EPA Piecewise Linear Interpolation Formula**:
  $$I = \frac{I_{high} - I_{low}}{C_{high} - C_{low}} \times (C - C_{low}) + I_{low}$$
- The frontend dynamically maps the numerical AQI into Indian National Air Quality Index health tiers:
  - `0 – 50` : **Good** (Minimal impact)
  - `51 – 100` : **Moderate** (Minor breathing discomfort to sensitive individuals)
  - `101 – 150` : **Sensitive Groups** (Children & elderly at risk)
  - `151 – 200` : **Unhealthy** (Breathing discomfort to general public)
  - `201+` : **Very Unhealthy** (Emergency respiratory warning)

---

## 3. Supported Cities & Coordinates

Defined in [`server/config/cities.js`](file:///Users/manmohansingh/Downloads/air-quality-dashboard/server/config/cities.js):

| City | State / Region | Latitude | Longitude |
| :--- | :--- | :--- | :--- |
| **Chennai** | Tamil Nadu | `13.0827` | `80.2707` |
| **Hyderabad** | Telangana | `17.3850` | `78.4867` |
| **Delhi** | National Capital Region | `28.6139` | `77.2090` |
| **Mumbai** | Maharashtra | `19.0760` | `72.8777` |
| **Bengaluru** | Karnataka | `12.9716` | `77.5946` |

---

## 4. Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health check and PostgreSQL connectivity status |
| `GET` | `/api/cities` | List of supported monitoring cities |
| `GET` | `/api/air-quality/:city` | Validates city, queries Open-Meteo, saves reading to PostgreSQL, and returns live JSON |
| `GET` | `/api/air-quality/:city/history` | Returns historical observations from PostgreSQL for the trend chart |

### Clean JSON Response Format (`GET /api/air-quality/:city`)
```json
{
  "city": "Chennai",
  "state": "Tamil Nadu",
  "aqi": 181,
  "temperature": 30.7,
  "humidity": 74,
  "pm25": 32.8,
  "pm10": 36.8,
  "co": 0.28,
  "no2": 7.1,
  "so2": 13.0,
  "o3": 171.0,
  "windSpeed": 6.9,
  "pressure": 1008,
  "updatedAt": "2026-09-30T12:00:00.000Z",
  "isLive": true,
  "source": "Open-Meteo Live API",
  "success": true
}
```

---

## 5. PostgreSQL Database Architecture

- **Database Name**: `air_quality_db`
- **Table Name**: `air_quality_records`

### Schema Definition
```sql
CREATE TABLE air_quality_records (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    aqi INTEGER NOT NULL CHECK (aqi >= 0),
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    pm25 NUMERIC(6, 2) NOT NULL,
    pm10 NUMERIC(6, 2) NOT NULL,
    co NUMERIC(6, 2) NOT NULL,
    no2 NUMERIC(6, 2) NOT NULL,
    so2 NUMERIC(6, 2) NOT NULL,
    o3 NUMERIC(6, 2) NOT NULL,
    wind_speed NUMERIC(5, 2) NOT NULL,
    pressure NUMERIC(6, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_air_quality_city_recorded_at ON air_quality_records(city, recorded_at DESC);
```

Every fresh reading fetched from Open-Meteo is persisted via `INSERT INTO air_quality_records (...) VALUES (...)`.

---

## 6. How to Run the Project Locally

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Configure Environment Variables
Inside `server/`:
```bash
cp server/.env.example server/.env
```
Default `.env` configuration:
```ini
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=air_quality_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
PORT=5001
```

### Step 3: Initialize Database (Optional)
If PostgreSQL is running locally, apply the schema and baseline records:
```bash
cd server
npm run db:init
```

### Step 4: Start the Backend Server
```bash
cd server
npm start
```
*API runs at `http://localhost:5001`*

### Step 5: Start the Frontend Application
In a separate terminal:
```bash
cd client
npm run dev
```
*Dashboard opens at `http://localhost:3000`*

---

## 7. Troubleshooting & Error Handling

- **External API Downtime or Network Timeout**:
  If Open-Meteo is unreachable, the backend automatically queries the most recent recorded reading from PostgreSQL and serves it with an indicator: `○ Stored DB Reading (Fallback)` and an alert banner.
- **City Not Found**:
  Entering or requesting an unsupported city returns a clean HTTP 404 with a helpful message: `Invalid city. Supported cities: Chennai, Hyderabad, Delhi, Mumbai, Bengaluru`.
- **Database Disconnected**:
  If PostgreSQL is not running on the host machine, the backend seamlessly switches to an in-memory schema repository so the live Open-Meteo telemetry continues displaying with zero crashes.
- **Duplicate Refresh Prevention**:
  The refresh button disables itself and displays a rotating spinner while a network fetch is in-flight, preventing race conditions or duplicate database entries.
