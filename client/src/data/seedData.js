// Seed data for local state management
export const SEED_DATA = {
  settings: {
    attendanceThreshold: 75,
    institutionName: "G.T.N. Arts College",
    academicYear: "2024-25",
    lateMarkWindow: 30,
  },

  users: [
    { id: "admin-karthi", name: "karthi", email: "karthi@gmail.com", password: "karthi1234", role: "admin", department: "Administration", phone: "9876543219" }
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
