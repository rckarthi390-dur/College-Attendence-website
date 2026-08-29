import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SelectField, PageHeader, EmptyState, StatCard } from '../../components/ui';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function ClassAnalytics() {
  const { user } = useAuth();
  const { getCourses, getDepartments, getAnalytics, getAttendance } = useApp();
  const { toast } = useToast();

  const departments = getDepartments();
  const [dept, setDept] = useState(user.department || '');
  const [courseId, setCourseId] = useState('');
  const [section, setSection] = useState('');
  const courses = getCourses(dept);

  const analytics = useMemo(() => getAnalytics({ department: dept || undefined, courseId: courseId || undefined, section: section || undefined }),
    [dept, courseId, section]);

  const overallStats = useMemo(() => {
    const att = getAttendance({ courseId: courseId || undefined });
    const filtered = dept || section ? att.filter(a => {
      // we'll use student analytics for this
      return true;
    }) : att;
    return {
      totalSessions: [...new Set(att.map(a => `${a.courseId}-${a.date}`))].length,
      present: att.filter(a => a.status === 'present' || a.status === 'on-duty').length,
      absent: att.filter(a => a.status === 'absent').length,
      late: att.filter(a => a.status === 'late').length,
      onDuty: att.filter(a => a.status === 'on-duty').length,
    };
  }, [courseId]);

  const barData = analytics.students?.slice(0, 15).map(s => ({
    name: s.name.split(' ')[0],
    percentage: s.percentage,
    fill: s.isLow ? '#ef4444' : '#10b981',
  })) || [];

  const pieData = [
    { name: 'Present', value: overallStats.present },
    { name: 'Absent', value: overallStats.absent },
    { name: 'Late', value: overallStats.late },
    { name: 'On Duty', value: overallStats.onDuty },
  ].filter(d => d.value > 0);

  const exportCSV = () => {
    const rows = [['Roll No', 'Student', 'Department', 'Section', 'Total', 'Present', 'Absent', 'Late', 'Percentage', 'Status']];
    analytics.students?.forEach(s => {
      rows.push([s.rollNumber, s.name, s.department, s.section, s.total, s.present, s.absent, s.late, s.percentage + '%', s.isLow ? 'LOW' : 'OK']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `attendance_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported!');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Class Analytics" subtitle="Visual attendance summaries and low-attendance alerts"
        actions={<>
          <button onClick={exportCSV} className="btn-secondary text-sm">📥 Export CSV</button>
        </>} />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField label="Department" value={dept} onChange={v => { setDept(v); setCourseId(''); }}
            options={departments.map(d => ({ value: d.name, label: d.name }))} placeholder="All Departments" />
          <SelectField label="Course" value={courseId} onChange={setCourseId}
            options={courses.map(c => ({ value: c.id, label: `${c.code} – ${c.name}` }))} placeholder="All Courses" />
          <SelectField label="Section" value={section} onChange={setSection}
            options={['A', 'B', 'C', 'D'].map(s => ({ value: s, label: `Section ${s}` }))} placeholder="All Sections" />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={analytics.students?.length || 0} icon="👥" color="blue" />
        <StatCard label="Low Attendance" value={analytics.lowAttendance?.length || 0} icon="⚠️" color="red" sub={`< ${analytics.threshold}%`} />
        <StatCard label="Total Classes" value={overallStats.totalSessions} icon="📅" color="teal" />
        <StatCard label="Avg Attendance" value={analytics.students?.length > 0 ? Math.round(analytics.students.reduce((s, st) => s + st.percentage, 0) / analytics.students.length) + '%' : 'N/A'} icon="📊" color="green" />
      </div>

      {analytics.students?.length === 0 ? (
        <EmptyState icon="📊" title="No attendance data" desc="Mark some attendance first to see analytics here." />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 lg:col-span-2">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Attendance % by Student</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                    {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-3 justify-center text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> ≥ {analytics.threshold}% (Good)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> {'<'} {analytics.threshold}% (Low)</span>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Status Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Low Attendance Alert Table */}
      {analytics.lowAttendance?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 bg-red-50/50 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="text-base font-semibold text-red-700">Low Attendance Alert</h3>
              <p className="text-xs text-red-500">{analytics.lowAttendance.length} student(s) below {analytics.threshold}% threshold</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left table-header">Roll No.</th>
                  <th className="px-5 py-3 text-left table-header">Student</th>
                  <th className="px-5 py-3 text-left table-header">Section</th>
                  <th className="px-5 py-3 text-center table-header">Present</th>
                  <th className="px-5 py-3 text-center table-header">Absent</th>
                  <th className="px-5 py-3 text-center table-header">Total</th>
                  <th className="px-5 py-3 text-center table-header">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.lowAttendance.map(s => (
                  <tr key={s.studentId} className="table-row">
                    <td className="px-5 py-3 text-sm font-mono text-slate-600">{s.rollNumber}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">{s.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{s.section}</td>
                    <td className="px-5 py-3 text-center text-sm text-emerald-600 font-semibold">{s.present}</td>
                    <td className="px-5 py-3 text-center text-sm text-red-600 font-semibold">{s.absent}</td>
                    <td className="px-5 py-3 text-center text-sm text-slate-600">{s.total}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        {s.percentage}%
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
