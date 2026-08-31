import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader, EmptyState, Modal, ConfirmDialog, TabNav } from '../../components/ui';

export default function CourseManagement() {
  const { getCourses, addCourse, updateCourse, deleteCourse, getDepartments, addDepartment, updateDepartment, deleteDepartment, getUsers } = useApp();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('courses');

  const courses = getCourses() || [];
  const departments = getDepartments() || [];
  const facultyList = getUsers({ role: 'faculty' }) || [];

  // Course Modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ name: '', code: '', department: 'Computer Science', credits: 4, faculty: '' });

  // Department Modal state
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', hod: '' });

  // Confirm delete
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [deleteDeptId, setDeleteDeptId] = useState(null);

  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({ name: '', code: '', department: departments[0]?.name || 'Computer Science', credits: 4, faculty: facultyList[0]?.id || '' });
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c) => {
    setEditingCourse(c);
    setCourseForm({ name: c.name, code: c.code, department: c.department, credits: c.credits, faculty: c.faculty || '' });
    setCourseModalOpen(true);
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.code) {
      toast.warning('Course name and code are required.');
      return;
    }

    try {
      if (editingCourse) {
        updateCourse(editingCourse.id, courseForm);
        toast.success(`Course "${courseForm.code}" updated!`);
      } else {
        addCourse(courseForm);
        toast.success(`Course "${courseForm.code}" added!`);
      }
      setCourseModalOpen(false);
    } catch (err) {
      toast.error('Failed to save course.');
    }
  };

  const handleDeleteCourse = () => {
    if (deleteCourseId) {
      deleteCourse(deleteCourseId);
      toast.info('Course deleted.');
      setDeleteCourseId(null);
    }
  };

  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', code: '', hod: '' });
    setDeptModalOpen(true);
  };

  const handleOpenEditDept = (d) => {
    setEditingDept(d);
    setDeptForm({ name: d.name, code: d.code, hod: d.hod || '' });
    setDeptModalOpen(true);
  };

  const handleDeptSubmit = (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) {
      toast.warning('Department name and code are required.');
      return;
    }
    try {
      if (editingDept) {
        updateDepartment(editingDept.id, deptForm);
        toast.success(`Department "${deptForm.name}" updated!`);
      } else {
        addDepartment(deptForm);
        toast.success(`Department "${deptForm.name}" created!`);
      }
      setDeptModalOpen(false);
      setDeptForm({ name: '', code: '', hod: '' });
    } catch (err) {
      toast.error('Failed to save department.');
    }
  };

  const handleDeleteDept = () => {
    if (deleteDeptId) {
      deleteDepartment(deleteDeptId);
      toast.info('Department removed.');
      setDeleteDeptId(null);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Course & Academic Management"
        subtitle="Manage academic departments, courses, timetables, and faculty assignments"
      />

      <TabNav
        tabs={[
          { id: 'courses', label: 'Courses & Subjects', icon: '📚' },
          { id: 'departments', label: 'Departments & HODs', icon: '🏛️' },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={handleOpenAddCourse} className="btn-primary flex items-center gap-2">
              <span>➕</span> Add New Course
            </button>
          </div>

          {courses.length === 0 ? (
            <EmptyState icon="📚" title="No courses created yet" desc="Add courses to assign them to faculty and start tracking attendance." />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c, idx) => {
                if (!c) return null;
                const assignedFaculty = facultyList.find(f => f && f.id === c.faculty);
                return (
                  <div key={c.id || idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold font-mono text-xs">
                          {c.code || 'N/A'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{c.credits} Credits</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800">{c.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Dept: {c.department}</p>
                      <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
                        <span>👨‍🏫 Instructor:</span>
                        <strong className="text-slate-800">{assignedFaculty?.name || 'Unassigned'}</strong>
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-50">
                      <button
                        onClick={() => handleOpenEditCourse(c)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeleteCourseId(c.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={handleOpenAddDept} className="btn-primary flex items-center gap-2">
              <span>➕</span> Add Department
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d, idx) => {
              if (!d) return null;
              // Check if HOD is stored as ID or string name
              const hodUser = facultyList.find(f => f && f.id === d.hod);
              const hodDisplay = hodUser ? hodUser.name : (d.hod || 'Not assigned');
              return (
                <div key={d.id || idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold font-mono text-xs">
                        {d.code || 'N/A'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{d.name}</h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Head of Dept (HOD): <strong className="text-slate-800">{hodDisplay}</strong>
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-50">
                    <button
                      onClick={() => handleOpenEditDept(d)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleteDeptId(d.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.code}` : 'Add New Course'}
      >
        <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course Name *</label>
            <input
              type="text"
              value={courseForm.name}
              onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
              required
              placeholder="e.g. Advanced Data Structures"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                value={courseForm.code}
                onChange={e => setCourseForm({ ...courseForm, code: e.target.value })}
                required
                placeholder="e.g. CS102"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                value={courseForm.credits}
                onChange={e => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
              <select
                value={courseForm.department}
                onChange={e => setCourseForm({ ...courseForm, department: e.target.value })}
                className="input-field"
              >
                {(departments || []).map((d, idx) => {
                  if (!d) return null;
                  return <option key={d.id || idx} value={d.name || ''}>{d.name || 'Unnamed'}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Faculty</label>
              <select
                value={courseForm.faculty}
                onChange={e => setCourseForm({ ...courseForm, faculty: e.target.value })}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {(facultyList || []).map((f, idx) => {
                  if (!f) return null;
                  return <option key={f.id || idx} value={f.id || ''}>{f.name || 'Unnamed'} ({f.department || 'General'})</option>;
                })}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setCourseModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCourse ? 'Save Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.code}` : 'Add Department'}
      >
        <form onSubmit={handleDeptSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              value={deptForm.name}
              onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
              required
              placeholder="e.g. Information Technology"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                value={deptForm.code}
                onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                required
                placeholder="e.g. IT"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">HOD Name</label>
              <input
                type="text"
                list="faculty-list"
                value={deptForm.hod}
                onChange={e => setDeptForm({ ...deptForm, hod: e.target.value })}
                placeholder="Type HOD Name or Select"
                className="input-field"
              />
              <datalist id="faculty-list">
                {(facultyList || []).map(f => (
                  <option key={f.id} value={f.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setDeptModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingDept ? 'Save Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Course Delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteCourseId)}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course?"
        message="This will remove the course definition. Attendance entries associated with it will remain."
        danger
      />

      {/* Confirm Dept Delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteDeptId)}
        onClose={() => setDeleteDeptId(null)}
        onConfirm={handleDeleteDept}
        title="Delete Department?"
        message="This action cannot be undone."
        danger
      />
    </div>
  );
}
