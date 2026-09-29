# Air Quality & Environment Monitoring Dashboard (Phase 2 Prototype)

An interactive, responsive full-stack environmental monitoring dashboard designed for academic demonstration and real-world scalability. This application allows users to monitor real-time air quality indices (AQI), criteria atmospheric pollutants (PM2.5, PM10, CO, NO2, SO2, O3), and ambient meteorological conditions across key Indian metropolitan cities.

---

## 1. Project Description

Urban air pollution is a critical public health and environmental challenge. This project delivers an intuitive, modern dashboard that translates complex raw environmental telemetry into actionable visual insights for citizens, researchers, and public health authorities.

### Key Capabilities in Phase 2:
- **Functional Location Switching**: Dropdown enables live switching between 5 major Indian metropolitan areas: **Chennai**, **Hyderabad**, **Delhi**, **Mumbai**, and **Bengaluru**.
- **Dynamic AQI Classification**: Auto-computes health risk categories (Good, Moderate, Sensitive Groups, Unhealthy, Very Unhealthy) based on Indian NAQI benchmarks.
- **Air Quality Trend Analysis**: Interactive historical progression chart (time vs. AQI) with custom hover tooltips.
- **Dedicated Pollutant Monitoring Section**: Displays PM2.5, PM10, Carbon Monoxide (CO), Nitrogen Dioxide (NO2), Sulfur Dioxide (SO2), and Ozone (O3) with health status badges and capacity indicators.
- **Environmental Conditions Section**: Displays ambient Temperature (°C), Relative Humidity (%), Wind Speed (km/h), and Atmospheric Pressure (hPa).
- **Express Backend API Connection**: Frontend directly fetches live data through the Express REST API (`GET /api/air-quality/:city`) with an active "Backend API Connected" indicator.
- **Functional Refresh Button**: Clicking the navbar refresh button re-fetches telemetry and updates the "Updated Just now" timestamp.

---

## 2. Technologies Used

### Frontend
- **React.js 18**: Modular component-based architecture (`hooks`, `useCallback`, `useState`, `useEffect`).
- **Vite 5**: Ultra-fast next-generation development server and production bundler.
- **CSS3 Modern Design System**: Responsive grid & flexbox layouts, glassmorphism, CSS custom variables, and dark-mode environmental aesthetics.
- **Recharts 2**: Composable SVG charting library for responsive time-series visualization.
- **Lucide React**: Clean, accessible icon library for environmental and weather indicators.

### Backend
- **Node.js**: Asynchronous event-driven JavaScript runtime.
- **Express.js 4**: Fast, minimalist REST API web framework.
- **CORS**: Cross-Origin Resource Sharing middleware for flexible client-server communication.

### Database (Preparation)
- **PostgreSQL**: Production-ready relational database schema design with indexing and sample seed records located in `server/database/schema.sql`.

---

## 3. Folder Structure

```text
air-quality-dashboard/
├── package.json                    # Root project orchestrator
├── README.md                       # Comprehensive project documentation
│
├── client/                         # React Frontend (Vite)
│   ├── package.json
│   ├── vite.config.js              # Vite server & API proxy config
│   ├── index.html                  # HTML entry point with Google Fonts
│   └── src/
│       ├── main.jsx                # React DOM render entry
│       ├── App.jsx                 # Root component & state coordinator
│       ├── index.css               # Global stylesheet & design tokens
│       ├── components/
│       │   ├── Navbar.jsx          # Header navigation & city dropdown
│       │   ├── LocationSelector.jsx # City select dropdown
│       │   ├── AQICard.jsx         # Hero AQI card with dynamic meter
│       │   ├── MetricCard.jsx      # Reusable environmental metric card
│       │   ├── PollutantCard.jsx   # Individual pollutant stat card
│       │   └── AQIChart.jsx        # Recharts time-series line/area graph
│       ├── pages/
│       │   └── Dashboard.jsx       # Main dashboard layout page
│       └── data/
│           └── mockData.js         # Client mock data & AQI classification logic
│
└── server/                         # Express.js Backend
    ├── package.json
    ├── server.js                   # Express server entry point (Port 5001)
    ├── routes/
    │   └── airQuality.js           # REST API endpoints (/api/air-quality, /api/cities)
    ├── data/
    │   └── mockData.js             # Server-side city environmental datasets
    └── database/
        └── schema.sql              # PostgreSQL DDL schema & sample seed data
```

---

## 4. How to Install Dependencies

### Prerequisites
- **Node.js**: v18.0.0 or later (v24.x tested and supported)
- **npm**: v9.0.0 or later

### Installation Steps

