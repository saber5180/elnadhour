/**
 * Ajoute la table hero_images pour les photos de fond de l'accueil.
 * Usage: node scripts/add-hero-images.js (depuis cafe-app/backend)
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cafe_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  console.log('🖼️  Adding hero_images table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hero_images (
      id SERIAL PRIMARY KEY,
      image_url VARCHAR(500) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ hero_images ready');
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
