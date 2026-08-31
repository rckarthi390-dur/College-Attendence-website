import { createContext, useContext, useState, useEffect } from 'react';
import { loadDB } from '../data/seedData';

const AuthContext = createContext(null);

const normalizeToYMD = (dateStr) => {
  if (!dateStr) return '';
  const clean = dateStr.replace(/\s/g, '');
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts[0].length === 4) return clean; // YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
  }
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD/MM/YYYY
    return `${parts[0]}-${parts[1]}-${parts[2]}`; // YYYY/MM/DD
  }
  return dateStr;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('college_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = (email, password) => {
    const db = loadDB();
    const found = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
    if (!found) throw new Error('Invalid email or password.');
    const { password: _pwd, ...safe } = found;
    setUser(safe);
    localStorage.setItem('college_auth_user', JSON.stringify(safe));
    return safe;
  };

  const studentLogin = (rollNumber, dob) => {
    const db = loadDB();
    const found = db.users.find(u => 
      u.role === 'student' && 
      u.rollNumber && 
      u.rollNumber.toLowerCase().trim() === rollNumber.toLowerCase().trim()
    );
    if (!found) throw new Error(`Student with Roll Number "${rollNumber}" not found.`);
    
    const storedDob = normalizeToYMD(found.dob || '');
    const inputDob = normalizeToYMD(dob || '');
    if (storedDob && inputDob && storedDob !== inputDob) {
      throw new Error('Incorrect Date of Birth.');
    }
    
    const { password: _pwd, ...safe } = found;
    setUser(safe);
    localStorage.setItem('college_auth_user', JSON.stringify(safe));
    return safe;
  };

  const demoLogin = (role) => {
    const roleMap = { admin: 'admin@college.edu', faculty: 'anand@college.edu', student: 'arjun@student.edu' };
    const db = loadDB();
    const found = db.users.find(u => u.email === roleMap[role]);
    if (!found) throw new Error('Demo user not found.');
    const { password: _pwd, ...safe } = found;
    setUser(safe);
    localStorage.setItem('college_auth_user', JSON.stringify(safe));
    return safe;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('college_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, studentLogin, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
