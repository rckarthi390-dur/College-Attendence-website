import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge, SearchBar, SelectField, EmptyState, PageHeader, TabNav } from '../../components/ui';

export default function AttendanceLog() {
  const { user } = useAuth();
  const { getStudentAttendanceSummary, getCourses } = useApp();
  const [activeMode, setActiveMode] = useState('period'); // 'period' | 'daily'

  const { records, dailyRecords, periodRecords } = useMemo(
    () => getStudentAttendanceSummary(user.id),
    [user.id]
  );
  const courses = getCourses(user.department);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  const filteredRecords = useMemo(() => {
    let list = activeMode === 'daily' ? [...dailyRecords] : [...periodRecords];
    if (selectedCourse && activeMode === 'period') list = list.filter(r => r.courseId === selectedCourse);
    if (selectedStatus) list = list.filter(r => r.status === selectedStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.courseName.toLowerCase().includes(q) ||
        r.courseCode.toLowerCase().includes(q) ||
        r.date.includes(q)
      );
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, dailyRecords, periodRecords, selectedCourse, selectedStatus, search, activeMode]);

  const modifiedCount = useMemo(() => {
    const list = activeMode === 'daily' ? dailyRecords : periodRecords;
    return list.filter(r => r.wasModified).length;
  }, [dailyRecords, periodRecords, activeMode]);

  return (
    <div className="page-enter">
      <PageHeader
        title="Attendance Log"
        subtitle="Complete date-wise log of your attendance with update history indicators"
      />

      <TabNav 
        tabs={[
          { id: 'period', label: 'Period Log', icon: '📚' },
          { id: 'daily', label: 'Daily (Day Work) Log', icon: '💼' }
        ]} 
        active={activeMode} 
        onChange={v => { setActiveMode(v); setSelectedCourse(''); setSelectedStatus(''); setSearch(''); }}
      />

      {modifiedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">✏️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {modifiedCount} record{modifiedCount > 1 ? 's have' : ' has'} been updated by faculty
            </p>
            <p className="text-xs text-amber-600">
              Entries marked with <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">UPDATED BY FACULTY</span> indicate a past status revision.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder={activeMode === 'daily' ? 'Search date (YYYY-MM-DD)...' : 'Search subject or date (YYYY-MM-DD)...'} />
          {activeMode === 'period' ? (
            <SelectField
              label=""
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={courses.map(c => ({ value: c.id, label: `${c.code} – ${c.name}` }))}
              placeholder="All Subjects"
            />
          ) : (
            <div className="hidden md:block" /> // spacer
          )}
          <SelectField
            label=""
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'present', label: 'Present' },
              { value: 'absent', label: 'Absent' },
              { value: 'late', label: 'Late' },
              { value: 'on-duty', label: 'On Duty' },
            ]}
            placeholder="All Statuses"
          />
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <EmptyState icon="📋" title="No attendance entries found" desc="Try adjusting your filters or search terms." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left table-header">Date</th>
                  <th className="px-5 py-3 text-left table-header">{activeMode === 'daily' ? 'Type' : 'Subject'}</th>
                  <th className="px-5 py-3 text-center table-header">Status</th>
                  <th className="px-5 py-3 text-right table-header">Update Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-700">
                      {new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-800">{r.courseName}</p>
                      <p className="text-xs text-slate-400">
                        {r.courseCode} {activeMode === 'period' && r.period ? `· Period ${r.period}` : ''}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {r.wasModified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <span>✏️</span> Updated by Staff
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Original</span>
                      )}
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
