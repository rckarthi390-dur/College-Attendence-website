const express = require('express');
const db = require('../middleware/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/departments
router.get('/', (req, res) => {
  const depts = db.get('departments').value() || [];
  res.json(depts);
});

// POST /api/departments
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { name, code, hod } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Department name and code are required.' });
  }
  const id = `dept-${code.toLowerCase().replace(/\s+/g, '-')}`;
  const existing = db.get('departments').find({ name }).value();
  if (existing) {
    return res.status(400).json({ error: `Department "${name}" already exists.` });
  }
  const newDept = {
    id,
    name: name.trim(),
    code: code.trim().toUpperCase(),
    hod: hod || null
  };
  db.get('departments').push(newDept).write();
  res.status(201).json(newDept);
});

// PUT /api/departments/:id (Update HOD or details)
router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const dept = db.get('departments').find(d => d.id === id || d.name === id).value();
  if (!dept) return res.status(404).json({ error: 'Department not found.' });
  const updates = { ...req.body };
  delete updates.id;
  db.get('departments').find(d => d.id === id || d.name === id).assign(updates).write();
  res.json(db.get('departments').find(d => d.id === id || d.name === id).value());
});

// DELETE /api/departments/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const dept = db.get('departments').find(d => d.id === id || d.name === id).value();
  if (!dept) return res.status(404).json({ error: 'Department not found.' });
  db.get('departments').remove(d => d.id === id || d.name === id).write();
  res.json({ message: 'Department deleted successfully.' });
});

module.exports = router;
