import { createContext, useContext, useState, useEffect } from 'react';
import { loadDB } from '../data/seedData';

const AuthContext = createContext(null);

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
    
    const storedDob = (found.dob || '').replace(/\D/g, '');
    const inputDob = (dob || '').replace(/\D/g, '');
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