1. Clone or navigate to the project directory:
   ```bash
   cd air-quality-dashboard
   ```

2. Install dependencies for both Frontend and Backend:
   ```bash
   # Option A: Using the root helper script
   npm run install:all

   # Option B: Installing manually in each directory
   cd server && npm install
   cd ../client && npm install
   ```

---

## 5. How to Run Frontend

To launch the React development server:

```bash
cd client
npm run dev
```

The Vite dev server will start at:
👉 **`http://localhost:3000`**

To produce an optimized production build:
```bash
cd client
npm run build
```

---

## 6. How to Run Backend

To run the Node.js Express backend API:

```bash
cd server
npm start
```

The Express server will start on port **5001** (or custom `PORT` environment variable):
👉 **`http://localhost:5001`**

### Available REST Endpoints:
- `GET /api/health` - API server status check
- `GET /api/cities` - List of all supported monitoring cities
- `GET /api/air-quality` - Summary of all cities' current environmental metrics
- `GET /api/air-quality/:city` - Detailed metrics for a specific city (e.g. `/api/air-quality/Delhi`, `/api/air-quality/Chennai`)

---

## 7. Implemented Features (Phase 2)

✅ **Working Location Switching**: Interactive dropdown in the navbar allowing live switching between:
  - **Chennai**: AQI 78 (Moderate), 29°C, 68% Humidity, PM2.5 34, PM10 61, CO2 520
  - **Hyderabad**: AQI 88 (Moderate), 28°C, 58% Humidity, PM2.5 41, PM10 72, CO2 495
  - **Delhi**: AQI 215 (Very Unhealthy), 24°C, 45% Humidity, PM2.5 165, PM10 240, CO2 680
  - **Mumbai**: AQI 118 (Sensitive Groups), 31°C, 75% Humidity, PM2.5 58, PM10 105, CO2 560
  - **Bengaluru**: AQI 42 (Good), 23°C, 60% Humidity, PM2.5 18, PM10 36, CO2 430  
✅ **Dynamic AQI Status Computation**:
  - `0 – 50` : **Good**
  - `51 – 100` : **Moderate**
  - `101 – 150` : **Sensitive Groups**
  - `151 – 200` : **Unhealthy**
  - `201+` : **Very Unhealthy**  
✅ **Pollutant Monitoring Section**: Placed right below the AQI chart displaying cards for **PM2.5**, **PM10**, **CO**, **NO2**, **SO2**, and **O3**, with current value, unit, and health status (Good / Moderate / High).  
✅ **Environmental Conditions Section**: Displays cards with Lucide icons for Temperature, Humidity, Wind Speed, and Atmospheric Pressure.  
✅ **Active Express Backend Integration**: React app fetches data dynamically from `GET /api/air-quality/:city` on the Express server with an active green "● Backend API Connected" indicator.  
✅ **Functional Refresh Button**: Clicking the refresh icon in the navbar triggers a live API re-fetch and updates the dashboard with a rotating animation and refreshed timestamp.  
✅ **Meteorological Parameters**: Real-time display of Temperature (°C), Relative Humidity (%), Wind Speed (km/h), and Barometric Pressure (hPa).  
✅ **PostgreSQL Schema Specification**: Defined `air_quality_records` table with proper data types, indexing on city and timestamp, and insert seed statements.  
✅ **Fault-Tolerant Hybrid Architecture**: Seamlessly loads data from the Express backend via REST; if the backend is stopped, the client gracefully falls back to local mock data without breaking the presentation.

---

## 8. Future Features (Phase 2 & Beyond)

1. **PostgreSQL Integration**:
   - Connect PostgreSQL using `pg` (node-postgres) or Prisma ORM.
   - Implement historical query ranges (past 24h, 7 days, 30 days).
2. **IoT Sensor Ingestion & WebSockets**:
   - MQTT / WebSocket broker integration to accept real-time streams from physical hardware sensors (e.g., ESP32 + DHT22 + MQ-135 / PMS5003).
3. **Interactive Map View**:
   - Leaflet / Mapbox integration with color-coded AQI pins across geographic sensor stations.
4. **Automated Alerting & Push Notifications**:
   - Web push notifications or email alerts when AQI exceeds hazardous thresholds.
5. **Predictive Air Quality Forecasting**:
   - Basic machine learning or linear regression to forecast next 12-hour AQI trends based on wind and humidity patterns.
6. **User Authentication & Custom Watchlists**:
   - JWT-based authentication for custom alert thresholds and saved city lists.

---

## Author & Course Information
- **Course**: Full Stack Web Development
- **Project**: Air Quality and Environment Monitoring Dashboard (Phase 1 Prototype)
