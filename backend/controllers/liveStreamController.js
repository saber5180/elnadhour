const pool = require('../config/database');

// Get current live stream status
const getLiveStatus = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, stream_url, is_active, started_at, viewer_count
      FROM live_streams 
      WHERE is_active = true 
      ORDER BY started_at DESC 
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      res.json({
        isLive: true,
        stream: result.rows[0]
      });
    } else {
      res.json({
        isLive: false,
        stream: null
      });
    }
  } catch (error) {
    console.error('Get live status error:', error);
    res.status(500).json({ error: 'Failed to get live status' });
  }
};

// Start live stream (admin only)
const startLiveStream = async (req, res) => {
  try {
    const { title, stream_url } = req.body;
    const userId = req.user.id;

    // End any existing active streams
    await pool.query(`
      UPDATE live_streams 
      SET is_active = false, ended_at = CURRENT_TIMESTAMP 
      WHERE is_active = true
    `);

    // Create new live stream
    const result = await pool.query(`
      INSERT INTO live_streams (title, stream_url, is_active, created_by, started_at) 
      VALUES ($1, $2, true, $3, CURRENT_TIMESTAMP) 
      RETURNING *
    `, [
      title || 'Live depuis El Nadhour',
      stream_url || '',
      userId
    ]);

    res.json({
      message: 'Live stream started',
      stream: result.rows[0]
    });
  } catch (error) {
    console.error('Start live stream error:', error);
    res.status(500).json({ error: 'Failed to start live stream' });
  }
};

// End live stream (admin only)
const endLiveStream = async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE live_streams 
      SET is_active = false, ended_at = CURRENT_TIMESTAMP 
      WHERE is_active = true 
      RETURNING *
    `);

    if (result.rows.length > 0) {
      res.json({
        message: 'Live stream ended',
        stream: result.rows[0]
      });
    } else {
      res.status(404).json({ error: 'No active live stream found' });
    }
  } catch (error) {
    console.error('End live stream error:', error);
    res.status(500).json({ error: 'Failed to end live stream' });
  }
};

// Update viewer count
const updateViewerCount = async (req, res) => {
  try {
    const { streamId } = req.params;
    
    const result = await pool.query(`
      UPDATE live_streams 
      SET viewer_count = viewer_count + 1 
      WHERE id = $1 AND is_active = true 
      RETURNING viewer_count
    `, [streamId]);

    if (result.rows.length > 0) {
      res.json({ viewer_count: result.rows[0].viewer_count });
    } else {
      res.status(404).json({ error: 'Live stream not found' });
    }
  } catch (error) {
    console.error('Update viewer count error:', error);
    res.status(500).json({ error: 'Failed to update viewer count' });
  }
};

module.exports = {
  getLiveStatus,
  startLiveStream,
  endLiveStream,
  updateViewerCount
};