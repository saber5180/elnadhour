const pool = require('../config/database');
const { body, validationResult } = require('express-validator');

const reservationValidation = [
  body('customer_name').optional({ checkFalsy: true }).isLength({ max: 255 }).trim(),
  body('phone').isLength({ min: 6, max: 50 }).trim(),
  body('reservation_date').isISO8601().toDate(),
  body('reservation_time')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('guest_count').isInt({ min: 1, max: 50 }),
  body('notes').optional({ checkFalsy: true }).isLength({ max: 1000 }).trim(),
  body('items').optional().isArray({ max: 50 }),
  body('items.*.menu_item_id').optional().isInt({ min: 1 }),
  body('items.*.name').optional().isLength({ min: 1, max: 255 }).trim(),
  body('items.*.quantity').optional().isInt({ min: 1, max: 99 }),
  body('items.*.unit_price').optional().isFloat({ min: 0 }),
];

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && item.name && item.quantity > 0)
    .map((item) => ({
      menu_item_id: item.menu_item_id ?? null,
      name: String(item.name).trim(),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price) || 0,
    }));
}

const createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customer_name,
      phone,
      reservation_date,
      reservation_time,
      guest_count,
      notes,
      items,
    } = req.body;

    const reservationDate = new Date(reservation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reservationDate.setHours(0, 0, 0, 0);
    if (reservationDate < today) {
      return res.status(400).json({ error: 'La date doit être aujourd’hui ou ultérieure.' });
    }

    const normalizedItems = normalizeItems(items);

    const result = await pool.query(
      `INSERT INTO reservations
        (customer_name, phone, reservation_date, reservation_time, guest_count, items, notes)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       RETURNING *`,
      [
        customer_name?.trim() || null,
        phone.trim(),
        reservation_date,
        reservation_time,
        guest_count,
        JSON.stringify(normalizedItems),
        notes?.trim() || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createReservation error:', error);
    res.status(500).json({ error: 'Impossible d’enregistrer la réservation.' });
  }
};

const getReservations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reservations ORDER BY created_at DESC, reservation_date DESC, reservation_time DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getReservations error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

const statusValidation = [
  body('status').isIn(['pending', 'confirmed', 'cancelled']),
];

const updateReservationStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('updateReservationStatus error:', error);
    res.status(500).json({ error: 'Impossible de mettre à jour la réservation.' });
  }
};

module.exports = {
  createReservation,
  getReservations,
  updateReservationStatus,
  reservationValidation,
  statusValidation,
};
