import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PercentageCircle, StatCard, EmptyState, TabNav } from '../../components/ui';

function SubjectCard({ stat, threshold }) {
  const isLow = stat.percentage < threshold && stat.total > 0;
  const pctColor = isLow ? '#ef4444' : '#10b981';
  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${isLow ? 'border-red-200' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight">{stat.courseName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{stat.courseCode}</p>
        </div>
        <PercentageCircle value={stat.percentage} size={64} threshold={threshold} />
      </div>
      <div className="grid grid-cols-4 gap-1 text-center mt-3">
        {[
          { label: 'Present', value: stat.present, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Absent',  value: stat.absent,  color: 'text-red-600 bg-red-50' },
          { label: 'Late',    value: stat.late,     color: 'text-amber-600 bg-amber-50' },
          { label: 'OD',      value: stat.onDuty,  color: 'text-blue-600 bg-blue-50' },
        ].map(m => (
          <div key={m.label} className={`rounded-lg py-1.5 ${m.color}`}>
            <p className="text-base font-bold leading-none">{m.value}</p>
            <p className="text-xs mt-0.5 font-medium">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${stat.percentage}%`, backgroundColor: pctColor }} />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-slate-400">{stat.total} total classes</p>
          {isLow && <p className="text-xs text-red-500 font-semibold">Below {threshold}%</p>}
        </div>
      </div>
    </div>
  );
}


export default function StudentDashboard() {
  const { user } = useAuth();
  const { getStudentAttendanceSummary, getSettings } = useApp();
  const [activeMode, setActiveMode] = useState('period'); // 'period' | 'daily'

  const { records, stats, overallPercentage, dailyRecords, periodRecords, dailyStats } = useMemo(
    () => getStudentAttendanceSummary(user.id),
    [user.id]
  );
  const settings = getSettings();
  const threshold = settings.attendanceThreshold;

  const currentRecords = activeMode === 'daily' ? dailyRecords : periodRecords;
  const currentPercentage = activeMode === 'daily' ? dailyStats.percentage : overallPercentage;

  const totals = useMemo(() => ({
    total:   currentRecords.length,
    present: currentRecords.filter(r => r.status === 'present' || r.status === 'on-duty').length,
    absent:  currentRecords.filter(r => r.status === 'absent').length,
    late:    currentRecords.filter(r => r.status === 'late').length,
  }), [currentRecords]);

  const recentRecords = useMemo(() =>
    [...currentRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [currentRecords]
  );

  const isGood = currentPercentage >= threshold;

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {user.name.split(' ')[0]}! 🎓</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {user.rollNumber} · {user.department} · Section {user.section} · Year {user.year}
          </p>
        </div>
      </div>

      {/* Tabs Selection */}
      <TabNav 
        tabs={[
          { id: 'period', label: 'Period Attendance', icon: '📚' },
          { id: 'daily', label: 'Daily (Day Work) Attendance', icon: '💼' }
        ]} 
        active={activeMode} 
        onChange={setActiveMode} 
      />

      {/* Hero attendance card */}
      <div className={`rounded-3xl p-6 mb-6 text-white flex flex-col sm:flex-row items-center gap-6 ${isGood ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-rose-600 to-red-700'}`}>
        <div className="flex-shrink-0">
          <PercentageCircle value={currentPercentage} size={140} threshold={threshold} />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wide">
            Overall {activeMode === 'daily' ? 'Daily Work' : 'Period'} Attendance
          </p>
          <p className="text-5xl font-extrabold mt-1">{currentPercentage}%</p>
          <p className="text-white/80 text-base mt-2 font-medium">
            {isGood ? '✓ You are meeting the required threshold' : '⚠ You are below the required threshold'}
          </p>
          <p className="text-white/50 text-xs mt-2">Required: {threshold}% · {settings.institutionName} · {settings.academicYear}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label={activeMode === 'daily' ? 'Total Days' : 'Total Classes'} value={totals.total} icon="📅" color="blue" sub="All recorded sessions" />
        <StatCard label="Present / OD"    value={totals.present} icon="✅" color="green"  sub="Counted as attended" />
        <StatCard label="Absent"          value={totals.absent}  icon="❌" color="red"    sub="Unattended sessions" />
        <StatCard label="Late"            value={totals.late}    icon="⏰" color="amber"  sub="Marked late arrivals" />
      </div>

      {/* Mode-specific content */}
      {activeMode === 'period' ? (
        <div className="mb-8">
          <h2 className="text-base font-bold text-slate-800 mb-4">📚 Subject-wise Breakdown</h2>
          {stats.length === 0 ? (
            <EmptyState icon="📭" title="No attendance records yet" desc="Your attendance will appear here once your faculty marks it." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map(s => <SubjectCard key={s.courseId} stat={s} threshold={threshold} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">💼 Daily Work Roster Status</h2>
          {dailyRecords.length === 0 ? (
            <EmptyState icon="📭" title="No daily attendance marked yet" desc="Your daily work attendance will appear here once marked." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Present / OD Days', value: dailyStats.present, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Absent Days', value: dailyStats.absent, color: 'bg-red-50 text-red-700' },
                { label: 'Late Days', value: dailyStats.late, color: 'bg-amber-50 text-amber-700' },
                { label: 'Total Duty Days', value: dailyStats.total, color: 'bg-blue-50 text-blue-700' }
              ].map(item => (
                <div key={item.label} className={`p-4 rounded-2xl text-center ${item.color}`}>
                  <p className="text-2xl font-black">{item.value}</p>
                  <p className="text-xs font-semibold mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent records */}
      {recentRecords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">🕐 Recent Attendance</h2>
          <div className="space-y-2">
            {recentRecords.map(r => {
              const statusStyle = {
                present: 'bg-emerald-100 text-emerald-700',
                absent:  'bg-red-100 text-red-700',
                late:    'bg-amber-100 text-amber-700',
                'on-duty': 'bg-blue-100 text-blue-700',
              };
              const statusLabel = { present: 'Present', absent: 'Absent', late: 'Late', 'on-duty': 'On Duty' };
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-xs font-bold text-slate-700">{new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit' })}</p>
                    <p className="text-xs text-slate-400">{new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{r.courseName}</p>
                    <p className="text-xs text-slate-400">{r.courseCode} {r.period ? `· Period ${r.period}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.wasModified && <span title="Updated by faculty" className="text-xs text-amber-500">✏️</span>}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle[r.status] || 'bg-slate-100 text-slate-600'}`}>
                      {statusLabel[r.status] || r.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
