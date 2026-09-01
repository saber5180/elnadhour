const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  searchMenuItems,
  menuItemValidation
} = require('../controllers/menuItemsController');
const authMiddleware = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// GET /api/menu-items (public)
router.get('/', getMenuItems);

// GET /api/menu-items/search (public)
router.get('/search', searchMenuItems);

// GET /api/menu-items/:id (public)
router.get('/:id', getMenuItemById);

// POST /api/menu-items (protected, admin only)
router.post('/', authMiddleware, upload.single('image'), menuItemValidation, createMenuItem);

// PUT /api/menu-items/:id (protected, admin only)
router.put('/:id', authMiddleware, upload.single('image'), menuItemValidation, updateMenuItem);

// DELETE /api/menu-items/:id (protected, admin only)
router.delete('/:id', authMiddleware, deleteMenuItem);

// Error handling for file uploads
router.use(handleUploadError);

module.exports = router;