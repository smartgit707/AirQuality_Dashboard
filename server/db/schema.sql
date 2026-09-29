-- ==============================================================================
-- Air Quality and Environment Monitoring Dashboard - PostgreSQL Schema & Seed Data
-- Database Name: air_quality_db
-- Table Name: air_quality_records
-- Phase 3: Full Stack Integration (React -> Express -> PostgreSQL)
-- ==============================================================================

-- 1. Table Definition
DROP TABLE IF EXISTS air_quality_records;

CREATE TABLE air_quality_records (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    aqi INTEGER NOT NULL CHECK (aqi >= 0),
    temperature NUMERIC(5, 2) NOT NULL,    -- Ambient Temperature in °C
    humidity NUMERIC(5, 2) NOT NULL,       -- Relative Humidity in %
    pm25 NUMERIC(6, 2) NOT NULL,           -- PM2.5 in µg/m³
    pm10 NUMERIC(6, 2) NOT NULL,           -- PM10 in µg/m³
    co NUMERIC(6, 2) NOT NULL,             -- Carbon Monoxide in mg/m³
    no2 NUMERIC(6, 2) NOT NULL,            -- Nitrogen Dioxide in µg/m³
    so2 NUMERIC(6, 2) NOT NULL,            -- Sulfur Dioxide in µg/m³
    o3 NUMERIC(6, 2) NOT NULL,             -- Ground Ozone in µg/m³
    wind_speed NUMERIC(5, 2) NOT NULL,     -- Wind Speed in km/h
    pressure NUMERIC(6, 2) NOT NULL,       -- Atmospheric Pressure in hPa
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Index for City Lookups and Historical Time Sorting
CREATE INDEX idx_air_quality_city_recorded_at ON air_quality_records(city, recorded_at DESC);

-- ==============================================================================
-- 2. Multi-Record Historical Sample Data for 5 Metropolitan Cities
-- Spanning 8 AM to 6 PM to populate real historical AQI trend charts
-- ==============================================================================

-- CHENNAI HISTORICAL RECORDS
INSERT INTO air_quality_records 
    (city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at)
VALUES
    ('Chennai', 62, 26.5, 75.0, 28.0, 48.0, 0.6, 18.0, 6.0, 35.0, 10.0, 1009.0, NOW() - INTERVAL '10 hours'),
    ('Chennai', 68, 28.0, 71.0, 30.0, 52.0, 0.7, 21.0, 7.0, 38.0, 12.0, 1008.0, NOW() - INTERVAL '8 hours'),
    ('Chennai', 75, 30.2, 65.0, 32.0, 58.0, 0.8, 23.0, 8.0, 40.0, 14.0, 1007.0, NOW() - INTERVAL '6 hours'),
    ('Chennai', 81, 31.5, 62.0, 36.0, 65.0, 0.9, 26.0, 9.0, 44.0, 15.0, 1006.0, NOW() - INTERVAL '4 hours'),
    ('Chennai', 78, 29.8, 66.0, 34.0, 62.0, 0.8, 25.0, 8.0, 42.0, 14.0, 1007.0, NOW() - INTERVAL '2 hours'),
    ('Chennai', 78, 29.0, 68.0, 34.0, 61.0, 0.8, 24.0, 8.0, 42.0, 14.0, 1008.0, NOW() - INTERVAL '5 minutes');

-- HYDERABAD HISTORICAL RECORDS
INSERT INTO air_quality_records 
    (city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at)
VALUES
    ('Hyderabad', 72, 24.5, 65.0, 33.0, 58.0, 0.7, 22.0, 7.0, 28.0, 7.0, 961.0, NOW() - INTERVAL '10 hours'),
    ('Hyderabad', 79, 26.8, 61.0, 37.0, 64.0, 0.8, 26.0, 8.0, 31.0, 8.0, 960.0, NOW() - INTERVAL '8 hours'),
    ('Hyderabad', 85, 29.5, 55.0, 40.0, 69.0, 0.9, 29.0, 9.0, 33.0, 10.0, 959.0, NOW() - INTERVAL '6 hours'),
    ('Hyderabad', 92, 30.2, 52.0, 44.0, 75.0, 1.0, 32.0, 11.0, 37.0, 10.0, 958.0, NOW() - INTERVAL '4 hours'),
    ('Hyderabad', 88, 28.9, 56.0, 41.0, 72.0, 0.9, 30.0, 10.0, 35.0, 9.0, 959.0, NOW() - INTERVAL '2 hours'),
    ('Hyderabad', 88, 28.0, 58.0, 41.0, 72.0, 0.9, 30.0, 10.0, 35.0, 9.0, 960.0, NOW() - INTERVAL '10 minutes');

-- DELHI HISTORICAL RECORDS
INSERT INTO air_quality_records 
    (city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at)
VALUES
    ('Delhi', 195, 20.0, 58.0, 145.0, 210.0, 2.0, 68.0, 18.0, 52.0, 4.0, 1014.0, NOW() - INTERVAL '10 hours'),
    ('Delhi', 205, 22.5, 50.0, 155.0, 225.0, 2.2, 72.0, 20.0, 58.0, 5.0, 1013.0, NOW() - INTERVAL '8 hours'),
    ('Delhi', 220, 25.1, 42.0, 170.0, 248.0, 2.5, 81.0, 23.0, 68.0, 6.0, 1012.0, NOW() - INTERVAL '6 hours'),
    ('Delhi', 235, 26.0, 39.0, 180.0, 260.0, 2.7, 86.0, 25.0, 72.0, 7.0, 1011.0, NOW() - INTERVAL '4 hours'),
    ('Delhi', 215, 24.8, 43.0, 165.0, 240.0, 2.4, 78.0, 22.0, 65.0, 6.0, 1012.0, NOW() - INTERVAL '2 hours'),
    ('Delhi', 215, 24.0, 45.0, 165.0, 240.0, 2.4, 78.0, 22.0, 65.0, 6.0, 1012.0, NOW() - INTERVAL '3 minutes');

-- MUMBAI HISTORICAL RECORDS
INSERT INTO air_quality_records 
    (city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at)
VALUES
    ('Mumbai', 95, 27.5, 82.0, 45.0, 82.0, 0.9, 35.0, 10.0, 30.0, 12.0, 1011.0, NOW() - INTERVAL '10 hours'),
    ('Mumbai', 105, 29.2, 78.0, 50.0, 92.0, 1.0, 39.0, 12.0, 33.0, 14.0, 1010.0, NOW() - INTERVAL '8 hours'),
    ('Mumbai', 112, 31.8, 72.0, 54.0, 98.0, 1.1, 42.0, 13.0, 36.0, 17.0, 1009.0, NOW() - INTERVAL '6 hours'),
    ('Mumbai', 125, 32.5, 70.0, 62.0, 112.0, 1.3, 48.0, 16.0, 41.0, 18.0, 1008.0, NOW() - INTERVAL '4 hours'),
    ('Mumbai', 118, 31.2, 74.0, 58.0, 105.0, 1.2, 44.0, 14.0, 38.0, 16.0, 1010.0, NOW() - INTERVAL '2 hours'),
    ('Mumbai', 118, 31.0, 75.0, 58.0, 105.0, 1.2, 44.0, 14.0, 38.0, 16.0, 1010.0, NOW() - INTERVAL '8 minutes');

-- BENGALURU HISTORICAL RECORDS
INSERT INTO air_quality_records 
    (city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at)
VALUES
    ('Bengaluru', 35, 20.0, 70.0, 14.0, 28.0, 0.3, 11.0, 4.0, 22.0, 9.0, 916.0, NOW() - INTERVAL '10 hours'),
    ('Bengaluru', 38, 22.0, 64.0, 16.0, 32.0, 0.4, 13.0, 4.0, 25.0, 11.0, 915.0, NOW() - INTERVAL '8 hours'),
    ('Bengaluru', 45, 24.5, 58.0, 20.0, 40.0, 0.5, 17.0, 5.0, 30.0, 13.0, 914.0, NOW() - INTERVAL '6 hours'),
    ('Bengaluru', 48, 25.2, 55.0, 22.0, 42.0, 0.5, 18.0, 6.0, 32.0, 12.0, 914.0, NOW() - INTERVAL '4 hours'),
    ('Bengaluru', 42, 23.8, 59.0, 18.0, 36.0, 0.4, 15.0, 5.0, 28.0, 11.0, 915.0, NOW() - INTERVAL '2 hours'),
    ('Bengaluru', 42, 23.0, 60.0, 18.0, 36.0, 0.4, 15.0, 5.0, 28.0, 11.0, 915.0, NOW() - INTERVAL '2 minutes');
