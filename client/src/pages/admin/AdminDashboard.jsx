import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatCard, EmptyState } from '../../components/ui';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { getUsers, getCourses, getDepartments, getAuditLog, getLeaves, getSettings } = useApp();

  const students = getUsers({ role: 'student' });
  const faculty = getUsers({ role: 'faculty' });
  const courses = getCourses();
  const departments = getDepartments();
  const auditLogs = getAuditLog();
  const pendingLeaves = getLeaves({ status: 'pending' });
  const settings = getSettings();

  const recentAudits = auditLogs.slice(0, 5);

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {settings.institutionName} · Academic Year {settings.academicYear}
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={students.length} icon="🎓" color="blue" sub="Enrolled across depts" />
        <StatCard label="Faculty / Staff" value={faculty.length} icon="👨‍🏫" color="green" sub="Active instructors" />
        <StatCard label="Courses Assigned" value={courses.length} icon="📚" color="purple" sub={`${departments.length} departments`} />
        <StatCard label="Audit Log Entries" value={auditLogs.length} icon="📋" color="amber" sub="System-wide history" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Department Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4">🏛️ Departments Overview</h2>
          <div className="space-y-3">
            {departments.map(dept => {
              const deptStudents = students.filter(s => s.department === dept.name);
              const deptFaculty = faculty.filter(f => f.department === dept.name);
              const deptCourses = courses.filter(c => c.department === dept.name);
              return (
                <div key={dept.id} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{dept.name} ({dept.code})</p>
                      <p className="text-xs text-slate-400 mt-0.5">HOD: {dept.hod ? faculty.find(f => f.id === dept.hod)?.name || 'Assigned' : 'Not assigned'}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg">🎓 {deptStudents.length} Students</span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg">👨‍🏫 {deptFaculty.length} Staff</span>
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-lg">📚 {deptCourses.length} Courses</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Activity & Master Audit Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">📋 Recent System Audits</h2>
            <span className="text-xs text-slate-400">{auditLogs.length} total modifications</span>
          </div>
          {recentAudits.length === 0 ? (
            <EmptyState icon="🔍" title="No recent modifications" desc="Staff attendance modifications will appear here in real-time." />
          ) : (
            <div className="space-y-3">
              {recentAudits.map(log => (
                <div key={log.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{log.facultyName} updated {log.studentName}</span>
                    <span className="text-slate-400 font-mono">{new Date(log.modifiedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-500">{log.courseName} · Date: {log.date}</p>
                  <p className="text-xs font-semibold mt-1">
                    Status: <span className="uppercase text-slate-600">{log.oldStatus}</span> → <span className="uppercase text-indigo-600">{log.newStatus}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
