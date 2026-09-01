const pool = require('../config/database');

const createTables = async () => {
  console.log('🚀 Starting database migration...');

  // Create users table (for admin authentication)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Users table created');

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
  console.log('✅ Live streams table created');

  // Create categories table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Categories table created');

  await pool.query(`
    ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS description TEXT
  `);
  await pool.query(`
    ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0
  `);

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
  console.log('✅ Subcategories table created');

  // Create menu_items table
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
  console.log('✅ Menu items table created');

  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT FALSE
  `);
  console.log('✅ menu_items.is_recommended column ensured');

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
  console.log('✅ menu_items promo/new columns ensured');

  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL
  `);
  await pool.query(`
    ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0
  `);
  console.log('✅ menu_items subcategory/sort columns ensured');

  console.log('🎉 Database migration completed successfully!');
};

(async () => {
  try {
    await createTables();
    process.exitCode = 0;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    try {
      await pool.end();
    } catch (_) {
      /* ignore */
    }
  }
  process.exit(process.exitCode ?? 1);
})();