# ECOSENSE: Intelligent Air Quality & Environmental Monitoring Platform

> **Tagline**: *"Monitor. Analyze. Compare. Predict."*  
> **Course**: Full Stack Web Development (College Capstone / Laboratory Project)  
> **Architecture**: React (Vite) &bull; Express.js (Node.js) &bull; PostgreSQL &bull; Open-Meteo APIs  

---

## 1. Project Overview & Problem Statement

Urban air quality and environmental degradation represent critical public health challenges across industrial and metropolitan corridors. Citizens, athletes, and city planners often lack unified, transparent access to multi-pollutant telemetry, historical patterns, and actionable outdoor advisories.

**EcoSense** is a full-stack environmental intelligence platform designed to bridge this gap. Rather than serving as a basic static dashboard, EcoSense operates as an integrated three-tier system that continuously collects live atmospheric criteria, persists observations into PostgreSQL, triggers threshold-based alerts, projects 24-hour diurnal forecasts, and generates verifiable audit dossiers.

---

## 2. Key Objectives & Features

1. **Overview Dashboard**: Real-time monitoring across 5 metropolitan monitoring stations (Chennai, Hyderabad, Delhi, Mumbai, Bengaluru) displaying AQI, dynamic status, 6 criteria pollutants (PM2.5, PM10, CO, NO2, SO2, O3), and 4 weather factors (Temp, Humidity, Wind Speed, Pressure).
2. **EcoSense Environmental Health Score**: Transparent rule-based composite index (0–100) combining AQI severity (60%), particulate burden (25%), and meteorological comfort (15%).
3. **Live Pollution Interactive Map**: Leaflet / React-Leaflet GIS visualization featuring color-coded station markers, interactive telemetry popups, and quick-jump navigation.
4. **Atmospheric Analytics**: Longitudinal analytics across any parameter (AQI, PM2.5, etc.) and time horizons (24 Hours, 7 Days, 30 Days) with min, max, average, and percentage trend velocity.
5. **Multi-City Comparison Matrix**: Simultaneous benchmark across 2 to 5 monitoring stations with automated winner detection (Cleanest Air, Highest Pollution, Lowest PM2.5) and overlaid Recharts trends.
6. **Diurnal AQI Forecast**: Mathematical moving average projection model factoring diurnal nocturnal stagnation curves into 24-hour expected peak and lowest points.
7. **Smart Notification & Alerts Engine**: In-app threshold surveillance logging `INFO`, `WARNING`, and `CRITICAL` alerts with interactive read acknowledgement.
8. **Health & Activity Advisories**: EPA/WHO-aligned outdoor guidance for running, walking, cycling, outdoor sports, and home ventilation.
9. **Automated Background Data Collector**: Background scheduler (`server/jobs/dataCollector.js`) polling Open-Meteo at configurable intervals (`DATA_COLLECTION_INTERVAL`).
10. **Printable Audit Reports**: On-demand station dossiers with summary statistics and browser print / PDF export styling.
11. **System Health & Diagnostic Platform**: Administrative telemetry monitoring API gateway uptime, PostgreSQL connection state, synchronization logs, and record counters.

---

## 3. Technology Stack

* **Frontend**: React 18.3.1, Vite 5.4.11, Pure CSS3 (Design Tokens & Glassmorphism), Recharts 2.13.3, Leaflet 1.9.4 & React-Leaflet 4.2.1, Lucide React icons.
* **Backend**: Node.js v20+, Express.js 4.21.1, CORS, Dotenv.
* **Database**: PostgreSQL 14+ (`pg` 8.23.0 pool client) with automated, resilient fallback in-memory store for offline development and review demonstrations.
* **External Ingestion Layer**: Open-Meteo Air Quality & Weather Forecast APIs (Zero API keys required; open access).

---

## 4. System Architecture & Data Flow

```text
                     EXTERNAL DATA SOURCES
                    (Open-Meteo Air & Weather)
                               │
                               ▼
               ┌───────────────────────────────┐
               │      Express.js Backend       │
               │         (Port 5001)           │
               └───────────────┬───────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Data Collector  │  │   Alert Engine   │  │ Forecast Engine  │
│(server/jobs/...) │  │ (Threshold Rules)│  │ (Diurnal Models) │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
               ┌───────────────────────────────┐
               │      PostgreSQL Database      │
               │  - air_quality_records table  │
               │  - alerts table               │
               └───────────────┬───────────────┘
                               │
                               ▼
               ┌───────────────────────────────┐
               │     React 18 / Vite Client    │
               │         (Port 3000)           │
               └───────────────┬───────────────┘
                               │
   ┌───────────┬───────────┬───┴───────┬───────────┬───────────┐
   ▼           ▼           ▼           ▼           ▼           ▼
Overview      Map      Analytics    Compare    Forecast      Alerts
Dashboard  (Leaflet)  (Time-Series)(2-5 Cities)(24h Diurnal) (Events)
   │
   ├───────────────────────────────────────────────┐
   ▼                                               ▼
Trends                                          Reports
(Longitudinal)                             (Print / PDF Export)
```

---

## 5. Mathematical & Algorithmic Foundations

