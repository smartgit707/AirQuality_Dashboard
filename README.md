# Air Quality & Environment Monitoring Dashboard (Phase 3 Full-Stack)

An interactive, responsive full-stack environmental monitoring dashboard designed for academic demonstration and real-world scalability. This application implements a complete 3-tier architecture:

```text
React Frontend (Vite)
        ↓  HTTP / REST
Express.js Backend (Node.js)
        ↓  SQL (node-postgres / pg.Pool)
PostgreSQL Database (air_quality_db)
```

---

## 1. Project Description

Urban air pollution is a critical public health and environmental challenge. This project translates raw environmental telemetry into actionable visual insights for citizens, researchers, and public health authorities.

### Key Capabilities in Phase 3:
- **Full-Stack 3-Tier Pipeline**: React frontend fetches telemetry exclusively through the Express REST API, which queries historical and real-time records from PostgreSQL using parameterized SQL queries.
- **PostgreSQL Database Integration**: Telemetry is persisted in the `air_quality_records` table with multi-row historical datasets for 5 cities.
- **Historical AQI Trend Charting**: The trend graph is dynamically populated from historical database records via `GET /api/air-quality/:city/history`.
- **Criteria Pollutant Monitoring**: Real-time concentrations and health tiers for PM2.5, PM10, CO, NO2, SO2, and O3.
- **Meteorological Parameters**: Ambient Temperature, Relative Humidity, Wind Speed, and Atmospheric Pressure.
- **Resilient Fallback & Error Handling**: Graceful loading indicators, 404 handlers for unknown cities, empty history fallbacks, and non-blocking database warning banners.
- **Interactive Refresh**: Navbar refresh button triggers a live database re-query and updates timestamps.

---

## 2. Technologies Used

### Frontend (`client/`)
- **React.js 18**: Component-based UI with hooks (`useState`, `useEffect`, `useCallback`).
- **Vite 5**: Next-generation development server and bundler.
- **API Service Layer**: Dedicated `src/services/api.js` for clean separation of network calls.
- **Recharts 2**: Responsive SVG charting library for time-series AQI trends.
- **Lucide React**: Modern environmental and meteorological icon suite.
- **CSS3 Design System**: Responsive grid, dark mode palette, and glassmorphic cards.

### Backend (`server/`)
- **Node.js**: Asynchronous JavaScript runtime.
- **Express.js 4**: Minimalist REST API framework.
- **node-postgres (`pg`)**: Connection pooling (`pg.Pool`) and parameterized query execution.
- **dotenv**: Environment variable isolation for database credentials.
- **CORS**: Secure cross-origin resource sharing middleware.

### Database
- **PostgreSQL**: Relational database storing environmental and air quality observations.

---

## 3. Project Structure

```text
air-quality-dashboard/
├── package.json                    # Root orchestrator scripts
├── README.md                       # Documentation & database setup guide
│
├── client/                         # Frontend Application (React + Vite)
│   ├── package.json
│   ├── vite.config.js              # Vite server & API proxy config
│   ├── index.html                  # HTML entry point
│   └── src/
│       ├── main.jsx                # React DOM root render
│       ├── App.jsx                 # Dashboard state & API coordinator
│       ├── index.css               # Styling & CSS variables
│       ├── components/
│       │   ├── Navbar.jsx          # Header navigation, live pill, refresh button
│       │   ├── LocationSelector.jsx # City dropdown selector
│       │   ├── AQICard.jsx         # Hero AQI card with dynamic meter
│       │   ├── MetricCard.jsx      # Reusable environmental metric card
│       │   ├── PollutantCard.jsx   # Pollutant stat card (PM2.5, PM10, etc.)
│       │   └── AQIChart.jsx        # Historical AQI time-series area chart
│       ├── pages/
│       │   └── Dashboard.jsx       # Main layout page with error/loading states
│       ├── services/
│       │   └── api.js              # API service layer querying Express backend
│       └── data/
│           └── mockData.js         # AQI threshold benchmarks & offline backup
│
└── server/                         # Backend Application (Express.js + PostgreSQL)
    ├── package.json
    ├── .env                        # Active environment variables (git-ignored)
    ├── .env.example                # Sample environment variables template
    ├── server.js                   # Express server entry point (Port 5001)
    ├── routes/
    │   └── airQuality.js           # REST API routing
    ├── controllers/
    │   └── airQualityController.js # Controller handling SQL queries & responses
    └── db/
        ├── index.js                # pg.Pool database connection manager
        ├── schema.sql              # PostgreSQL DDL table schema & seed data
        └── seed.js                 # Automatic database seeding script
```

---

