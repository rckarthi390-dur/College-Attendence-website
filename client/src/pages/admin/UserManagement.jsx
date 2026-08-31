import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { SearchBar, SelectField, PageHeader, EmptyState, Modal, ConfirmDialog } from '../../components/ui';

const formatDateDMY = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const formatDateYMD = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export default function UserManagement() {
  const { getUsers, addUser, updateUser, deleteUser, getDepartments } = useApp();
  const { toast } = useToast();

  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const departments = getDepartments();

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password',
    role: 'student',
    department: 'Computer Science',
    rollNumber: '',
    employeeId: '',
    section: 'A',
    year: 3,
    phone: '',
  });

  const users = useMemo(() => {
    return getUsers({ role: roleFilter || undefined, department: deptFilter || undefined });
  }, [roleFilter, deptFilter, getUsers]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q))
    );
  }, [users, search]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: 'password',
      role: 'student',
      department: departments[0]?.name || 'Computer Science',
      rollNumber: '',
      dob: '01/01/2004',
      employeeId: '',
      section: 'A',
      year: 3,
      phone: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      department: user.department || '',
      rollNumber: user.rollNumber || '',
      dob: formatDateDMY(user.dob || '2004-01-01'),
      employeeId: user.employeeId || '',
      section: user.section || 'A',
      year: user.year || 3,
      phone: user.phone || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.warning('Name and Email are required.');
      return;
    }

    if (formData.role === 'student' && formData.dob) {
      const parts = formData.dob.split('/');
      if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
        toast.warning('Date of Birth must be in DD/MM/YYYY format.');
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        dob: formData.role === 'student' ? formatDateYMD(formData.dob) : ''
      };
      if (editingUser) {
        if (!payload.password) delete payload.password;
        updateUser(editingUser.id, payload);
        toast.success(`User "${formData.name}" updated!`);
      } else {
        addUser(payload);
        toast.success(`User "${formData.name}" created!`);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteUser(deleteId);
      toast.info('User removed.');
      setDeleteId(null);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="User Management"
        subtitle="Add, edit, or remove Students, Faculty/Staff, and System Administrators"
        actions={
          <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
            <span>➕</span> Add New User
          </button>
        }
      />

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, roll no, employee ID..." />
          <SelectField
            label=""
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'student', label: 'Students' },
              { value: 'faculty', label: 'Faculty / Staff' },
              { value: 'admin', label: 'Administrators' },
            ]}
            placeholder="All User Roles"
          />
          <SelectField
            label=""
            value={deptFilter}
            onChange={setDeptFilter}
            options={departments.map(d => ({ value: d.name, label: d.name }))}
            placeholder="All Departments"
          />
        </div>
      </div>

      {/* User Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState icon="👥" title="No users found" desc="Try adjusting search or role filters." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left table-header">User</th>
                  <th className="px-5 py-3 text-left table-header">Role</th>
                  <th className="px-5 py-3 text-left table-header">Department</th>
                  <th className="px-5 py-3 text-left table-header">ID / Roll No</th>
                  <th className="px-5 py-3 text-left table-header">Phone</th>
                  <th className="px-5 py-3 text-right table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : u.role === 'faculty'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">
                      {u.department}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono text-slate-600">
                      {u.rollNumber || u.employeeId || '—'} {u.section ? `(Sec ${u.section})` : ''}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {u.phone ? (
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-flex items-center gap-1.5">
                          <span>📞</span> {u.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No phone</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-colors"
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.name}` : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="input-field"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty / Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="input-field"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number *</label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={e => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS21011"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth (DOB) *</label>
                <input
                  type="text"
                  value={formData.dob || ''}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <select
                  value={formData.section}
                  onChange={e => setFormData({ ...formData, section: e.target.value })}
                  className="input-field"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {formData.role === 'faculty' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="e.g. FAC006"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
            />
          </div>

          {formData.role !== 'student' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password {editingUser ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove User?"
        message="This action will delete the user account permanently. Attendance records will remain for auditing."
        danger
      />
    </div>
  );
}
