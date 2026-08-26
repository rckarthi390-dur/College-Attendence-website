import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge, SearchBar, SelectField, EmptyState, PageHeader } from '../../components/ui';

export default function FacultyAuditLog() {
  const { user } = useAuth();
  const { getAuditLog, getCourses } = useApp();

  const [courseId, setCourseId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');

  const courses = getCourses(user.department);

  const logs = useMemo(() => {
    let list = getAuditLog({ facultyId: user.id, courseId: courseId || undefined, fromDate, toDate });
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.studentName.toLowerCase().includes(q) ||
        l.rollNumber.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q)
      );
    }
    return list;
  }, [user.id, courseId, fromDate, toDate, search, getAuditLog]);

  return (
    <div className="page-enter">
      <PageHeader
        title="My Audit Log"
        subtitle="Automatic record of historical attendance modifications made by you"
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search student name, roll no, or reason..." />
          <SelectField
            label=""
            value={courseId}
            onChange={setCourseId}
            options={courses.map(c => ({ value: c.id, label: `${c.code} – ${c.name}` }))}
            placeholder="All Courses"
          />
          <div>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="input-field"
              placeholder="From Date"
            />
          </div>
          <div>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="input-field"
              placeholder="To Date"
            />
          </div>
        </div>
      </div>

      {/* Log list / table */}
      {logs.length === 0 ? (
        <EmptyState icon="🔍" title="No audit entries" desc="Modifications made to past attendance sessions will be logged here automatically." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left table-header">Modified At</th>
                  <th className="px-5 py-3 text-left table-header">Session Date</th>
                  <th className="px-5 py-3 text-left table-header">Student</th>
                  <th className="px-5 py-3 text-left table-header">Course</th>
                  <th className="px-5 py-3 text-center table-header">Old Status → New Status</th>
                  <th className="px-5 py-3 text-left table-header">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(l => (
                  <tr key={l.id} className="table-row">
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {new Date(l.modifiedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm font-semibold text-slate-700">
                      {l.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-800">{l.studentName}</p>
                      <p className="text-xs text-slate-400">{l.rollNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {l.courseName}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <StatusBadge status={l.oldStatus} />
                        <span className="text-slate-400 font-bold">→</span>
                        <StatusBadge status={l.newStatus} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 italic">
                      "{l.reason}"
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
