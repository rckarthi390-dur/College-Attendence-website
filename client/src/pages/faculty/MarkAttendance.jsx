import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SearchBar, SelectField, PageHeader, EmptyState } from '../../components/ui';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'on-duty'];
const STATUS_COLORS = {
  present: { active: 'bg-emerald-500 text-white border-emerald-500', inactive: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  absent: { active: 'bg-red-500 text-white border-red-500', inactive: 'bg-red-50 text-red-700 border-red-200' },
  late: { active: 'bg-amber-500 text-white border-amber-500', inactive: 'bg-amber-50 text-amber-700 border-amber-200' },
  'on-duty': { active: 'bg-blue-500 text-white border-blue-500', inactive: 'bg-blue-50 text-blue-700 border-blue-200' },
};
const STATUS_LABELS = { 'on-duty': 'OD', present: 'P', absent: 'A', late: 'L' };

export default function MarkAttendance() {
  const { user } = useAuth();
  const { getCourses, getDepartments, getRoster, saveAttendanceSession } = useApp();
  const { toast } = useToast();

  const departments = getDepartments();
  const [attendanceType, setAttendanceType] = useState('period'); // 'daily' | 'period'
  const [dept, setDept] = useState(user.department || '');
  const courses = getCourses(dept);
  const [courseId, setCourseId] = useState('');
  const [period, setPeriod] = useState('1');
  const [section, setSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const sections = useMemo(() => {
    if (!dept) return [];
    const students = dept ? [] : [];
    const allSections = ['A', 'B', 'C'];
    return allSections;
  }, [dept]);

  const loadRoster = () => {
    if (attendanceType === 'period' && (!courseId || !period)) {
      toast.warning('Please select Course and Period.');
      return;
    }
    if (!section || !date) {
      toast.warning('Please select Section and Date.');
      return;
    }
    const data = getRoster(courseId, section, date, dept, attendanceType, period);
    setRoster(data);
    setLoaded(true);
    if (data.length === 0) toast.info('No students found for this section.');
    else toast.info(`Loaded ${data.length} students.`);
  };

  const setStatus = (studentId, status) => {
    setRoster(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
  };

  const markAll = (status) => {
    setRoster(prev => prev.map(s => ({ ...s, status })));
    toast.info(`All marked as ${status}.`);
  };

  const filtered = useMemo(() => {
    if (!search) return roster;
    const q = search.toLowerCase();
    return roster.filter(s => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
  }, [roster, search]);

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0, 'on-duty': 0 };
    roster.forEach(s => { c[s.status] = (c[s.status] || 0) + 1; });
    return c;
  }, [roster]);

  const handleSave = async () => {
    if (!roster.length) return;
    setSaving(true);
    try {
      const { saved } = saveAttendanceSession(courseId, date, roster, user.id, attendanceType, period);
      toast.success(`Attendance saved for ${saved.length} students!`);
    } catch (err) {
      toast.error('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const courseName = courses.find(c => c.id === courseId)?.name || '';

  return (
    <div className="page-enter">
      <PageHeader title="Mark Attendance" subtitle="Select course and section to load the student roster" />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 mb-2">
          <SelectField label="Attendance Mode" value={attendanceType} onChange={v => { setAttendanceType(v); setLoaded(false); }}
            options={[{ value: 'daily', label: 'Daily (Day Work)' }, { value: 'period', label: 'Period-wise' }]} required />
          <SelectField label="Department" value={dept} onChange={v => { setDept(v); setCourseId(''); setSection(''); setLoaded(false); }}
            options={departments.map(d => ({ value: d.name, label: d.name }))} placeholder="All Departments" />
          {attendanceType === 'period' && (
            <>
              <SelectField label="Course *" value={courseId} onChange={v => { setCourseId(v); setLoaded(false); }}
                options={courses.map(c => ({ value: c.id, label: `${c.code} – ${c.name}` }))} placeholder="Select course" required />
              <SelectField label="Period *" value={period} onChange={v => { setPeriod(v); setLoaded(false); }}
                options={['1', '2', '3', '4', '5', '6', '7', '8'].map(p => ({ value: p, label: `Period ${p}` }))} placeholder="Select period" required />
            </>
          )}
          <SelectField label="Section *" value={section} onChange={v => { setSection(v); setLoaded(false); }}
            options={['A', 'B', 'C', 'D'].map(s => ({ value: s, label: `Section ${s}` }))} placeholder="Select section" required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); setLoaded(false); }} max={new Date().toISOString().split('T')[0]}
              className="input-field" />
          </div>
          <div className="flex items-end">
            <button onClick={loadRoster} className="btn-primary w-full py-2.5">Load Roster</button>
          </div>
        </div>
      </div>

      {/* Roster */}
      {loaded && roster.length > 0 && (
        <>
          {/* Summary bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {attendanceType === 'daily' ? 'Day Work Attendance' : `${courseName} (Period ${period})`} · Section {section} · {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{roster.length} students total</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{counts.present} P</span>
                <span className="flex items-center gap-1 text-red-600 font-semibold px-2 py-1 bg-red-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{counts.absent} A</span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold px-2 py-1 bg-amber-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{counts.late} L</span>
                <span className="flex items-center gap-1 text-blue-600 font-semibold px-2 py-1 bg-blue-50 rounded-lg"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{counts['on-duty']} OD</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <SearchBar value={search} onChange={setSearch} placeholder="Search by name or roll number..." />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => markAll('present')} className="btn-success text-xs sm:text-sm py-2 flex-1 sm:flex-none">✅ Mark All Present</button>
              <button onClick={() => markAll('absent')} className="btn-danger text-xs sm:text-sm py-2 flex-1 sm:flex-none">❌ Mark All Absent</button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left table-header w-12">#</th>
                    <th className="px-4 py-3 text-left table-header">Roll No.</th>
                    <th className="px-4 py-3 text-left table-header">Student Name</th>
                    <th className="px-4 py-3 text-center table-header">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((s, i) => (
                    <tr key={s.studentId} className="table-row">
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-mono font-medium text-slate-600">{s.rollNumber}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-800">{s.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                          {STATUS_OPTIONS.map(st => (
                            <button key={st}
                              onClick={() => setStatus(s.studentId, st)}
                              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 ${s.status === st ? STATUS_COLORS[st].active : STATUS_COLORS[st].inactive}`}>
                              {STATUS_LABELS[st]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
              {saving ? '⏳ Saving...' : '💾 Save Attendance'}
            </button>
          </div>
        </>
      )}

      {loaded && roster.length === 0 && (
        <EmptyState icon="👥" title="No students found" desc="No students in this section/department combination." />
      )}

      {!loaded && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700">Ready to Mark Attendance</h3>
          <p className="text-slate-500 text-sm mt-1">Select Department, Course, Section and Date then click <strong>Load Roster</strong></p>
        </div>
      )}
    </div>
  );
}
