import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'courses', label: 'Course Management', icon: '📚' },
    { id: 'audit', label: 'Master Audit Log', icon: '📋' },
    { id: 'leaves', label: 'Leave Requests', icon: '📝' },
    { id: 'settings', label: 'System Settings', icon: '⚙️' },
  ],
  faculty: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'mark', label: 'Mark Attendance', icon: '✅' },
    { id: 'history', label: 'Attendance History', icon: '📅' },
    { id: 'analytics', label: 'Class Analytics', icon: '📈' },
    { id: 'leaves', label: 'Leave Requests', icon: '📝' },
    { id: 'audit', label: 'My Audit Log', icon: '🔍' },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'overview', label: 'Attendance Overview', icon: '📈' },
    { id: 'log', label: 'Attendance Log', icon: '📋' },
    { id: 'leaves', label: 'Leave & OD Application', icon: '📝' },
  ],
};

const ROLE_COLORS = {
  admin: 'sidebar-gradient',
  faculty: 'sidebar-gradient-faculty',
  student: 'sidebar-gradient-student',
};

const ROLE_LABELS = { admin: 'Administrator', faculty: 'Faculty / Staff', student: 'Student' };

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV[user?.role] || [];
  const gradientClass = ROLE_COLORS[user?.role] || 'sidebar-gradient';

  const SidebarContent = () => (
    <div className={`${gradientClass} h-full flex flex-col`}>
      {/* Logo / Institution */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🎓</div>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-sm leading-tight">SVCE Attendance</p>
              <p className="text-white/60 text-xs">Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-white/60 text-xs">{ROLE_LABELS[user?.role]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button key={item.id}
            onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
            className={`sidebar-link w-full text-left ${activeTab === item.id ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}>
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        {!collapsed && (
          <div className="px-4 mb-3">
            <p className="text-white/40 text-xs">{user?.email}</p>
            {user?.rollNumber && <p className="text-white/40 text-xs">{user.rollNumber}</p>}
            {user?.employeeId && <p className="text-white/40 text-xs">ID: {user.employeeId}</p>}
          </div>
        )}
        <button onClick={logout}
          className="sidebar-link sidebar-link-inactive w-full">
          <span className="text-lg">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg rounded-xl p-2.5 text-slate-700">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 h-full w-64" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="relative h-full">
          <SidebarContent />
          <button onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm z-10">
            <svg className={`w-3 h-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
