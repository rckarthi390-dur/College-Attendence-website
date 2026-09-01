const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const usersRoutes = require('./routes/users');
const coursesRoutes = require('./routes/courses');
const leavesRoutes = require('./routes/leaves');
const auditRoutes = require('./routes/audit');
const settingsRoutes = require('./routes/settings');
const departmentsRoutes = require('./routes/departments');
const db = require('./middleware/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Full Database Synchronization Endpoints (Cross-Device Cloud Sync)
app.get('/api/sync', (req, res) => {
  try {
    const data = db.getState();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read database state' });
  }
});

app.post('/api/sync', (req, res) => {
  try {
    const incoming = req.body;
    if (incoming && typeof incoming === 'object' && incoming.users) {
      db.setState(incoming).write();
      res.json({ success: true, message: 'Database state synchronized successfully' });
    } else {
      res.status(400).json({ error: 'Invalid database payload' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to write database state' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'College Attendance API running', timestamp: new Date().toISOString() });
});

// Serve static frontend web app for all non-API requests
const fs = require('fs');
const rootIndexPath = path.join(__dirname, '../index.html');
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}
app.use(express.static(path.join(__dirname, '..')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  if (fs.existsSync(rootIndexPath)) {
    return res.sendFile(rootIndexPath);
  }
  if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  res.send('College Attendance Portal Server Running');
});

app.listen(PORT, () => {
  console.log(`\n🎓 College Attendance API Server`);
  console.log(`✅ Running at http://localhost:${PORT}`);
  console.log(`\n📋 Demo Login Credentials:`);
  console.log(`   Admin:   admin@college.edu    / password`);
  console.log(`   Faculty: anand@college.edu    / password`);
  console.log(`   Student: arjun@student.edu    / password\n`);
});
