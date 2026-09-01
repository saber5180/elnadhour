const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createReservation,
  getReservations,
  updateReservationStatus,
  reservationValidation,
  statusValidation,
} = require('../controllers/reservationsController');

router.post('/', reservationValidation, createReservation);
router.get('/', authMiddleware, getReservations);
router.patch('/:id/status', authMiddleware, statusValidation, updateReservationStatus);

module.exports = router;
