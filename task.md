# College Attendance Management System — Tasks

## Phase 1 — Project Scaffolding
- [x] Create server/ directory structure
- [x] Create client/ directory with Vite + React + Tailwind CSS

## Phase 2 — Backend (Express + lowdb API)
- [x] server/package.json
- [x] server/index.js
- [x] server/middleware/auth.js (JWT verify + roleGuard)
- [x] server/middleware/db.js (lowdb file adapter)
- [x] server/data/db.json (seed dataset)
- [x] server/routes/auth.js (login + demo-login)
- [x] server/routes/attendance.js (roster, session save, historical edit, analytics)
- [x] server/routes/users.js (CRUD for students, faculty, admins)
- [x] server/routes/courses.js (CRUD for courses, departments, sections)
- [x] server/routes/leaves.js (submit & approve/reject leave/OD)
- [x] server/routes/audit.js (filtered audit log)
- [x] server/routes/settings.js (institution & threshold settings)

## Phase 3 — Frontend (React 18 + Tailwind CSS)
- [x] App.jsx (Role-based router shell)
- [x] AuthContext, AppContext, ToastContext
- [x] Shared UI components (Sidebar, Modal, StatusBadge, StatCard, SearchBar, SelectField, ConfirmDialog)
- [x] LoginPage (Interactive demo cards + real credentials form)

### Faculty / Staff Dashboard (100% Complete)
- [x] FacultyDashboard (Overview, courses, recent sessions, pending leaves)
- [x] MarkAttendance (Dept, course, section, date selection + P/A/L/OD toggles + bulk mark + search)
- [x] AttendanceHistory (Unlimited past session edits, no session lock, automatic audit generation)
- [x] ClassAnalytics (Recharts bar/pie charts, low-attendance alerts <75%, CSV export)
- [x] FacultyLeaves (Student leave & OD request review)
- [x] FacultyAuditLog (Personal modification history)

### Student Dashboard (100% Complete)
- [x] StudentDashboard (Overall % circular gauge, 4-stat breakdown, subject cards, recent attendance)
- [x] StudentOverview (Bar chart by subject, monthly trend, detailed subject breakdown table)
- [x] AttendanceLog (Date-wise log per subject with updated-by-faculty indicators)
- [x] LeaveApplication (Leave & OD application form + submission status history)

### Admin Dashboard (100% Complete)
- [x] AdminDashboard (Overview cards, department breakdown cards, live system audit feed)
- [x] UserManagement (CRUD for Students, Faculty, Admins with search and filters)
- [x] CourseManagement (CRUD for Courses, Departments, HOD assignments)
- [x] AdminAuditLog (Master audit log with CSV export)
- [x] AdminLeaves (System-wide leave request approval)
- [x] SystemSettings (Mandatory percentage threshold config, master PDF report download)
