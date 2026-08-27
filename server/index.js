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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'College Attendance API Server Running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'College Attendance API running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🎓 College Attendance API Server`);
  console.log(`✅ Running at http://localhost:${PORT}`);
  console.log(`\n📋 Demo Login Credentials:`);
  console.log(`   Admin:   admin@college.edu    / password`);
  console.log(`   Faculty: anand@college.edu    / password`);
  console.log(`   Student: arjun@student.edu    / password\n`);
});
