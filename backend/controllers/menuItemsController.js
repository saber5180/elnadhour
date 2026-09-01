const pool = require('../config/database');
const { body, validationResult } = require('express-validator');
const { uploadImageAndGetUrl } = require('../services/mediaStorage');

// Validation rules for menu item creation/update
const parseRecommended = (value) =>
  value === true ||
  value === 'true' ||
  value === '1' ||
  value === 'on';

const parseFlag = (value) =>
  value === true ||
  value === 'true' ||
  value === '1' ||
  value === 'on';

const menuItemValidation = [
  body('name').isLength({ min: 1, max: 255 }).trim(),
  body('description').optional().isLength({ max: 4000 }).trim(),
  body('price').isFloat({ min: 0 }),
  body('category_id').isInt({ min: 1 }),
  body('promotion_text').optional({ checkFalsy: true }).isLength({ max: 255 }).trim(),
  body('promotion_price').optional({ checkFalsy: true }).isFloat({ min: 0 })
];

// Get all menu items with optional category filter
const getMenuItems = async (req, res) => {
  try {
    const { category_id, subcategory_id } = req.query;
    let query = `
      SELECT mi.*, c.name as category_name, sc.name as subcategory_name
      FROM menu_items mi 
      LEFT JOIN categories c ON mi.category_id = c.id
      LEFT JOIN subcategories sc ON mi.subcategory_id = sc.id
    `;
    let params = [];
    const filters = [];

    if (category_id) {
      params.push(category_id);
      filters.push(`mi.category_id = $${params.length}`);
    }
    if (subcategory_id) {
      params.push(subcategory_id);
      filters.push(`mi.subcategory_id = $${params.length}`);
    }
    if (filters.length) {
      query += ` WHERE ${filters.join(' AND ')}`;
    }

    query += ' ORDER BY mi.sort_order ASC, mi.id ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// Get menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT mi.*, c.name as category_name, sc.name as subcategory_name
       FROM menu_items mi 
       LEFT JOIN categories c ON mi.category_id = c.id 
       LEFT JOIN subcategories sc ON mi.subcategory_id = sc.id
       WHERE mi.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

// Create new menu item
const createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid menu item data', details: errors.array() });
    }

    const { name, description, price, category_id } = req.body;
    const subcategory_id = req.body.subcategory_id ? parseInt(req.body.subcategory_id, 10) : null;
    const is_recommended = parseRecommended(req.body.is_recommended);
    const is_new = parseFlag(req.body.is_new);
    const promotion_text = req.body.promotion_text?.trim() || null;
    const promotion_price = req.body.promotion_price ? parseFloat(req.body.promotion_price) : null;
    let image_url = req.body.image_url || null;

    // If file was uploaded, use the uploaded file path
    if (req.file) {
      image_url = await uploadImageAndGetUrl(req.file, 'elnadhour/menu-items');
    }

    // Verify category exists
    const categoryResult = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    if (subcategory_id) {
      const subResult = await pool.query(
        'SELECT id FROM subcategories WHERE id = $1 AND category_id = $2',
        [subcategory_id, category_id]
      );
      if (subResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid subcategory ID' });
      }
    }

    const result = await pool.query(
      'INSERT INTO menu_items (name, description, price, category_id, image_url, is_recommended, is_new, promotion_text, promotion_price, subcategory_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [name, description || null, price, category_id, image_url, is_recommended, is_new, promotion_text, promotion_price, subcategory_id]
    );

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem: result.rows[0]
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid menu item data', details: errors.array() });
    }

    const { id } = req.params;
    const { name, description, price, category_id } = req.body;
    const subcategory_id = req.body.subcategory_id ? parseInt(req.body.subcategory_id, 10) : null;
    const is_recommended = parseRecommended(req.body.is_recommended);
    const is_new = parseFlag(req.body.is_new);
    const promotion_text = req.body.promotion_text?.trim() || null;
    const promotion_price = req.body.promotion_price ? parseFloat(req.body.promotion_price) : null;

    const existingResult = await pool.query('SELECT image_url FROM menu_items WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    let image_url = req.body.image_url || existingResult.rows[0].image_url;

    if (req.file) {
      image_url = await uploadImageAndGetUrl(req.file, 'elnadhour/menu-items');
    }

    // Verify category exists
    const categoryResult = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    if (subcategory_id) {
      const subResult = await pool.query(
        'SELECT id FROM subcategories WHERE id = $1 AND category_id = $2',
        [subcategory_id, category_id]
      );
      if (subResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid subcategory ID' });
      }
    }

    const result = await pool.query(
      'UPDATE menu_items SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5, is_recommended = $6, is_new = $7, promotion_text = $8, promotion_price = $9, subcategory_id = $10 WHERE id = $11 RETURNING *',
      [name, description || null, price, category_id, image_url, is_recommended, is_new, promotion_text, promotion_price, subcategory_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({
      message: 'Menu item updated successfully',
      menuItem: result.rows[0]
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

// Search menu items
const searchMenuItems = async (req, res) => {
  try {
    const { q } = req.query; // search query
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q.toLowerCase()}%`;
    
    const result = await pool.query(
      `SELECT mi.*, c.name as category_name, sc.name as subcategory_name
       FROM menu_items mi 
       LEFT JOIN categories c ON mi.category_id = c.id 
       LEFT JOIN subcategories sc ON mi.subcategory_id = sc.id
       WHERE LOWER(mi.name) LIKE $1 OR LOWER(mi.description) LIKE $1 OR LOWER(c.name) LIKE $1 OR LOWER(COALESCE(sc.name, '')) LIKE $1
       ORDER BY mi.sort_order ASC, mi.name ASC`,
      [searchTerm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search menu items error:', error);
    res.status(500).json({ error: 'Failed to search menu items' });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  searchMenuItems,
  menuItemValidation
};