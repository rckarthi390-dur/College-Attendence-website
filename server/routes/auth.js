const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../middleware/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.get('users').find({ email: email.toLowerCase().trim() }).value();
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber || null,
      employeeId: user.employeeId || null,
      section: user.section || null,
      year: user.year || null,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: payload,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/demo-login (quick demo without real password check)
router.post('/demo-login', (req, res) => {
  const { role } = req.body;
  const roleMap = {
    admin: 'admin@college.edu',
    faculty: 'anand@college.edu',
    student: 'arjun@student.edu',
  };
  const email = roleMap[role];
  if (!email) return res.status(400).json({ error: 'Invalid role for demo login.' });

  const user = db.get('users').find({ email }).value();
  if (!user) return res.status(404).json({ error: 'Demo user not found.' });

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    rollNumber: user.rollNumber || null,
    employeeId: user.employeeId || null,
    section: user.section || null,
    year: user.year || null,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: payload });
});

module.exports = router;
