const pool = require('../config/database');
const { uploadImageAndGetUrl } = require('../services/mediaStorage');

const getHeroImages = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, image_url, sort_order, created_at FROM hero_images ORDER BY sort_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    // Table absente ou autre erreur : ne pas casser la page d’accueil
    if (error.code === '42P01') {
      return res.json([]);
    }
    console.error('getHeroImages:', error);
    res.json([]);
  }
};

const createHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file required' });
    }
    const image_url = await uploadImageAndGetUrl(req.file, 'elnadhour/hero');
    const maxRow = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM hero_images');
    const sort_order = maxRow.rows[0].n;
    const result = await pool.query(
      'INSERT INTO hero_images (image_url, sort_order) VALUES ($1, $2) RETURNING *',
      [image_url, sort_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createHeroImage:', error);
    res.status(500).json({ error: 'Failed to save hero image' });
  }
};

const deleteHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hero_images WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ message: 'Deleted', id: parseInt(id, 10) });
  } catch (error) {
    console.error('deleteHeroImage:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
};

module.exports = {
  getHeroImages,
  createHeroImage,
  deleteHeroImage,
};
