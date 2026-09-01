const pool = require('../config/database');
const { body, validationResult } = require('express-validator');

const subcategoryValidation = [
  body('name').isLength({ min: 1, max: 255 }).trim(),
  body('category_id').isInt({ min: 1 }),
  body('description').optional().isLength({ max: 4000 }).trim(),
];

const getSubcategories = async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT * FROM subcategories';
    const params = [];
    if (category_id) {
      query += ' WHERE category_id = $1';
      params.push(category_id);
    }
    query += ' ORDER BY sort_order ASC, id ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
};

const createSubcategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid subcategory data', details: errors.array() });
    }
    const { name, category_id, description } = req.body;
    const cat = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (cat.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    const result = await pool.query(
      'INSERT INTO subcategories (name, category_id, description) VALUES ($1, $2, $3) RETURNING *',
      [name, category_id, description || null]
    );
    res.status(201).json({ message: 'Subcategory created successfully', subcategory: result.rows[0] });
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid subcategory data', details: errors.array() });
    }
    const { id } = req.params;
    const { name, category_id, description } = req.body;
    const result = await pool.query(
      'UPDATE subcategories SET name = $1, category_id = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, category_id, description || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json({ message: 'Subcategory updated successfully', subcategory: result.rows[0] });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM subcategories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
};

module.exports = {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  subcategoryValidation,
};
