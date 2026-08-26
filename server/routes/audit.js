const express = require('express');
const db = require('../middleware/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/audit?facultyId=&courseId=&fromDate=&toDate=
router.get('/', authenticate, requireRole('admin', 'faculty'), (req, res) => {
  const { facultyId, courseId, fromDate, toDate } = req.query;
  let logs = db.get('auditLog').value();

  // Faculty can only see their own
  if (req.user.role === 'faculty') {
    logs = logs.filter(l => l.modifiedBy === req.user.id);
  } else {
    if (facultyId) logs = logs.filter(l => l.modifiedBy === facultyId);
  }

  if (courseId) logs = logs.filter(l => l.courseId === courseId);
  if (fromDate) logs = logs.filter(l => l.date >= fromDate);
  if (toDate) logs = logs.filter(l => l.date <= toDate);

  const enriched = logs.map(l => {
    const faculty = db.get('users').find({ id: l.modifiedBy }).value();
    const student = db.get('users').find({ id: l.studentId }).value();
    const course = db.get('courses').find({ id: l.courseId }).value();
    return {
      ...l,
      facultyName: faculty ? faculty.name : 'Unknown',
      studentName: student ? student.name : 'Unknown',
      rollNumber: student ? student.rollNumber : '',
      courseName: course ? course.name : 'Unknown',
    };
  }).sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

  res.json(enriched);
});

module.exports = router;
