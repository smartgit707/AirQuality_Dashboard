require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runSeed() {
  console.log('--- Initializing PostgreSQL Schema and Historical Seed Data ---');
  console.log(`Connecting to ${process.env.DATABASE_USER}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}...`);

  const pool = new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    database: process.env.DATABASE_NAME || 'air_quality_db',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
  });

  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully.');
    
    console.log('Executing schema.sql...');
    await client.query(sql);
    console.log('Table `air_quality_records` created and sample records inserted.');

    const res = await client.query('SELECT city, COUNT(*) as count FROM air_quality_records GROUP BY city ORDER BY city;');
    console.log('Sample Data Summary:');
    res.rows.forEach(r => console.log(`  - ${r.city}: ${r.count} records`));

    client.release();
    await pool.end();
    console.log('Database initialization complete!');
  } catch (err) {
    console.error('Database initialization error:', err.message);
    process.exit(1);
  }
}

runSeed();
