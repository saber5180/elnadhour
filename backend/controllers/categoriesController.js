const pool = require('../config/database');
const { body, validationResult } = require('express-validator');
const { uploadImageAndGetUrl } = require('../services/mediaStorage');

// Validation rules for category creation/update
const categoryValidation = [
  body('name').isLength({ min: 1, max: 255 }).trim()
];

// Get all categories
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
    );
    const categories = result.rows;
    if (categories.length === 0) {
      return res.json([]);
    }

    const subs = await pool.query(
      'SELECT * FROM subcategories ORDER BY sort_order ASC, id ASC'
    );
    const byCat = new Map();
    for (const sub of subs.rows) {
      const list = byCat.get(sub.category_id) || [];
      list.push(sub);
      byCat.set(sub.category_id, list);
    }

    res.json(
      categories.map((c) => ({
        ...c,
        subcategories: byCat.get(c.id) || [],
      }))
    );
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subs = await pool.query(
      'SELECT * FROM subcategories WHERE category_id = $1 ORDER BY sort_order ASC, id ASC',
      [id]
    );

    res.json({
      ...result.rows[0],
      subcategories: subs.rows,
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid category data', details: errors.array() });
    }

    const { name, description } = req.body;
    let image_url = req.body.image_url || null;

    // If file was uploaded, use the uploaded file path
    if (req.file) {
      image_url = await uploadImageAndGetUrl(req.file, 'elnadhour/categories');
    }

    const result = await pool.query(
      'INSERT INTO categories (name, image_url, description) VALUES ($1, $2, $3) RETURNING *',
      [name, image_url, description || null]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid category data', details: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const existingResult = await pool.query('SELECT image_url FROM categories WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let image_url = req.body.image_url || existingResult.rows[0].image_url;

    if (req.file) {
      image_url = await uploadImageAndGetUrl(req.file, 'elnadhour/categories');
    }

    const result = await pool.query(
      'UPDATE categories SET name = $1, image_url = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, image_url, description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryValidation
};