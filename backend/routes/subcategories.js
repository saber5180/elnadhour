const express = require('express');
const router = express.Router();
const {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  subcategoryValidation,
} = require('../controllers/subcategoriesController');
const authMiddleware = require('../middleware/auth');

router.get('/', getSubcategories);
router.post('/', authMiddleware, subcategoryValidation, createSubcategory);
router.put('/:id', authMiddleware, subcategoryValidation, updateSubcategory);
router.delete('/:id', authMiddleware, deleteSubcategory);

module.exports = router;
