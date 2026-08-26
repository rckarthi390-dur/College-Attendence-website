import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/auth/LoginPage';

// Faculty pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MarkAttendance from './pages/faculty/MarkAttendance';
import AttendanceHistory from './pages/faculty/AttendanceHistory';
import ClassAnalytics from './pages/faculty/ClassAnalytics';
import FacultyLeaves from './pages/faculty/FacultyLeaves';
import FacultyAuditLog from './pages/faculty/FacultyAuditLog';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentOverview from './pages/student/StudentOverview';
import AttendanceLog from './pages/student/AttendanceLog';
import LeaveApplication from './pages/student/LeaveApplication';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import AdminAuditLog from './pages/admin/AdminAuditLog';
import AdminLeaves from './pages/admin/AdminLeaves';
import SystemSettings from './pages/admin/SystemSettings';

function RoleContent({ user, activeTab }) {
  if (user.role === 'faculty') {
    switch (activeTab) {
      case 'dashboard': return <FacultyDashboard />;
      case 'mark':      return <MarkAttendance />;
      case 'history':   return <AttendanceHistory />;
      case 'analytics': return <ClassAnalytics />;
      case 'leaves':    return <FacultyLeaves />;
      case 'audit':     return <FacultyAuditLog />;
      default:          return <FacultyDashboard />;
    }
  }
  if (user.role === 'student') {
    switch (activeTab) {
      case 'dashboard': return <StudentDashboard />;
      case 'overview':  return <StudentOverview />;
      case 'log':       return <AttendanceLog />;
      case 'leaves':    return <LeaveApplication />;
      default:          return <StudentDashboard />;
    }
  }
  if (user.role === 'admin') {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'users':     return <UserManagement />;
      case 'courses':   return <CourseManagement />;
      case 'audit':     return <AdminAuditLog />;
      case 'leaves':    return <AdminLeaves />;
      case 'settings':  return <SystemSettings />;
      default:          return <AdminDashboard />;
    }
  }
  return null;
}

function AppShell() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) return <LoginPage />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-5 lg:p-8 max-w-7xl mx-auto">
          <RoleContent user={user} activeTab={activeTab} />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}
