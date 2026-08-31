import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { EmptyState, TabNav } from '../../components/ui';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white shadow-xl rounded-xl px-4 py-3 border border-slate-100 text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        <p className={`font-bold ${val >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{val}%</p>
      </div>
    );
  }
  return null;
};

export default function StudentOverview() {
  const { user } = useAuth();
  const { getStudentAttendanceSummary, getSettings } = useApp();
  const [activeMode, setActiveMode] = useState('period'); // 'period' | 'daily'

  const { records, stats, overallPercentage, dailyRecords, periodRecords, dailyStats } = useMemo(
    () => getStudentAttendanceSummary(user.id),
    [user.id]
  );
  const settings = getSettings();
  const threshold = settings.attendanceThreshold;

  const barData = stats.map(s => ({
    name: s.courseCode,
    fullName: s.courseName,
    percentage: s.percentage,
    present: s.present,
    absent: s.absent,
    total: s.total,
  }));

  // Date-wise trend — group by month
  const trendData = useMemo(() => {
    const currentRecs = activeMode === 'daily' ? dailyRecords : periodRecords;
    const dateMap = {};
    currentRecs.forEach(r => {
      const week = r.date.slice(0, 7); // YYYY-MM
      if (!dateMap[week]) dateMap[week] = { month: week, present: 0, total: 0 };
      dateMap[week].total++;
      if (r.status === 'present' || r.status === 'on-duty') dateMap[week].present++;
    });
    return Object.values(dateMap).sort((a, b) => a.month.localeCompare(b.month)).map(d => ({
      month: d.month,
      percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    }));
  }, [activeMode, dailyRecords, periodRecords]);

  // Monthly stats for Daily Work Attendance
  const dailyMonthStats = useMemo(() => {
    if (activeMode !== 'daily') return [];
    const monthly = {};
    dailyRecords.forEach(r => {
      const monthName = new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      if (!monthly[monthName]) {
        monthly[monthName] = { month: monthName, total: 0, present: 0, absent: 0, late: 0, onDuty: 0 };
      }
      monthly[monthName].total++;
      if (r.status === 'present') monthly[monthName].present++;
      else if (r.status === 'absent') monthly[monthName].absent++;
      else if (r.status === 'late') monthly[monthName].late++;
      else if (r.status === 'on-duty') monthly[monthName].onDuty++;
    });
    return Object.values(monthly).map(m => {
      const presCount = m.present + m.onDuty;
      return {
        ...m,
        percentage: m.total > 0 ? Math.round((presCount / m.total) * 100) : 0
      };
    });
  }, [activeMode, dailyRecords]);

  const isEmpty = activeMode === 'period' ? stats.length === 0 : dailyRecords.length === 0;

  if (isEmpty) {
    return (
      <div className="page-enter">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Attendance Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Detailed attendance analytics</p>
        </div>
        <TabNav 
          tabs={[
            { id: 'period', label: 'Period Analytics', icon: '📚' },
            { id: 'daily', label: 'Daily (Day Work) Analytics', icon: '💼' }
          ]} 
          active={activeMode} 
          onChange={setActiveMode} 
        />
        <EmptyState icon="📊" title="No data available" desc={`Your ${activeMode} attendance analytics will appear here once marked by faculty.`} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Attendance Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Analytics and trends for daily and period attendance</p>
      </div>

      <TabNav 
        tabs={[
          { id: 'period', label: 'Period Analytics', icon: '📚' },
          { id: 'daily', label: 'Daily (Day Work) Analytics', icon: '💼' }
        ]} 
        active={activeMode} 
        onChange={setActiveMode} 
      />

      {activeMode === 'period' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
          <h3 className="text-base font-semibold text-slate-800 mb-1">Attendance % by Subject</h3>
          <p className="text-xs text-slate-400 mb-4">The red dashed line marks the {threshold}% threshold</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {barData.map((e, i) => (
                    <Cell key={i} fill={e.percentage >= threshold ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 justify-center text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> ≥ {threshold}%</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> &lt; {threshold}%</span>
          </div>
        </div>
      )}

      {/* Monthly trend */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">
            Monthly {activeMode === 'daily' ? 'Daily' : 'Period'} Attendance Trend
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={v => [`${v}%`, 'Attendance']} />
                <Bar dataKey="percentage" fill={activeMode === 'daily' ? '#10b981' : '#6366f1'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detail Table */}
      {activeMode === 'period' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Detailed Subject Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left table-header">Subject</th>
                  <th className="px-5 py-3 text-center table-header">Total</th>
                  <th className="px-5 py-3 text-center table-header">Present</th>
                  <th className="px-5 py-3 text-center table-header">Absent</th>
                  <th className="px-5 py-3 text-center table-header">Late</th>
                  <th className="px-5 py-3 text-center table-header">OD</th>
                  <th className="px-5 py-3 text-center table-header">%</th>
                  <th className="px-5 py-3 text-center table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.map(s => (
                  <tr key={s.courseId} className="table-row">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-800">{s.courseName}</p>
                      <p className="text-xs text-slate-400">{s.courseCode}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center text-sm text-slate-600">{s.total}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-emerald-600">{s.present}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-red-500">{s.absent}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-amber-600">{s.late}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-blue-600">{s.onDuty}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-sm font-bold ${s.percentage >= threshold ? 'text-emerald-600' : 'text-red-500'}`}>
                        {s.percentage}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.percentage >= threshold ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {s.percentage >= threshold ? '✓ Good' : '⚠ Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Detailed Monthly Daily Attendance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left table-header">Month</th>
                  <th className="px-5 py-3 text-center table-header">Total Days</th>
                  <th className="px-5 py-3 text-center table-header">Present</th>
                  <th className="px-5 py-3 text-center table-header">Absent</th>
                  <th className="px-5 py-3 text-center table-header">Late</th>
                  <th className="px-5 py-3 text-center table-header">OD</th>
                  <th className="px-5 py-3 text-center table-header">%</th>
                  <th className="px-5 py-3 text-center table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dailyMonthStats.map(m => (
                  <tr key={m.month} className="table-row">
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{m.month}</td>
                    <td className="px-5 py-3.5 text-center text-sm text-slate-600">{m.total}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-emerald-600">{m.present}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-red-500">{m.absent}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-amber-600">{m.late}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-blue-600">{m.onDuty}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-sm font-bold ${m.percentage >= threshold ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.percentage}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${m.percentage >= threshold ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {m.percentage >= threshold ? '✓ Good' : '⚠ Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