## 4. PostgreSQL Database Documentation

### Database Specifications
- **Database Name**: `air_quality_db`
- **Table Name**: `air_quality_records`

### Table Columns & Data Types
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing unique record ID |
| `city` | `VARCHAR(100)` | `NOT NULL` | City name (e.g. Chennai, Delhi) |
| `aqi` | `INTEGER` | `NOT NULL, CHECK (aqi >= 0)` | Air Quality Index score |
| `temperature` | `NUMERIC(5, 2)` | `NOT NULL` | Ambient temperature in °C |
| `humidity` | `NUMERIC(5, 2)` | `NOT NULL` | Relative humidity in % |
| `pm25` | `NUMERIC(6, 2)` | `NOT NULL` | Fine Particulate Matter in µg/m³ |
| `pm10` | `NUMERIC(6, 2)` | `NOT NULL` | Coarse Dust in µg/m³ |
| `co` | `NUMERIC(6, 2)` | `NOT NULL` | Carbon Monoxide in mg/m³ |
| `no2` | `NUMERIC(6, 2)` | `NOT NULL` | Nitrogen Dioxide in µg/m³ |
| `so2` | `NUMERIC(6, 2)` | `NOT NULL` | Sulfur Dioxide in µg/m³ |
| `o3` | `NUMERIC(6, 2)` | `NOT NULL` | Ground-level Ozone in µg/m³ |
| `wind_speed` | `NUMERIC(5, 2)` | `NOT NULL` | Wind Speed in km/h |
| `pressure` | `NUMERIC(6, 2)` | `NOT NULL` | Atmospheric Barometric Pressure in hPa |
| `recorded_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Observation timestamp |

---

## 5. Step-by-Step Setup Guide

### Step 1: Install Dependencies
```bash
# In the project root directory:
npm run install:all

# Or individually:
cd server && npm install
cd ../client && npm install
```

### Step 2: Configure Environment Variables
Inside `server/`, create a `.env` file based on `.env.example`:
```bash
cd server
cp .env.example .env
```
Edit `server/.env` with your PostgreSQL credentials:
```ini
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=air_quality_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
PORT=5001
```

### Step 3: Create the Database & Table
Make sure your PostgreSQL server is running. Create the database:
```bash
# Using PostgreSQL CLI:
createdb -U postgres air_quality_db

# Or using psql:
psql -U postgres -c "CREATE DATABASE air_quality_db;"
```

### Step 4: Insert Sample Data
Initialize the table schema and load all 30 historical multi-city seed records:
```bash
cd server
npm run db:init

# Or directly through psql:
psql -U postgres -d air_quality_db -f db/schema.sql
```

### Step 5: Start the Backend Server
```bash
cd server
npm start
```
The API server starts on **`http://localhost:5001`**.
- Health Check: `http://localhost:5001/api/health`
- Supported Cities: `http://localhost:5001/api/cities`
- Latest City Telemetry: `http://localhost:5001/api/air-quality/Chennai`
- Historical Trend Records: `http://localhost:5001/api/air-quality/Chennai/history`

### Step 6: Start the Frontend Application
In a new terminal window:
```bash
cd client
npm run dev
```
Open your browser at **`http://localhost:3000`**.

---

## 6. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | API server and database connection status |
| `GET` | `/api/cities` | List of supported monitoring cities |
| `GET` | `/api/air-quality/:city` | Returns the **latest** environmental record for the selected city |
| `GET` | `/api/air-quality/:city/history` | Returns **historical** records used to populate the AQI trend chart |

---

## 7. Dynamic AQI Scale Standard

| AQI Range | Classification | Indicator Color | Health Advisory |
| :--- | :--- | :--- | :--- |
| **0 – 50** | **Good** | Emerald Green (`#10b981`) | Air quality is satisfactory; minimal or no risk. |
| **51 – 100** | **Moderate** | Amber Yellow (`#eab308`) | Acceptable; sensitive individuals should monitor exertion. |
| **101 – 150** | **Sensitive Groups** | Orange (`#f97316`) | Children & respiratory patients should limit outdoor exertion. |
| **151 – 200** | **Unhealthy** | Crimson Red (`#ef4444`) | Everyone may experience discomfort; wear masks outdoors. |
| **201+** | **Very Unhealthy** | Purple (`#8b5cf6`) | Health alert: remain indoors and activate air purifiers. |

---

## 8. College Project Course Info
- **Project**: Air Quality & Environment Monitoring Dashboard (Phase 3)
- **Course**: Full Stack Web Development
- **Demonstration**: End-to-end data pipeline (`React` &rarr; `Express REST API` &rarr; `PostgreSQL`)
