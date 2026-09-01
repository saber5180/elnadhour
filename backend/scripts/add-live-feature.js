const pool = require('../config/database');

const addLiveFeature = async () => {
  try {
    console.log('🔴 Adding live stream feature to database...');

    // Add live_streams table
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

    // Insert default live stream record
    await pool.query(`
      INSERT INTO live_streams (title, is_active, created_by) 
      SELECT 'Live depuis El Nadhour', false, id 
      FROM users LIMIT 1
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Default live stream record created');

    console.log('🎉 Live stream feature added successfully!');
  } catch (error) {
    console.error('❌ Error adding live feature:', error.message);
  } finally {
    await pool.end();
  }
};

addLiveFeature();