### A. Environmental Health Score (Rule-Based, 0–100)
To avoid opaque or misleading machine learning claims, EcoSense uses a transparent, explainable formula:
$$\text{Score} = \text{Base}(100) - \Delta_{\text{AQI}} - \Delta_{\text{Particulates}} - \Delta_{\text{Weather}}$$
* **AQI Component (60 pts max)**: Scales progressively based on EPA index bands ($AQI \le 50 \to 52\text{--}60$, $AQI \le 100 \to 38\text{--}52$, $AQI > 200 \to 2\text{--}10$).
* **Particulate Penalty (25 pts max)**: Penalizes elevated PM2.5 concentrations above $35\text{ }\mu\text{g/m}^3$ and $60\text{ }\mu\text{g/m}^3$.
* **Meteorological Comfort (15 pts max)**: Deductions applied when ambient temperature exceeds $33^\circ\text{C}$ or drops below $14^\circ\text{C}$, or relative humidity breaches $70\%$.

### B. Dynamic AQI Calculation
AQI is retrieved directly from standard monitoring criteria or computed using the **US EPA Piecewise Linear Formula**:
$$I = \frac{I_{\text{high}} - I_{\text{low}}}{C_{\text{high}} - C_{\text{low}}} \times (C - C_{\text{low}}) + I_{\text{low}}$$

### C. Diurnal AQI Forecasting
Calculates baseline telemetry weighted with typical municipal atmospheric inversion factors ($\pm 25\%$), modeling nighttime planetary boundary layer compression and daytime convective dispersion.

---

## 6. Database Schema Design

The PostgreSQL database `air_quality_db` contains two primary tables configured with indexes for rapid retrieval:

```sql
-- 1. Environmental Telemetry Records
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

-- 2. Smart Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    metric VARCHAR(50) NOT NULL,
    value NUMERIC(8, 2) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_alerts_city_created_at ON alerts(city, created_at DESC);
```

---

## 7. RESTful API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server uptime and PostgreSQL pool connection status |
| `GET` | `/api/cities` | Supported cities with geographical coordinates |
| `GET` | `/api/air-quality/:city` | Real-time Open-Meteo telemetry fetch and database persistence |
| `GET` | `/api/air-quality/:city/history`| Historical observations for trend visualization |
| `POST`| `/api/refresh/:city` | Force synchronization of fresh external telemetry |
| `GET` | `/api/comparison?cities=...` | Multi-city comparison matrix and overlaid trends (2–5 cities) |
| `GET` | `/api/analytics/:city` | Time-series aggregations (min, max, avg, % delta) over 24h, 7d, 30d |
| `GET` | `/api/forecast/:city` | 24-hour diurnal projected AQI curve and outlook |
| `GET` | `/api/alerts` | Active threshold alert feed with severity tags |
| `PATCH`| `/api/alerts/:id/read` | Mark alert as acknowledged/read |
| `GET` | `/api/recommendations/:city`| EPA outdoor activity advisories |
| `GET` | `/api/system/status` | System health, database connection, sync metrics, record count |

---

## 8. Installation & Setup Instructions

### Prerequisites
* **Node.js** (v18.0.0 or later)
* **PostgreSQL** (v14 or later, optional but recommended)

### Step 1: Clone Repository
```bash
git clone https://github.com/smartgit707/AirQuality_Dashboard.git
cd AirQuality_Dashboard
```

### Step 2: Configure Environment Variables
Inside `server/.env`:
```env
PORT=5001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=air_quality_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATA_COLLECTION_INTERVAL=30
```

### Step 3: Initialize Database (If running local PostgreSQL)
```bash
# In PostgreSQL CLI
createdb air_quality_db

# Run schema migrations and seeds
cd server
npm run db:init
```
*(Note: If PostgreSQL is offline, EcoSense automatically activates its built-in resilient in-memory store so all features remain testable and interactive).*

### Step 4: Start Backend Server
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5001
```

### Step 5: Start Frontend Application
```bash
cd ../client
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 9. Faculty Viva / Demo Script Walkthrough

During your evaluation or project review, showcase the complete workflow in this order:

1. **Overview Dashboard**: Demonstrate city switching (Delhi $\leftrightarrow$ Bengaluru). Show how AQI, Health Score, Pollutants, and Weather update dynamically.
2. **Environmental Health Score**: Explain the 60/25/15 rule-based calculation and how it gives citizens a clear wellness rating.
3. **Live Pollution Map**: Click the **Map** tab. Point out the Leaflet GIS layer with color-coded AQI severity badges and click a city popup to navigate directly to its details.
4. **Multi-City Comparison**: Open **Compare**. Select 3 or 4 cities (Delhi, Bengaluru, Mumbai, Chennai). Show automated winner badges and overlaid Recharts curves.
5. **Analytics**: Open **Analytics**. Switch between parameters (PM2.5, Humidity) and time horizons (24h, 7d, 30d) to show min/max/average stats.
6. **24-Hour Forecast**: Open **Forecast**. Explain the diurnal atmospheric curve and highlight the non-clinical estimation disclaimer.
7. **Smart Alerts**: Open **Alerts**. Filter by CRITICAL/WARNING, demonstrate the interactive "Mark Read" feature.
8. **Printable Dossier**: Open **Reports**. Show the formal academic layout and click **Print / Save PDF**.
9. **System Status**: Open **System**. Show live API gateway uptime, PostgreSQL connectivity, total stored records, and the background collector sync interval.

---

## 10. Future Improvements

* Mobile companion application with push notification capabilities.
* Ingestion from IoT hardware sensor nodes (ESP32/Arduino via MQTT/WebSockets).
* Integration of machine learning models (LSTM / Random Forest) trained on seasonal meteorological datasets.
