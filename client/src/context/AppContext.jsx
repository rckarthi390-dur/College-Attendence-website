import { createContext, useContext, useState, useCallback } from 'react';
import { loadDB, saveDB } from '../data/seedData';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => loadDB());

  const updateDB = useCallback((updater) => {
    setDb(prev => {
      const next = updater(JSON.parse(JSON.stringify(prev)));
      saveDB(next);
      return next;
    });
  }, []);

  // ── Users ─────────────────────────────────────
  const getUsers = (filters = {}) => {
    let users = db.users;
    if (filters.role) users = users.filter(u => u.role === filters.role);
    if (filters.department) users = users.filter(u => u.department === filters.department);
    if (filters.section) users = users.filter(u => u.section === filters.section);
    return users.map(({ password, ...u }) => u);
  };

  const getUserById = (id) => {
    const u = db.users.find(u => u.id === id);
    if (!u) return null;
    const { password, ...safe } = u;
    return safe;
  };

  const addUser = (userData) => {
    const newUser = { id: `usr-${uuidv4().slice(0,8)}`, ...userData, createdAt: new Date().toISOString() };
    updateDB(d => { d.users.push(newUser); return d; });
    return newUser;
  };

  const updateUser = (id, data) => {
    updateDB(d => { 
      const idx = d.users.findIndex(u => u.id === id);
      if (idx >= 0) d.users[idx] = { ...d.users[idx], ...data };
      return d;
    });
  };

  const deleteUser = (id) => {
    updateDB(d => { d.users = d.users.filter(u => u.id !== id); return d; });
  };

  // ── Courses ────────────────────────────────────
  const getCourses = (dept) => {
    let c = db.courses;
    if (dept) c = c.filter(c => c.department === dept);
    return c;
  };

  const addCourse = (data) => {
    const c = { id: data.code || `CRS-${uuidv4().slice(0,6)}`, ...data };
    updateDB(d => { d.courses.push(c); return d; });
    return c;
  };

  const updateCourse = (id, data) => {
    updateDB(d => { const i = d.courses.findIndex(c => c.id === id); if (i >= 0) d.courses[i] = { ...d.courses[i], ...data }; return d; });
  };

  const deleteCourse = (id) => {
    updateDB(d => { d.courses = d.courses.filter(c => c.id !== id); return d; });
  };

  // ── Departments ────────────────────────────────
  const getDepartments = () => db.departments;
  const addDepartment = (data) => {
    const dept = { id: `dept-${uuidv4().slice(0,6)}`, ...data };
    updateDB(d => { d.departments.push(dept); return d; });
    return dept;
  };
  const deleteDepartment = (id) => updateDB(d => { d.departments = d.departments.filter(x => x.id !== id); return d; });

  // ── Attendance ─────────────────────────────────
  const getAttendance = (filters = {}) => {
    let recs = db.attendance;
    if (filters.attendanceType) {
      if (filters.attendanceType === 'daily') {
        recs = recs.filter(r => r.attendanceType === 'daily' || r.courseId === 'daily');
      } else {
        recs = recs.filter(r => r.attendanceType === 'period' || !r.attendanceType);
      }
    }
    if (filters.courseId) recs = recs.filter(r => r.courseId === filters.courseId);
    if (filters.period) recs = recs.filter(r => r.period === filters.period);
    if (filters.date) recs = recs.filter(r => r.date === filters.date);
    if (filters.studentId) recs = recs.filter(r => r.studentId === filters.studentId);
    return recs;
  };

  const getRoster = (courseId, section, date, department, attendanceType = 'period', period = null) => {
    let students = db.users.filter(u => u.role === 'student' && u.section === section);
    if (department) students = students.filter(s => s.department === department);
    
    const existing = db.attendance.filter(a => {
      if (attendanceType === 'daily') {
        return a.date === date && (a.attendanceType === 'daily' || a.courseId === 'daily');
      } else {
        return a.date === date && 
               a.courseId === courseId && 
               (a.period === period || (!a.attendanceType && period === '1')) &&
               (a.attendanceType === 'period' || !a.attendanceType);
      }
    });

    return students.map(s => {
      const att = existing.find(a => a.studentId === s.id);
      return { 
        studentId: s.id, 
        name: s.name, 
        rollNumber: s.rollNumber, 
        section: s.section, 
        status: att ? att.status : 'present', 
        attendanceId: att ? att.id : null,
        originalStatus: att ? att.status : null
      };
    });
  };

  const saveAttendanceSession = (courseId, date, records, markedBy, attendanceType = 'period', period = null) => {
    const saved = [];
    const auditEntries = [];
    const targetCourseId = attendanceType === 'daily' ? 'daily' : courseId;
    updateDB(d => {
      records.forEach(r => {
        const idx = d.attendance.findIndex(a => {
          if (attendanceType === 'daily') {
            return a.studentId === r.studentId && a.date === date && (a.attendanceType === 'daily' || a.courseId === 'daily');
          } else {
            return a.studentId === r.studentId && 
                   a.courseId === courseId && 
                   a.date === date && 
                   (a.period === period || (!a.attendanceType && period === '1')) &&
                   (a.attendanceType === 'period' || !a.attendanceType);
          }
        });

        if (idx >= 0) {
          const old = d.attendance[idx];
          if (old.status !== r.status) {
            const entry = { 
              id: `audit-${uuidv4()}`, 
              attendanceId: old.id, 
              studentId: r.studentId, 
              courseId: targetCourseId, 
              date, 
              oldStatus: old.status, 
              newStatus: r.status, 
              modifiedBy: markedBy, 
              modifiedAt: new Date().toISOString(), 
              reason: 'Manual update',
              attendanceType,
              period: attendanceType === 'period' ? period : null
            };
            d.auditLog.push(entry);
            auditEntries.push(entry);
          }
          d.attendance[idx] = { 
            ...old, 
            status: r.status, 
            markedBy, 
            markedAt: new Date().toISOString(),
            attendanceType,
            period: attendanceType === 'period' ? period : null
          };
          saved.push(d.attendance[idx]);
        } else {
          const rec = { 
            id: `att-${uuidv4()}`, 
            studentId: r.studentId, 
            courseId: targetCourseId, 
            date, 
            status: r.status, 
            markedBy, 
            markedAt: new Date().toISOString(),
            attendanceType,
            period: attendanceType === 'period' ? period : null
          };
          d.attendance.push(rec);
          saved.push(rec);
        }
      });
      return d;
    });
    return { saved, auditEntries };
  };

  const updateAttendanceRecord = (id, status, reason, modifiedBy) => {
    let auditEntry = null;
    updateDB(d => {
      const idx = d.attendance.findIndex(a => a.id === id);
      if (idx >= 0) {
        const old = d.attendance[idx];
        if (old.status !== status) {
          auditEntry = { 
            id: `audit-${uuidv4()}`, 
            attendanceId: id, 
            studentId: old.studentId, 
            courseId: old.courseId, 
            date: old.date, 
            oldStatus: old.status, 
            newStatus: status, 
            modifiedBy, 
            modifiedAt: new Date().toISOString(), 
            reason: reason || 'Manual correction',
            attendanceType: old.attendanceType || 'period',
            period: old.period || null
          };
          d.auditLog.push(auditEntry);
          d.attendance[idx] = { ...old, status, markedBy: modifiedBy, markedAt: new Date().toISOString() };
        }
      }
      return d;
    });
    return auditEntry;
  };

  const getStudentAttendanceSummary = (studentId) => {
    const records = db.attendance.filter(a => a.studentId === studentId);
    const threshold = db.settings.attendanceThreshold;

    const dailyRecords = records.filter(r => r.attendanceType === 'daily' || r.courseId === 'daily');
    const periodRecords = records.filter(r => r.attendanceType !== 'daily' && r.courseId !== 'daily');

    const stats = db.courses.map(course => {
      const recs = periodRecords.filter(r => r.courseId === course.id);
      const total = recs.length;
      const present = recs.filter(r => r.status === 'present' || r.status === 'on-duty').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return { 
        courseId: course.id, 
        courseName: course.name, 
        courseCode: course.code, 
        total, 
        present, 
        absent: recs.filter(r => r.status === 'absent').length, 
        late: recs.filter(r => r.status === 'late').length, 
        onDuty: recs.filter(r => r.status === 'on-duty').length, 
        percentage, 
        isLow: percentage < threshold && total > 0 
      };
    }).filter(s => s.total > 0);

    const totalPeriodRecs = periodRecords.length;
    const presentPeriodRecs = periodRecords.filter(r => r.status === 'present' || r.status === 'on-duty').length;
    const overallPercentage = totalPeriodRecs > 0 ? Math.round((presentPeriodRecs / totalPeriodRecs) * 100) : 0;

    const totalDailyRecs = dailyRecords.length;
    const presentDailyRecs = dailyRecords.filter(r => r.status === 'present' || r.status === 'on-duty').length;
    const dailyPercentage = totalDailyRecs > 0 ? Math.round((presentDailyRecs / totalDailyRecs) * 100) : 0;
    const dailyStats = {
      total: totalDailyRecs,
      present: presentDailyRecs,
      absent: dailyRecords.filter(r => r.status === 'absent').length,
      late: dailyRecords.filter(r => r.status === 'late').length,
      onDuty: dailyRecords.filter(r => r.status === 'on-duty').length,
      percentage: dailyPercentage,
      isLow: dailyPercentage < threshold && totalDailyRecs > 0
    };

    const enrichedRecords = records.map(r => {
      const isDaily = r.attendanceType === 'daily' || r.courseId === 'daily';
      const course = isDaily ? { name: 'Day Work Attendance', code: 'DAILY' } : db.courses.find(c => c.id === r.courseId);
      const audits = db.auditLog.filter(a => a.attendanceId === r.id);
      return { 
        ...r, 
        courseName: course?.name || '', 
        courseCode: course?.code || '', 
        wasModified: audits.length > 0,
        attendanceType: isDaily ? 'daily' : (r.attendanceType || 'period')
      };
    });

    return { 
      records: enrichedRecords, 
      periodRecords: enrichedRecords.filter(r => r.attendanceType !== 'daily'),
      dailyRecords: enrichedRecords.filter(r => r.attendanceType === 'daily'),
      stats, 
      overallPercentage,
      dailyStats
    };
  };

  const getAnalytics = (filters = {}) => {
    let students = db.users.filter(u => u.role === 'student');
    if (filters.section) students = students.filter(s => s.section === filters.section);
    if (filters.department) students = students.filter(s => s.department === filters.department);
    const threshold = db.settings.attendanceThreshold;
    const type = filters.attendanceType || 'period';

    const stats = students.map(s => {
      let recs = db.attendance.filter(a => a.studentId === s.id);
      if (type === 'daily') {
        recs = recs.filter(r => r.attendanceType === 'daily' || r.courseId === 'daily');
      } else {
        recs = recs.filter(r => r.attendanceType === 'period' || !r.attendanceType);
        if (filters.courseId) recs = recs.filter(r => r.courseId === filters.courseId);
        if (filters.period) recs = recs.filter(r => r.period === filters.period);
      }
      const total = recs.length;
      const present = recs.filter(r => r.status === 'present' || r.status === 'on-duty').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return { 
        studentId: s.id, 
        name: s.name, 
        rollNumber: s.rollNumber, 
        section: s.section, 
        department: s.department, 
        total, 
        present, 
        absent: recs.filter(r => r.status === 'absent').length, 
        late: recs.filter(r => r.status === 'late').length, 
        percentage, 
        isLow: percentage < threshold && total > 0 
      };
    }).filter(s => s.total > 0);

    return { students: stats, lowAttendance: stats.filter(s => s.isLow), threshold };
  };

  // ── Audit Log ──────────────────────────────────
  const getAuditLog = (filters = {}) => {
    let logs = db.auditLog;
    if (filters.facultyId) logs = logs.filter(l => l.modifiedBy === filters.facultyId);
    if (filters.courseId) logs = logs.filter(l => l.courseId === filters.courseId);
    if (filters.fromDate) logs = logs.filter(l => l.date >= filters.fromDate);
    if (filters.toDate) logs = logs.filter(l => l.date <= filters.toDate);
    return logs.map(l => {
      const faculty = db.users.find(u => u.id === l.modifiedBy);
      const student = db.users.find(u => u.id === l.studentId);
      const course = db.courses.find(c => c.id === l.courseId);
      return { ...l, facultyName: faculty?.name || 'Unknown', studentName: student?.name || 'Unknown', rollNumber: student?.rollNumber || '', courseName: course?.name || 'Unknown' };
    }).sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
  };

  // ── Leaves ─────────────────────────────────────
  const getLeaves = (filters = {}) => {
    let leaves = db.leaves;
    if (filters.studentId) leaves = leaves.filter(l => l.studentId === filters.studentId);
    if (filters.status) leaves = leaves.filter(l => l.status === filters.status);
    return leaves.map(l => {
      const student = db.users.find(u => u.id === l.studentId);
      const reviewer = l.reviewedBy ? db.users.find(u => u.id === l.reviewedBy) : null;
      return { ...l, studentName: student?.name || 'Unknown', rollNumber: student?.rollNumber || '', reviewerName: reviewer?.name || null };
    }).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  };

  const addLeave = (studentId, data) => {
    const leave = { id: `leave-${uuidv4()}`, studentId, ...data, status: 'pending', appliedAt: new Date().toISOString(), reviewedBy: null, reviewedAt: null };
    updateDB(d => { d.leaves.push(leave); return d; });
    return leave;
  };

  const reviewLeave = (id, status, reviewerId) => {
    updateDB(d => { const i = d.leaves.findIndex(l => l.id === id); if (i >= 0) d.leaves[i] = { ...d.leaves[i], status, reviewedBy: reviewerId, reviewedAt: new Date().toISOString() }; return d; });
  };

  const deleteLeave = (id) => updateDB(d => { d.leaves = d.leaves.filter(l => l.id !== id); return d; });

  // ── Settings ───────────────────────────────────
  const getSettings = () => db.settings;
  const updateSettings = (data) => updateDB(d => { d.settings = { ...d.settings, ...data }; return d; });

  return (
    <AppContext.Provider value={{
      db,
      getUsers, getUserById, addUser, updateUser, deleteUser,
      getCourses, addCourse, updateCourse, deleteCourse,
      getDepartments, addDepartment, deleteDepartment,
      getAttendance, getRoster, saveAttendanceSession, updateAttendanceRecord,
      getStudentAttendanceSummary, getAnalytics,
      getAuditLog,
      getLeaves, addLeave, reviewLeave, deleteLeave,
      getSettings, updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
