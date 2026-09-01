const pool = require('../config/database');

/**
 * Crée les tables manquantes au démarrage (évite les 500 si la migration n’a pas été lancée).
 * Ordre : users → live_streams (FK users) → categories → menu_items → hero_images.
 */
async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureLiveStreamsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS live_streams (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL DEFAULT 'Live depuis El Nadhour',
      stream_url VARCHAR(500),
      is_active BOOLEAN DEFAULT FALSE,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP NULL,
      viewer_count INTEGER DEFAULT 0,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureCategoriesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS description TEXT
  `);
  await pool.query(`
    ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0
  `);
}

async function ensureSubcategoriesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureMenuItemsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image_url VARCHAR(500),
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT FALSE
  `);
  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE
  `);
  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS promotion_text VARCHAR(255)
  `);
  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS promotion_price DECIMAL(10, 2)
  `);
  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL
  `);
  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0
  `);
}

async function ensureHeroImagesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hero_images (
      id SERIAL PRIMARY KEY,
      image_url VARCHAR(500) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureAmbienceFoldersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ambience_folders (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      cover_image_url VARCHAR(500),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureAmbienceStoriesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ambience_stories (
      id SERIAL PRIMARY KEY,
      folder_id INTEGER NOT NULL REFERENCES ambience_folders(id) ON DELETE CASCADE,
      image_url VARCHAR(500) NOT NULL,
      media_type VARCHAR(10) NOT NULL DEFAULT 'image',
      caption VARCHAR(500),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    ALTER TABLE ambience_stories
    ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) NOT NULL DEFAULT 'image'
  `);
}

async function ensureReservationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(255),
      phone VARCHAR(50) NOT NULL,
      reservation_date DATE NOT NULL,
      reservation_time TIME NOT NULL,
      guest_count INTEGER NOT NULL,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      notes TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureSchema() {
  await ensureUsersTable();
  await ensureLiveStreamsTable();
  await ensureCategoriesTable();
  await ensureSubcategoriesTable();
  await ensureMenuItemsTable();
  await ensureHeroImagesTable();
  await ensureAmbienceFoldersTable();
  await ensureAmbienceStoriesTable();
  await ensureReservationsTable();
}

module.exports = {
  ensureSchema,
  ensureUsersTable,
  ensureLiveStreamsTable,
  ensureCategoriesTable,
  ensureSubcategoriesTable,
  ensureMenuItemsTable,
  ensureHeroImagesTable,
  ensureAmbienceFoldersTable,
  ensureAmbienceStoriesTable,
  ensureReservationsTable,
};
