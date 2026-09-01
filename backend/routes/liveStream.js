const express = require('express');
const router = express.Router();
const {
  getLiveStatus,
  startLiveStream,
  endLiveStream,
  updateViewerCount
} = require('../controllers/liveStreamController');
const authMiddleware = require('../middleware/auth');

// GET /api/live/status (public)
router.get('/status', getLiveStatus);

// POST /api/live/start (admin only)
router.post('/start', authMiddleware, startLiveStream);

// POST /api/live/end (admin only)
router.post('/end', authMiddleware, endLiveStream);

// POST /api/live/:streamId/view (public)
router.post('/:streamId/view', updateViewerCount);

module.exports = router;