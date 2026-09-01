const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryValidation
} = require('../controllers/categoriesController');
const authMiddleware = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// GET /api/categories (public)
router.get('/', getCategories);

// GET /api/categories/:id (public)
router.get('/:id', getCategoryById);

// POST /api/categories (protected, admin only)
router.post('/', authMiddleware, upload.single('image'), categoryValidation, createCategory);

// PUT /api/categories/:id (protected, admin only)
router.put('/:id', authMiddleware, upload.single('image'), categoryValidation, updateCategory);

// DELETE /api/categories/:id (protected, admin only)
router.delete('/:id', authMiddleware, deleteCategory);

// Error handling for file uploads
router.use(handleUploadError);

module.exports = router;