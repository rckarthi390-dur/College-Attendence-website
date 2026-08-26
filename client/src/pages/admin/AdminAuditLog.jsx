import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, SearchBar, SelectField, EmptyState, PageHeader } from '../../components/ui';

export default function AdminAuditLog() {
  const { getAuditLog, getUsers, getCourses } = useApp();
  const { toast } = useToast();

  const [facultyId, setFacultyId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');

  const facultyList = getUsers({ role: 'faculty' });
  const courses = getCourses();

  const logs = useMemo(() => {
    let list = getAuditLog({ facultyId: facultyId || undefined, courseId: courseId || undefined, fromDate, toDate });
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.facultyName.toLowerCase().includes(q) ||
        l.studentName.toLowerCase().includes(q) ||
        l.rollNumber.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q)
      );
    }
    return list;
  }, [facultyId, courseId, fromDate, toDate, search, getAuditLog]);

  const exportAuditCSV = () => {
    if (!logs.length) {
      toast.warning('No audit logs to export.');
      return;
    }
    const headers = ['Audit ID', 'Timestamp', 'Session Date', 'Faculty Staff', 'Student', 'Roll No', 'Course', 'Old Status', 'New Status', 'Reason'];
    const rows = logs.map(l => [
      l.id,
      new Date(l.modifiedAt).toLocaleString('en-IN'),
      l.date,
      `"${l.facultyName}"`,
      `"${l.studentName}"`,
      l.rollNumber,
      `"${l.courseName}"`,
      l.oldStatus,
      l.newStatus,
      `"${l.reason}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `master_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('Master Audit Log exported to CSV!');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Master Audit Log"
        subtitle="System-wide history of all historical attendance changes made by staff over time"
        actions={
          <button onClick={exportAuditCSV} className="btn-secondary flex items-center gap-2">
            <span>📥</span> Export Audit Trail (CSV)
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search staff, student, roll no..." />
          <SelectField
            label=""
            value={facultyId}
            onChange={setFacultyId}
            options={facultyList.map(f => ({ value: f.id, label: `${f.name} (${f.department})` }))}
            placeholder="All Faculty / Staff"
          />
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

      {/* Master Log Table */}
      {logs.length === 0 ? (
        <EmptyState icon="📋" title="No audit entries match filters" desc="Audit log entries will record every time past attendance is edited." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left table-header">Timestamp</th>
                  <th className="px-5 py-3 text-left table-header">Faculty / Staff</th>
                  <th className="px-5 py-3 text-left table-header">Student</th>
                  <th className="px-5 py-3 text-left table-header">Session Date & Course</th>
                  <th className="px-5 py-3 text-center table-header">Status Modification</th>
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
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
                      {l.facultyName}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-800">{l.studentName}</p>
                      <p className="text-xs text-slate-400 font-mono">{l.rollNumber}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-700">{l.courseName}</p>
                      <p className="text-xs text-slate-400">Date: {l.date}</p>
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
