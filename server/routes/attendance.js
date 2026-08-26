const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../middleware/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/attendance?courseId=&date=&section=&department=
router.get('/', authenticate, (req, res) => {
  const { courseId, date, section, department } = req.query;
  let records = db.get('attendance').value();

  if (courseId) records = records.filter(r => r.courseId === courseId);
  if (date) records = records.filter(r => r.date === date);

  // Enrich with student info
  const enriched = records.map(r => {
    const student = db.get('users').find({ id: r.studentId }).value();
    return {
      ...r,
      studentName: student ? student.name : 'Unknown',
      rollNumber: student ? student.rollNumber : '',
      studentSection: student ? student.section : '',
      studentDept: student ? student.department : '',
    };
  });

  let filtered = enriched;
  if (section) filtered = filtered.filter(r => r.studentSection === section);
  if (department) filtered = filtered.filter(r => r.studentDept === department);

  res.json(filtered);
});

// GET /api/attendance/student/:id — student's full attendance history
router.get('/student/:id', authenticate, (req, res) => {
  const { id } = req.params;
  // Students can only see their own
  if (req.user.role === 'student' && req.user.id !== id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const records = db.get('attendance').filter({ studentId: id }).value();
  const enriched = records.map(r => {
    const course = db.get('courses').find({ id: r.courseId }).value();
    const auditEntries = db.get('auditLog').filter({ attendanceId: r.id }).value();
    return {
      ...r,
      courseName: course ? course.name : 'Unknown',
      courseCode: course ? course.code : '',
      wasModified: auditEntries.length > 0,
      lastModified: auditEntries.length > 0 ? auditEntries[auditEntries.length - 1].modifiedAt : null,
    };
  });

  // Calculate stats per course
  const courses = db.get('courses').value();
  const stats = courses.map(course => {
    const courseRecs = enriched.filter(r => r.courseId === course.id);
    const total = courseRecs.length;
    const present = courseRecs.filter(r => r.status === 'present' || r.status === 'on-duty').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    const threshold = db.get('settings.attendanceThreshold').value();
    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      total,
      present,
      absent: courseRecs.filter(r => r.status === 'absent').length,
      late: courseRecs.filter(r => r.status === 'late').length,
      onDuty: courseRecs.filter(r => r.status === 'on-duty').length,
      percentage,
      isLow: percentage < threshold,
    };
  }).filter(s => s.total > 0);

  const overallTotal = enriched.length;
  const overallPresent = enriched.filter(r => r.status === 'present' || r.status === 'on-duty').length;
  const overallPercentage = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

  res.json({ records: enriched, stats, overallPercentage });
});

// GET /api/attendance/roster?courseId=&section=&date=
router.get('/roster', authenticate, requireRole('faculty', 'admin'), (req, res) => {
  const { courseId, section, date, department } = req.query;
  if (!courseId || !section) {
    return res.status(400).json({ error: 'courseId and section are required.' });
  }

  let students = db.get('users').filter({ role: 'student', section }).value();
  if (department) students = students.filter(s => s.department === department);

  const existing = db.get('attendance')
    .filter({ courseId, date: date || new Date().toISOString().split('T')[0] })
    .value();

  const roster = students.map(s => {
    const att = existing.find(a => a.studentId === s.id);
    return {
      studentId: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      section: s.section,
      status: att ? att.status : 'present',
      attendanceId: att ? att.id : null,
    };
  });

  res.json(roster);
});

// POST /api/attendance — bulk save attendance session
router.post('/', authenticate, requireRole('faculty', 'admin'), (req, res) => {
  const { courseId, date, records } = req.body;
  if (!courseId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'courseId, date, and records array are required.' });
  }

  const saved = [];
  const auditEntries = [];

  records.forEach(r => {
    const existing = db.get('attendance')
      .find({ studentId: r.studentId, courseId, date })
      .value();

    if (existing) {
      if (existing.status !== r.status) {
        // Create audit entry
        const auditEntry = {
          id: `audit-${uuidv4()}`,
          attendanceId: existing.id,
          studentId: r.studentId,
          courseId,
          date,
          oldStatus: existing.status,
          newStatus: r.status,
          modifiedBy: req.user.id,
          modifiedAt: new Date().toISOString(),
          reason: r.reason || 'Manual update',
        };
        db.get('auditLog').push(auditEntry).write();
        auditEntries.push(auditEntry);

        // Update existing
        db.get('attendance')
          .find({ id: existing.id })
          .assign({ status: r.status, markedBy: req.user.id, markedAt: new Date().toISOString() })
          .write();
        saved.push({ ...existing, status: r.status });
      } else {
        saved.push(existing);
      }
    } else {
      const newRecord = {
        id: `att-${uuidv4()}`,
        studentId: r.studentId,
        courseId,
        date,
        status: r.status,
        markedBy: req.user.id,
        markedAt: new Date().toISOString(),
      };
      db.get('attendance').push(newRecord).write();
      saved.push(newRecord);
    }
  });

  res.json({ saved, auditEntries, message: `Attendance saved for ${saved.length} students.` });
});

// PUT /api/attendance/:id — modify single historical record
router.put('/:id', authenticate, requireRole('faculty', 'admin'), (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const record = db.get('attendance').find({ id }).value();
  if (!record) return res.status(404).json({ error: 'Attendance record not found.' });

  if (record.status !== status) {
    const auditEntry = {
      id: `audit-${uuidv4()}`,
      attendanceId: id,
      studentId: record.studentId,
      courseId: record.courseId,
      date: record.date,
      oldStatus: record.status,
      newStatus: status,
      modifiedBy: req.user.id,
      modifiedAt: new Date().toISOString(),
      reason: reason || 'Manual correction',
    };
    db.get('auditLog').push(auditEntry).write();
    db.get('attendance').find({ id }).assign({ status, markedBy: req.user.id, markedAt: new Date().toISOString() }).write();
    return res.json({ record: { ...record, status }, auditEntry });
  }

  res.json({ record, message: 'No change made.' });
});

// GET /api/attendance/analytics?courseId=&section=&department=
router.get('/analytics', authenticate, requireRole('faculty', 'admin'), (req, res) => {
  const { courseId, section, department } = req.query;

  let students = db.get('users').filter({ role: 'student' }).value();
  if (section) students = students.filter(s => s.section === section);
  if (department) students = students.filter(s => s.department === department);

  const threshold = db.get('settings.attendanceThreshold').value();

  const studentStats = students.map(s => {
    let records = db.get('attendance').filter({ studentId: s.id }).value();
    if (courseId) records = records.filter(r => r.courseId === courseId);
    const total = records.length;
    const present = records.filter(r => r.status === 'present' || r.status === 'on-duty').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      studentId: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      section: s.section,
      department: s.department,
      total,
      present,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      percentage,
      isLow: percentage < threshold,
    };
  }).filter(s => s.total > 0);

  const lowAttendance = studentStats.filter(s => s.isLow);

  res.json({ students: studentStats, lowAttendance, threshold });
});

module.exports = router;
