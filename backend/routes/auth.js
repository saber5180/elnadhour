const express = require('express');
const router = express.Router();
const { login, getProfile, loginValidation } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', ...loginValidation, login);

// GET /api/auth/profile (protected)
router.get('/profile', authMiddleware, getProfile);

module.exports = router;