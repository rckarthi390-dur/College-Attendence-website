const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../middleware/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaves?studentId=&status=
router.get('/', authenticate, (req, res) => {
  const { studentId, status } = req.query;
  let leaves = db.get('leaves').value();

  if (req.user.role === 'student') {
    leaves = leaves.filter(l => l.studentId === req.user.id);
  } else if (studentId) {
    leaves = leaves.filter(l => l.studentId === studentId);
  }

  if (status) leaves = leaves.filter(l => l.status === status);

  const enriched = leaves.map(l => {
    const student = db.get('users').find({ id: l.studentId }).value();
    const reviewer = l.reviewedBy ? db.get('users').find({ id: l.reviewedBy }).value() : null;
    return {
      ...l,
      studentName: student ? student.name : 'Unknown',
      rollNumber: student ? student.rollNumber : '',
      reviewerName: reviewer ? reviewer.name : null,
    };
  });

  res.json(enriched);
});

// POST /api/leaves — submit leave/OD request
router.post('/', authenticate, requireRole('student'), (req, res) => {
  const { type, fromDate, toDate, reason } = req.body;
  if (!type || !fromDate || !toDate || !reason) {
    return res.status(400).json({ error: 'type, fromDate, toDate, reason are required.' });
  }
  const newLeave = {
    id: `leave-${uuidv4()}`,
    studentId: req.user.id,
    type,
    fromDate,
    toDate,
    reason,
    status: 'pending',
    appliedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
  };
  db.get('leaves').push(newLeave).write();
  res.status(201).json(newLeave);
});

// PUT /api/leaves/:id — approve/reject
router.put('/:id', authenticate, requireRole('faculty', 'admin'), (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be "approved" or "rejected".' });
  }
  const leave = db.get('leaves').find({ id }).value();
  if (!leave) return res.status(404).json({ error: 'Leave not found.' });

  db.get('leaves').find({ id }).assign({
    status,
    comment: comment || null,
    reviewedBy: req.user.id,
    reviewedAt: new Date().toISOString(),
  }).write();

  res.json(db.get('leaves').find({ id }).value());
});

// DELETE /api/leaves/:id — student cancels pending leave
router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const leave = db.get('leaves').find({ id }).value();
  if (!leave) return res.status(404).json({ error: 'Leave not found.' });
  if (req.user.role === 'student' && leave.studentId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  db.get('leaves').remove({ id }).write();
  res.json({ message: 'Leave request deleted.' });
});

module.exports = router;
