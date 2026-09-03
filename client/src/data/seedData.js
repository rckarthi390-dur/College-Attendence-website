// Seed data for local state management
export const SEED_DATA = {
  settings: {
    attendanceThreshold: 75,
    institutionName: "G.T.N. Arts College",
    academicYear: "2024-25",
    lateMarkWindow: 30,
    totalWorkingDays: 90,
  },

  users: [
    { id: "admin-karthi", name: "karthi", email: "karthi@gmail.com", password: "karthi1234", role: "admin", department: "Administration", phone: "9876543219" },
    { id: "fac-005", name: "jamuna", email: "jamuna@gmail.com", password: "password", role: "faculty", department: "Computer Science", phone: "9876543216" },
    { id: "stu-003", name: "Karthikeyan S", email: "rckarthi390@gmail.com", password: "password", role: "student", department: "Computer Science", rollNumber: "24UCSB025", dob: "2007-04-12", section: "B", year: 3, phone: "9876543217" }
  ],

  departments: [
    { id: "dept-cs", name: "Computer Science", code: "CS", hod: "" },
    { id: "dept-ec", name: "Electronics", code: "EC", hod: "" },
    { id: "dept-me", name: "Mechanical", code: "ME", hod: "" },
  ],

  courses: [
    { id: "CS101", name: "Data Structures", code: "CS101", department: "Computer Science", credits: 4, faculty: "" },
    { id: "CS201", name: "Operating Systems", code: "CS201", department: "Computer Science", credits: 4, faculty: "" },
  ],

  sections: [
    { id: "sec-cs-a", department: "Computer Science", section: "A", year: 3, batch: "2021-25" },
  ],

  attendance: [],
  auditLog: [],
  leaves: [],
};

const STORAGE_KEY = 'college_attendance_db';

export function loadDB() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        if (!Array.isArray(parsed.users)) parsed.users = [];
        if (!Array.isArray(parsed.courses)) parsed.courses = JSON.parse(JSON.stringify(SEED_DATA.courses || []));
        if (!Array.isArray(parsed.departments)) parsed.departments = JSON.parse(JSON.stringify(SEED_DATA.departments || []));
        if (!Array.isArray(parsed.attendance)) parsed.attendance = [];
        if (!Array.isArray(parsed.auditLog)) parsed.auditLog = [];
        if (!Array.isArray(parsed.leaves)) parsed.leaves = [];
        if (!parsed.settings || typeof parsed.settings !== 'object') parsed.settings = JSON.parse(JSON.stringify(SEED_DATA.settings));
        return parsed;
      }
    }
  } catch {}
  return JSON.parse(JSON.stringify(SEED_DATA));
}

export function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDB() {
  localStorage.removeItem(STORAGE_KEY);
}
