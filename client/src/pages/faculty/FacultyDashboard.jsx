import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard, EmptyState } from '../../components/ui';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { getCourses, getUsers, getAttendance, getLeaves, getAnalytics } = useApp();

  const courses = getCourses(user.department);
  const students = getUsers({ role: 'student', department: user.department });
  const allAttendance = getAttendance({});
  const leaves = getLeaves({});
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const analytics = getAnalytics({ department: user.department });
  const lowCount = analytics.lowAttendance?.length || 0;

  const today = new Date().toISOString().split('T')[0];
  const todayAtt = allAttendance.filter(a => a.date === today && a.markedBy === user.id);

  const recentDates = [...new Set(allAttendance.filter(a => a.markedBy === user.id).map(a => a.date))].sort((a,b) => b.localeCompare(a)).slice(0, 5);

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-slate-500 text-sm mt-0.5">{user.department} Department · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Courses" value={courses.length} icon="📚" color="blue" sub={`${user.department}`} />
        <StatCard label="Dept. Students" value={students.length} icon="👥" color="green" />
        <StatCard label="Low Attendance" value={lowCount} icon="⚠️" color="red" sub="< 75%" />
        <StatCard label="Pending Leaves" value={pendingLeaves.length} icon="📝" color="amber" sub="Need review" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">📚 My Courses</h2>
          {courses.length === 0 ? (
            <EmptyState icon="📚" title="No courses assigned" />
          ) : (
            <div className="space-y-3">
              {courses.map(c => {
                const recs = allAttendance.filter(a => a.courseId === c.id);
                const present = recs.filter(r => r.status === 'present' || r.status === 'on-duty').length;
                const pct = recs.length > 0 ? Math.round((present / recs.length) * 100) : 0;
                return (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                      {c.code.slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.code} · {c.credits} credits</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${pct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{pct}%</p>
                      <p className="text-xs text-slate-400">{recs.length} sessions</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">🗓️ Recent Sessions</h2>
          {recentDates.length === 0 ? (
            <EmptyState icon="📅" title="No sessions yet" desc="Start marking attendance using the sidebar" />
          ) : (
            <div className="space-y-3">
              {recentDates.map(date => {
                const dayRecs = allAttendance.filter(a => a.date === date && a.markedBy === user.id);
                const present = dayRecs.filter(r => r.status === 'present' || r.status === 'on-duty').length;
                const courseIds = [...new Set(dayRecs.map(r => r.courseId))];
                return (
                  <div key={date} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center flex-shrink-0">
                      <p className="text-xs font-bold text-slate-700">{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit' })}</p>
                      <p className="text-xs text-slate-500">{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{courseIds.length} course{courseIds.length > 1 ? 's' : ''} marked</p>
                      <p className="text-xs text-slate-400">{dayRecs.length} students · {present} present</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Leaves */}
        {pendingLeaves.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 lg:col-span-2">
            <h2 className="text-base font-semibold text-slate-800 mb-4">📝 Pending Leave Requests <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">{pendingLeaves.length}</span></h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {pendingLeaves.slice(0, 4).map(l => (
                <div key={l.id} className="p-3 rounded-xl border border-amber-100 bg-amber-50/50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{l.studentName}</p>
                      <p className="text-xs text-slate-500">{l.rollNumber}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.type === 'od' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {l.type === 'od' ? 'On Duty' : 'Leave'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-1">{l.reason}</p>
                  <p className="text-xs text-slate-400 mt-1">{l.fromDate} → {l.toDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
