const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../middleware/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses
router.get('/', authenticate, (req, res) => {
  const { department } = req.query;
  let courses = db.get('courses').value();
  if (department) courses = courses.filter(c => c.department === department);
  res.json(courses);
});

// GET /api/courses/departments
router.get('/departments', authenticate, (req, res) => {
  res.json(db.get('departments').value());
});

// GET /api/courses/sections
router.get('/sections', authenticate, (req, res) => {
  const { department } = req.query;
  let sections = db.get('sections').value();
  if (department) sections = sections.filter(s => s.department === department);
  res.json(sections);
});

// GET /api/courses/:id
router.get('/:id', authenticate, (req, res) => {
  const course = db.get('courses').find({ id: req.params.id }).value();
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  res.json(course);
});

// POST /api/courses
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { name, code, department, credits, faculty } = req.body;
  if (!name || !code || !department) {
    return res.status(400).json({ error: 'name, code, department are required.' });
  }
  const newCourse = {
    id: code,
    name, code, department, credits: credits || 3, faculty: faculty || null,
  };
  db.get('courses').push(newCourse).write();
  res.status(201).json(newCourse);
});

// PUT /api/courses/:id
router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const course = db.get('courses').find({ id }).value();
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  const updates = { ...req.body };
  delete updates.id;
  db.get('courses').find({ id }).assign(updates).write();
  res.json(db.get('courses').find({ id }).value());
});

// DELETE /api/courses/:id
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  db.get('courses').remove({ id }).write();
  res.json({ message: 'Course deleted.' });
});

// POST /api/courses/departments
router.post('/departments', authenticate, requireRole('admin'), (req, res) => {
  const { name, code, hod } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'name and code are required.' });
  const newDept = { id: `dept-${uuidv4().slice(0, 6)}`, name, code, hod: hod || null };
  db.get('departments').push(newDept).write();
  res.status(201).json(newDept);
});

module.exports = router;
