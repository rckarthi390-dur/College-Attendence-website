const express = require('express');
const db = require('../middleware/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings
router.get('/', authenticate, (req, res) => {
  res.json(db.get('settings').value());
});

// PUT /api/settings
router.put('/', authenticate, requireRole('admin'), (req, res) => {
  const updates = req.body;
  db.set('settings', { ...db.get('settings').value(), ...updates }).write();
  res.json(db.get('settings').value());
});

module.exports = router;
