const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../middleware/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const DEMO_USER_IDS = ['admin-001', 'admin-002', 'fac-001', 'fac-002', 'fac-003', 'fac-004', 'fac-005', 'stu-001', 'stu-002', 'stu-003', 'stu-004', 'stu-005', 'stu-006', 'stu-007', 'stu-008', 'stu-009', 'stu-010'];
const DEMO_EMAILS = [
  'admin@college.edu', 'priya.admin@college.edu', 'anand@college.edu', 'meena@college.edu',
  'suresh@college.edu', 'kavitha@college.edu', 'raman@college.edu', 'arjun@student.edu',
  'priya.s@student.edu', 'rahul@student.edu', 'deepa@student.edu', 'karthik@student.edu',
  'ananya@student.edu', 'vishnu@student.edu', 'lakshmi@student.edu', 'arun@student.edu', 'sneha@student.edu'
];

// Helper to ensure default admins exist
async function ensureAdminsExist() {
  // Prune all demo dummy accounts from server DB
  DEMO_USER_IDS.forEach(id => db.get('users').remove({ id }).write());
  DEMO_EMAILS.forEach(email => db.get('users').remove({ email }).write());

  const karthiAdmin = db.get('users').find({ email: 'karthi@gmail.com' }).value();
  if (!karthiAdmin) {
    const karthi = {
      id: "admin-karthi",
      name: "karthi",
      email: "karthi@gmail.com",
      password: await bcrypt.hash("karthi1234", 10),
      role: "admin",
      department: "Administration",
      phone: "9876543219",
      createdAt: new Date().toISOString()
    };
    db.get('users').unshift(karthi).write();
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const query = email.toLowerCase().trim();

    // Auto-restore admin if matching credentials
    if ((query === 'karthi@gmail.com' || query === 'karthi') && password === 'karthi1234') {
      let karthi = db.get('users').find({ email: 'karthi@gmail.com' }).value();
      if (!karthi) {
        karthi = {
          id: "admin-karthi",
          name: "karthi",
          email: "karthi@gmail.com",
          password: await bcrypt.hash("karthi1234", 10),
          role: "admin",
          department: "Administration",
          phone: "9876543219",
          createdAt: new Date().toISOString()
        };
        db.get('users').unshift(karthi).write();
      }
    }

    let user = db.get('users').find(u => (u.email && u.email.toLowerCase() === query) || (u.name && u.name.toLowerCase() === query)).value();
    if (!user) {
      await ensureAdminsExist();
      user = db.get('users').find(u => (u.email && u.email.toLowerCase() === query) || (u.name && u.name.toLowerCase() === query)).value();
    }

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
router.post('/demo-login', async (req, res) => {
  const { role } = req.body;
  await ensureAdminsExist();

  let user = null;
  if (role === 'admin') {
    user = db.get('users').find({ email: 'karthi@gmail.com' }).value() ||
           db.get('users').find({ email: 'admin@college.edu' }).value() ||
           db.get('users').find({ role: 'admin' }).value();
  } else if (role === 'faculty') {
    user = db.get('users').find({ email: 'anand@college.edu' }).value() ||
           db.get('users').find({ role: 'faculty' }).value();
  } else if (role === 'student') {
    user = db.get('users').find({ email: 'arjun@student.edu' }).value() ||
           db.get('users').find({ role: 'student' }).value();
  }

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

function normalizeDob(str) {
  if (!str) return '';
  const clean = str.trim().replace(/\s+/g, '');
  const ddmmyyyy = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }
  const yyyymmdd = clean.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const year = yyyymmdd[1];
    const month = yyyymmdd[2].padStart(2, '0');
    const day = yyyymmdd[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (/^\d{8}$/.test(clean)) {
    if (clean.startsWith('19') || clean.startsWith('20')) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
    } else {
      return `${clean.slice(4, 8)}-${clean.slice(2, 4)}-${clean.slice(0, 2)}`;
    }
  }
  return clean;
}

// POST /api/auth/student-login (student logs in by rollNumber & date of birth)
router.post('/student-login', (req, res) => {
  const { rollNumber, dob } = req.body;
  if (!rollNumber) return res.status(400).json({ error: 'Roll number is required.' });
  if (!dob) return res.status(400).json({ error: 'Date of Birth (DOB) is required.' });

  const query = rollNumber.trim().toUpperCase();
  const inputDob = dob.trim();

  const student = db.get('users').find(u => 
    u.role === 'student' && 
    ((u.rollNumber && u.rollNumber.trim().toUpperCase() === query) ||
     (u.email && u.email.trim().toUpperCase() === query))
  ).value();

  if (!student) return res.status(404).json({ error: `Student with Roll / Register Number "${query}" not found.` });

  if (student.dob && student.dob.trim()) {
    const normStored = normalizeDob(student.dob);
    const normInput = normalizeDob(inputDob);
    const rawStoredDigits = (student.dob || '').replace(/\D/g, '');
    const rawInputDigits = (inputDob || '').replace(/\D/g, '');

    const isMatch = (normStored === normInput) || 
                    (rawStoredDigits === rawInputDigits) ||
                    (normStored && normInput && normStored.replace(/-/g, '') === normInput.replace(/-/g, ''));

    if (!isMatch) {
      return res.status(401).json({ error: `Date of Birth does not match records for Roll No "${query}".` });
    }
  }

  const payload = {
    id: student.id,
    name: student.name,
    email: student.email,
    role: 'student',
    department: student.department,
    rollNumber: student.rollNumber,
    dob: student.dob || inputDob,
    section: student.section || null,
    year: student.year || null,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: payload });
});

module.exports = router;
