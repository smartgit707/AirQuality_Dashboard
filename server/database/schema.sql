-- ==============================================================================
-- Air Quality and Environment Monitoring Dashboard - Database Schema
-- Database: PostgreSQL
-- Phase 1: Prototype Schema Definition & Seed Records
-- ==============================================================================

-- Drop table if already exists for clean reset
DROP TABLE IF EXISTS air_quality_records;

-- Create the primary table for historical and real-time environmental metrics
CREATE TABLE air_quality_records (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    aqi INTEGER NOT NULL CHECK (aqi >= 0),
    pm25 NUMERIC(6, 2) NOT NULL,     -- PM2.5 in µg/m³
    pm10 NUMERIC(6, 2) NOT NULL,     -- PM10 in µg/m³
    co NUMERIC(6, 2) NOT NULL,       -- Carbon Monoxide in mg/m³
    no2 NUMERIC(6, 2) NOT NULL,      -- Nitrogen Dioxide in µg/m³
    so2 NUMERIC(6, 2) NOT NULL,      -- Sulfur Dioxide in µg/m³
    o3 NUMERIC(6, 2) NOT NULL,       -- Ozone in µg/m³
    temperature NUMERIC(5, 2) NOT NULL, -- Temperature in °C
    humidity NUMERIC(5, 2) NOT NULL,    -- Relative Humidity in %
    wind_speed NUMERIC(5, 2) NOT NULL,  -- Wind Speed in km/h
    pressure NUMERIC(6, 2) NOT NULL,    -- Atmospheric Pressure in hPa
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for high-performance query lookups by city and timestamp
CREATE INDEX idx_air_quality_city ON air_quality_records(city);
CREATE INDEX idx_air_quality_recorded_at ON air_quality_records(recorded_at DESC);
CREATE INDEX idx_air_quality_city_time ON air_quality_records(city, recorded_at DESC);

-- ==============================================================================
-- Sample Seed Data for Testing & Verification
-- ==============================================================================

INSERT INTO air_quality_records 
    (city, aqi, pm25, pm10, co, no2, so2, o3, temperature, humidity, wind_speed, pressure, recorded_at)
VALUES
    ('Chennai', 78, 34.0, 61.0, 0.8, 24.0, 8.0, 42.0, 29.0, 68.0, 14.0, 1008.0, NOW() - INTERVAL '5 minutes'),
    ('Delhi', 215, 165.0, 240.0, 2.4, 78.0, 22.0, 65.0, 24.0, 45.0, 6.0, 1012.0, NOW() - INTERVAL '2 minutes'),
    ('Mumbai', 118, 58.0, 105.0, 1.2, 44.0, 14.0, 38.0, 31.0, 75.0, 16.0, 1010.0, NOW() - INTERVAL '8 minutes'),
    ('Bengaluru', 42, 18.0, 36.0, 0.4, 15.0, 5.0, 28.0, 23.0, 60.0, 11.0, 915.0, NOW() - INTERVAL '3 minutes'),
    ('Hyderabad', 88, 41.0, 72.0, 0.9, 30.0, 10.0, 35.0, 28.0, 58.0, 9.0, 960.0, NOW() - INTERVAL '12 minutes');
