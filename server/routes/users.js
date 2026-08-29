const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../middleware/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/users?role=student|faculty|admin&department=&section=
router.get('/', authenticate, requireRole('admin', 'faculty'), (req, res) => {
  const { role, department, section } = req.query;
  let users = db.get('users').value().map(u => {
    const { password, ...safe } = u;
    return safe;
  });
  if (role) users = users.filter(u => u.role === role);
  if (department) users = users.filter(u => u.department === department);
  if (section) users = users.filter(u => u.section === section);
  res.json(users);
});

// GET /api/users/me
router.get('/me', authenticate, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password, ...safe } = user;
  res.json(safe);
});

// GET /api/users/:id
router.get('/:id', authenticate, (req, res) => {
  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password, ...safe } = user;
  res.json(safe);
});

// POST /api/users — create new user
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { name, email, password: rawPwd, role, department, section, year, rollNumber, employeeId, phone } = req.body;
  if (!name || !email || !rawPwd || !role) {
    return res.status(400).json({ error: 'name, email, password, role are required.' });
  }
  const exists = db.get('users').find({ email: email.toLowerCase() }).value();
  if (exists) return res.status(409).json({ error: 'Email already registered.' });

  const hashed = await bcrypt.hash(rawPwd, 10);
  const newUser = {
    id: `usr-${uuidv4().slice(0, 8)}`,
    name, email: email.toLowerCase(), password: hashed,
    role, department: department || '', phone: phone || '',
    section: section || null, year: year || null,
    rollNumber: rollNumber || null, employeeId: employeeId || null,
    courses: [],
    createdAt: new Date().toISOString(),
  };
  db.get('users').push(newUser).write();
  const { password, ...safe } = newUser;
  res.status(201).json(safe);
});

// PUT /api/users/:id — update user
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const updates = { ...req.body };
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  } else {
    delete updates.password;
  }
  delete updates.id;

  db.get('users').find({ id }).assign(updates).write();
  const updated = db.get('users').find({ id }).value();
  const { password, ...safe } = updated;
  res.json(safe);
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.email === 'karthi@gmail.com') {
    return res.status(403).json({ error: 'Primary administrator account cannot be deleted.' });
  }

  db.get('users').remove({ id: req.params.id }).write();
  res.json({ message: 'User deleted successfully.' });
});

module.exports = router;
