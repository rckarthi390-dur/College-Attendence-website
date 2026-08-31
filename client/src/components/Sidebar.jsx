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

  const SidebarContent = ({ isDrawer = false }) => (
    <div className={`${gradientClass} h-full flex flex-col`}>
      {/* Logo / Institution */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">🎓</div>
          {(!collapsed || isDrawer) && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">SVCE Attendance</p>
              <p className="text-white/60 text-xs truncate">Management System</p>
            </div>
          )}
        </div>
        {isDrawer && (
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation drawer"
            className="text-white/70 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-bold flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* User Info */}
      {(!collapsed || isDrawer) && (
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-inner">
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
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => (
          <button key={item.id}
            onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
            className={`sidebar-link w-full text-left ${activeTab === item.id ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}>
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {(!collapsed || isDrawer) && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        {(!collapsed || isDrawer) && (
          <div className="px-4 mb-3">
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
            {user?.rollNumber && <p className="text-white/40 text-xs">Roll: {user.rollNumber}</p>}
            {user?.employeeId && <p className="text-white/40 text-xs">ID: {user.employeeId}</p>}
          </div>
        )}
        <button onClick={() => { logout(); setMobileOpen(false); }}
          className="sidebar-link sidebar-link-inactive w-full">
          <span className="text-lg">🚪</span>
          {(!collapsed || isDrawer) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all text-lg font-bold"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <div>
              <p className="text-white font-bold text-xs leading-tight">SVCE Attendance</p>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/10 text-white rounded-lg max-w-[70px] sm:max-w-none truncate">
            {user?.name?.split(' ')[0]}
          </span>
          <button
            onClick={logout}
            title="Logout"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white transition-all"
          >
            🚪
          </button>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] shadow-2xl transition-transform duration-300 ease-in-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <SidebarContent isDrawer={true} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="relative h-full">
          <SidebarContent isDrawer={false} />
          <button onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
