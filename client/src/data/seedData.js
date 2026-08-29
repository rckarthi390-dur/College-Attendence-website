// Seed data for local state management
export const SEED_DATA = {
  settings: {
    attendanceThreshold: 75,
    institutionName: "Sri Venkateswara College of Engineering",
    academicYear: "2024-25",
    lateMarkWindow: 30,
  },

  users: [
    { id: "admin-karthi", name: "karthi", email: "karthi@college.edu", password: "karthi1234", role: "admin", department: "Administration", phone: "9876543219" },
    { id: "admin-001", name: "Dr. Rajesh Kumar", email: "admin@college.edu", password: "password", role: "admin", department: "Administration", phone: "9876543210" },
    { id: "admin-002", name: "Mrs. Priya Nair", email: "priya.admin@college.edu", password: "password", role: "admin", department: "Administration", phone: "9876543211" },
    { id: "fac-001", name: "Prof. Anand Sharma", email: "anand@college.edu", password: "password", role: "faculty", department: "Computer Science", employeeId: "FAC001", phone: "9876543212", courses: ["CS101", "CS201"] },
    { id: "fac-002", name: "Dr. Meena Iyer", email: "meena@college.edu", password: "password", role: "faculty", department: "Electronics", employeeId: "FAC002", phone: "9876543213", courses: ["EC101", "EC201"] },
    { id: "fac-003", name: "Mr. Suresh Babu", email: "suresh@college.edu", password: "password", role: "faculty", department: "Mechanical", employeeId: "FAC003", phone: "9876543214", courses: ["ME101", "ME201"] },
    { id: "fac-004", name: "Dr. Kavitha Reddy", email: "kavitha@college.edu", password: "password", role: "faculty", department: "Computer Science", employeeId: "FAC004", phone: "9876543215", courses: ["CS301", "CS401"] },
    { id: "fac-005", name: "Prof. Raman Pillai", email: "raman@college.edu", password: "password", role: "faculty", department: "Electronics", employeeId: "FAC005", phone: "9876543216", courses: ["EC301"] },
    { id: "stu-001", name: "Arjun Menon", email: "arjun@student.edu", password: "password", role: "student", rollNumber: "CS21001", department: "Computer Science", section: "A", year: 3, phone: "9876543220" },
    { id: "stu-002", name: "Priya Krishnan", email: "priya.s@student.edu", password: "password", role: "student", rollNumber: "CS21002", department: "Computer Science", section: "A", year: 3, phone: "9876543221" },
    { id: "stu-003", name: "Rahul Singh", email: "rahul@student.edu", password: "password", role: "student", rollNumber: "CS21003", department: "Computer Science", section: "A", year: 3, phone: "9876543222" },
    { id: "stu-004", name: "Deepa Nair", email: "deepa@student.edu", password: "password", role: "student", rollNumber: "CS21004", department: "Computer Science", section: "A", year: 3, phone: "9876543223" },
    { id: "stu-005", name: "Karthik Rajan", email: "karthik@student.edu", password: "password", role: "student", rollNumber: "CS21005", department: "Computer Science", section: "B", year: 3, phone: "9876543224" },
    { id: "stu-006", name: "Ananya Suresh", email: "ananya@student.edu", password: "password", role: "student", rollNumber: "CS21006", department: "Computer Science", section: "B", year: 3, phone: "9876543225" },
    { id: "stu-007", name: "Vishnu Kumar", email: "vishnu@student.edu", password: "password", role: "student", rollNumber: "EC21001", department: "Electronics", section: "A", year: 2, phone: "9876543226" },
    { id: "stu-008", name: "Lakshmi Devi", email: "lakshmi@student.edu", password: "password", role: "student", rollNumber: "EC21002", department: "Electronics", section: "A", year: 2, phone: "9876543227" },
    { id: "stu-009", name: "Arun Patel", email: "arun@student.edu", password: "password", role: "student", rollNumber: "ME21001", department: "Mechanical", section: "A", year: 2, phone: "9876543228" },
    { id: "stu-010", name: "Sneha Pillai", email: "sneha@student.edu", password: "password", role: "student", rollNumber: "CS21010", department: "Computer Science", section: "A", year: 3, phone: "9876543229" },
  ],

  departments: [
    { id: "dept-cs", name: "Computer Science", code: "CS", hod: "fac-004" },
    { id: "dept-ec", name: "Electronics", code: "EC", hod: "fac-002" },
    { id: "dept-me", name: "Mechanical", code: "ME", hod: "fac-003" },
  ],

  courses: [
    { id: "CS101", name: "Data Structures", code: "CS101", department: "Computer Science", credits: 4, faculty: "fac-001" },
    { id: "CS201", name: "Operating Systems", code: "CS201", department: "Computer Science", credits: 4, faculty: "fac-001" },
    { id: "CS301", name: "Database Management", code: "CS301", department: "Computer Science", credits: 3, faculty: "fac-004" },
    { id: "CS401", name: "Machine Learning", code: "CS401", department: "Computer Science", credits: 4, faculty: "fac-004" },
    { id: "EC101", name: "Circuit Theory", code: "EC101", department: "Electronics", credits: 4, faculty: "fac-002" },
    { id: "EC201", name: "Digital Electronics", code: "EC201", department: "Electronics", credits: 3, faculty: "fac-002" },
    { id: "EC301", name: "VLSI Design", code: "EC301", department: "Electronics", credits: 4, faculty: "fac-005" },
    { id: "ME101", name: "Engineering Mechanics", code: "ME101", department: "Mechanical", credits: 4, faculty: "fac-003" },
    { id: "ME201", name: "Thermodynamics", code: "ME201", department: "Mechanical", credits: 4, faculty: "fac-003" },
  ],

  sections: [
    { id: "sec-cs-a", department: "Computer Science", section: "A", year: 3, batch: "2021-25" },
    { id: "sec-cs-b", department: "Computer Science", section: "B", year: 3, batch: "2021-25" },
    { id: "sec-ec-a", department: "Electronics", section: "A", year: 2, batch: "2022-26" },
    { id: "sec-me-a", department: "Mechanical", section: "A", year: 2, batch: "2022-26" },
  ],

  attendance: [
    { id: "att-001", studentId: "stu-001", courseId: "CS101", date: "2024-08-05", status: "present", markedBy: "fac-001", markedAt: "2024-08-05T09:15:00Z" },
    { id: "att-002", studentId: "stu-002", courseId: "CS101", date: "2024-08-05", status: "present", markedBy: "fac-001", markedAt: "2024-08-05T09:15:00Z" },
    { id: "att-003", studentId: "stu-003", courseId: "CS101", date: "2024-08-05", status: "absent", markedBy: "fac-001", markedAt: "2024-08-05T09:15:00Z" },
    { id: "att-004", studentId: "stu-004", courseId: "CS101", date: "2024-08-05", status: "late", markedBy: "fac-001", markedAt: "2024-08-05T09:15:00Z" },
    { id: "att-005", studentId: "stu-010", courseId: "CS101", date: "2024-08-05", status: "present", markedBy: "fac-001", markedAt: "2024-08-05T09:15:00Z" },
    { id: "att-006", studentId: "stu-001", courseId: "CS201", date: "2024-08-05", status: "present", markedBy: "fac-001", markedAt: "2024-08-05T11:15:00Z" },
    { id: "att-007", studentId: "stu-002", courseId: "CS201", date: "2024-08-05", status: "on-duty", markedBy: "fac-001", markedAt: "2024-08-05T11:15:00Z" },
    { id: "att-008", studentId: "stu-001", courseId: "CS101", date: "2024-08-06", status: "present", markedBy: "fac-001", markedAt: "2024-08-06T09:10:00Z" },
    { id: "att-009", studentId: "stu-002", courseId: "CS101", date: "2024-08-06", status: "absent", markedBy: "fac-001", markedAt: "2024-08-06T09:10:00Z" },
    { id: "att-010", studentId: "stu-003", courseId: "CS101", date: "2024-08-06", status: "present", markedBy: "fac-001", markedAt: "2024-08-06T09:10:00Z" },
    { id: "att-011", studentId: "stu-004", courseId: "CS101", date: "2024-08-06", status: "present", markedBy: "fac-001", markedAt: "2024-08-06T09:10:00Z" },
    { id: "att-012", studentId: "stu-010", courseId: "CS101", date: "2024-08-06", status: "late", markedBy: "fac-001", markedAt: "2024-08-06T09:10:00Z" },
    { id: "att-013", studentId: "stu-001", courseId: "CS301", date: "2024-08-05", status: "present", markedBy: "fac-004", markedAt: "2024-08-05T14:00:00Z" },
    { id: "att-014", studentId: "stu-002", courseId: "CS301", date: "2024-08-05", status: "present", markedBy: "fac-004", markedAt: "2024-08-05T14:00:00Z" },
    { id: "att-015", studentId: "stu-003", courseId: "CS301", date: "2024-08-05", status: "absent", markedBy: "fac-004", markedAt: "2024-08-05T14:00:00Z" },
    { id: "att-016", studentId: "stu-001", courseId: "CS101", date: "2024-08-07", status: "absent", markedBy: "fac-001", markedAt: "2024-08-07T09:00:00Z" },
    { id: "att-017", studentId: "stu-002", courseId: "CS101", date: "2024-08-07", status: "present", markedBy: "fac-001", markedAt: "2024-08-07T09:00:00Z" },
    { id: "att-018", studentId: "stu-003", courseId: "CS101", date: "2024-08-07", status: "present", markedBy: "fac-001", markedAt: "2024-08-07T09:00:00Z" },
    { id: "att-019", studentId: "stu-001", courseId: "CS401", date: "2024-08-05", status: "present", markedBy: "fac-004", markedAt: "2024-08-05T16:00:00Z" },
    { id: "att-020", studentId: "stu-002", courseId: "CS401", date: "2024-08-05", status: "late", markedBy: "fac-004", markedAt: "2024-08-05T16:00:00Z" },
    { id: "att-021", studentId: "stu-001", courseId: "CS201", date: "2024-08-06", status: "present", markedBy: "fac-001", markedAt: "2024-08-06T11:00:00Z" },
    { id: "att-022", studentId: "stu-002", courseId: "CS201", date: "2024-08-06", status: "absent", markedBy: "fac-001", markedAt: "2024-08-06T11:00:00Z" },
    { id: "att-023", studentId: "stu-007", courseId: "EC101", date: "2024-08-05", status: "present", markedBy: "fac-002", markedAt: "2024-08-05T09:00:00Z" },
    { id: "att-024", studentId: "stu-008", courseId: "EC101", date: "2024-08-05", status: "present", markedBy: "fac-002", markedAt: "2024-08-05T09:00:00Z" },
    { id: "att-025", studentId: "stu-009", courseId: "ME101", date: "2024-08-05", status: "absent", markedBy: "fac-003", markedAt: "2024-08-05T09:00:00Z" },
    { id: "att-026", studentId: "stu-001", courseId: "CS401", date: "2024-08-06", status: "present", markedBy: "fac-004", markedAt: "2024-08-06T16:00:00Z" },
    { id: "att-027", studentId: "stu-002", courseId: "CS401", date: "2024-08-06", status: "present", markedBy: "fac-004", markedAt: "2024-08-06T16:00:00Z" },
    { id: "att-028", studentId: "stu-004", courseId: "CS201", date: "2024-08-05", status: "present", markedBy: "fac-001", markedAt: "2024-08-05T11:15:00Z" },
    { id: "att-029", studentId: "stu-010", courseId: "CS201", date: "2024-08-05", status: "absent", markedBy: "fac-001", markedAt: "2024-08-05T11:15:00Z" },
  ],

  auditLog: [
    {
      id: "audit-001",
      attendanceId: "att-003",
      studentId: "stu-003",
      courseId: "CS101",
      date: "2024-08-05",
      oldStatus: "absent",
      newStatus: "on-duty",
      modifiedBy: "fac-001",
      modifiedAt: "2024-08-08T10:30:00Z",
      reason: "Student had lab duty",
    },
    {
      id: "audit-002",
      attendanceId: "att-009",
      studentId: "stu-002",
      courseId: "CS101",
      date: "2024-08-06",
      oldStatus: "present",
      newStatus: "absent",
      modifiedBy: "fac-001",
      modifiedAt: "2024-08-09T14:00:00Z",
      reason: "Marked incorrectly",
    },
  ],

  leaves: [
    { id: "leave-001", studentId: "stu-001", type: "leave", fromDate: "2024-08-10", toDate: "2024-08-12", reason: "Family function", status: "approved", appliedAt: "2024-08-08T09:00:00Z", reviewedBy: "fac-001", reviewedAt: "2024-08-09T10:00:00Z" },
    { id: "leave-002", studentId: "stu-002", type: "od", fromDate: "2024-08-15", toDate: "2024-08-15", reason: "Inter-college Hackathon participation", status: "pending", appliedAt: "2024-08-12T11:00:00Z", reviewedBy: null, reviewedAt: null },
    { id: "leave-003", studentId: "stu-003", type: "leave", fromDate: "2024-08-20", toDate: "2024-08-22", reason: "Medical emergency", status: "rejected", appliedAt: "2024-08-18T10:00:00Z", reviewedBy: "fac-001", reviewedAt: "2024-08-19T09:00:00Z" },
  ],
};

const STORAGE_KEY = 'college_attendance_db';

export function loadDB() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return JSON.parse(JSON.stringify(SEED_DATA));
}

export function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDB() {
  localStorage.removeItem(STORAGE_KEY);
}
