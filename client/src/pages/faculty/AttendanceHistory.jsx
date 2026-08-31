import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, SelectField, PageHeader, EmptyState, Modal } from '../../components/ui';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'on-duty'];
const STATUS_COLORS = {
  present: { active: 'bg-emerald-500 text-white border-emerald-500', inactive: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  absent: { active: 'bg-red-500 text-white border-red-500', inactive: 'bg-red-50 text-red-700 border-red-200' },
  late: { active: 'bg-amber-500 text-white border-amber-500', inactive: 'bg-amber-50 text-amber-700 border-amber-200' },
  'on-duty': { active: 'bg-blue-500 text-white border-blue-500', inactive: 'bg-blue-50 text-blue-700 border-blue-200' },
};
const STATUS_LABELS = { 'on-duty': 'OD', present: 'P', absent: 'A', late: 'L' };

const formatDateDMY = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export default function AttendanceHistory() {
  const { user } = useAuth();
  const { getCourses, getDepartments, getAttendance, getRoster, saveAttendanceSession } = useApp();
  const { toast } = useToast();

  const departments = getDepartments();
  const [attendanceType, setAttendanceType] = useState('period'); // 'daily' | 'period'
  const [dept, setDept] = useState(user.department || '');
  const courses = getCourses(dept);
  const [courseId, setCourseId] = useState('');
  const [period, setPeriod] = useState('1');
  const [section, setSection] = useState('');
  const [date, setDate] = useState('');
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editReason, setEditReason] = useState('');

  // Get unique dates with attendance data
  const datesWithData = useMemo(() => {
    let att = getAttendance({ attendanceType });
    if (attendanceType === 'daily') {
      // no course or period filter
    } else {
      if (courseId) att = att.filter(a => a.courseId === courseId);
      if (period) att = att.filter(a => a.period === period || (!a.period && period === '1'));
    }
    return [...new Set(att.map(a => a.date))].sort((a, b) => b.localeCompare(a));
  }, [courseId, attendanceType, period]);

  const loadHistory = () => {
    if (attendanceType === 'period' && (!courseId || !period)) {
      toast.warning('Please select Course and Period.');
      return;
    }
    if (!section || !date) {
      toast.warning('Please select Section and Date.');
      return;
    }
    const roster = getRoster(courseId, section, date, dept, attendanceType, period);
    setRecords(roster);
    setLoaded(true);
    toast.info(`Loaded ${roster.length} historical records.`);
  };

  const setStatus = (studentId, status) => {
    setRecords(prev => prev.map(s => s.studentId === studentId ? { ...s, status, modified: true } : s));
  };

  const handleSave = async () => {
    if (!records.length) return;
    setSaving(true);
    const modified = records.filter(r => r.modified);
    if (!modified.length) {
      toast.info('No changes to save.');
      setSaving(false);
      return;
    }
    try {
      const { saved, auditEntries } = saveAttendanceSession(courseId, date, records, user.id, attendanceType, period);
      toast.success(`Historical attendance updated. ${auditEntries.length} audit log entries created.`);
      // Reload
      const freshRoster = getRoster(courseId, section, date, dept, attendanceType, period);
      setRecords(freshRoster);
    } catch (err) {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const modifiedCount = records.filter(r => r.modified).length;

  return (
    <div className="page-enter">
      <PageHeader title="Attendance History" subtitle="Edit past attendance records — all changes are logged in the audit trail" />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <SelectField label="Attendance Mode" value={attendanceType} onChange={v => { setAttendanceType(v); setLoaded(false); setDate(''); }}
            options={[{ value: 'daily', label: 'Daily (Day Work)' }, { value: 'period', label: 'Period-wise' }]} required />
          <SelectField label="Department" value={dept} onChange={v => { setDept(v); setCourseId(''); setLoaded(false); }}
            options={departments.map(d => ({ value: d.name, label: d.name }))} />
          {attendanceType === 'period' && (
            <>
              <SelectField label="Course *" value={courseId} onChange={v => { setCourseId(v); setLoaded(false); setDate(''); }}
                options={courses.map(c => ({ value: c.id, label: `${c.code} – ${c.name}` }))} required />
              <SelectField label="Period *" value={period} onChange={v => { setPeriod(v); setLoaded(false); setDate(''); }}
                options={['1', '2', '3', '4', '5', '6', '7', '8'].map(p => ({ value: p, label: `Period ${p}` }))} required />
            </>
          )}
          <SelectField label="Section *" value={section} onChange={v => { setSection(v); setLoaded(false); }}
            options={['A', 'B', 'C', 'D'].map(s => ({ value: s, label: `Section ${s}` }))} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *<span className="text-red-500 ml-1">*</span></label>
            <select value={date} onChange={e => { setDate(e.target.value); setLoaded(false); }} className="input-field">
              <option value="">Select date</option>
              {datesWithData.map(d => (
                <option key={d} value={d}>{formatDateDMY(d)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={loadHistory} className="btn-primary w-full">Load History</button>
          </div>
        </div>
        {datesWithData.length === 0 && (
          <p className="text-xs text-slate-500 mt-3">ℹ️ No attendance records found for this combination yet.</p>
        )}
      </div>

      {loaded && records.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {attendanceType === 'daily' ? 'Day Work Attendance' : `${courses.find(c => c.id === courseId)?.name} (Period ${period})`} · Section {section} · {date ? formatDateDMY(date) : ''}
              </p>
              {modifiedCount > 0 && (
                <p className="text-xs text-amber-600 font-medium mt-0.5">⚠️ {modifiedCount} unsaved change{modifiedCount > 1 ? 's' : ''} — save to create audit entries</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || !modifiedCount} className="btn-primary">
                {saving ? '⏳ Saving...' : `💾 Save Changes${modifiedCount ? ` (${modifiedCount})` : ''}`}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left table-header">#</th>
                    <th className="px-5 py-3 text-left table-header">Roll No.</th>
                    <th className="px-5 py-3 text-left table-header">Name</th>
                    <th className="px-5 py-3 text-center table-header">Original Status</th>
                    <th className="px-5 py-3 text-center table-header">Update Status</th>
                    <th className="px-5 py-3 text-center table-header">Changed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((s, i) => (
                    <tr key={s.studentId} className={`table-row ${s.modified ? 'bg-amber-50/60' : ''}`}>
                      <td className="px-5 py-3 text-sm text-slate-400">{i + 1}</td>
                      <td className="px-5 py-3 text-sm font-mono font-medium text-slate-600">{s.rollNumber}</td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-800">{s.name}</td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={s.originalStatus || s.status} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {STATUS_OPTIONS.map(st => (
                            <button key={st}
                              onClick={() => setStatus(s.studentId, st)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${s.status === st ? STATUS_COLORS[st].active : STATUS_COLORS[st].inactive}`}>
                              {STATUS_LABELS[st]}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {s.modified && <span className="text-amber-600 text-lg">✏️</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {loaded && records.length === 0 && (
        <EmptyState icon="📅" title="No records found" desc="No students found for this combination." />
      )}

      {!loaded && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-slate-700">Historical Attendance Editor</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">Select a course and date to load past records. You can edit any entry at any time — modifications are automatically captured in the audit log.</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            <span>No session locking or time restrictions</span>
          </div>
        </div>
      )}
    </div>
  );
}
