import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader, EmptyState, StatusBadge, SelectField } from '../../components/ui';

export default function FacultyLeaves() {
  const { user } = useAuth();
  const { getLeaves, reviewLeave } = useApp();
  const { toast } = useToast();
  const [filter, setFilter] = useState('');

  const leaves = useMemo(() => {
    const all = getLeaves({});
    if (filter) return all.filter(l => l.status === filter);
    return all;
  }, [filter, getLeaves]);

  const handleReview = (id, status) => {
    reviewLeave(id, status, user.id);
    toast.success(`Leave request ${status}!`);
  };

  const pending = leaves.filter(l => l.status === 'pending');

  return (
    <div className="page-enter">
      <PageHeader title="Leave Requests" subtitle="Review and manage student leave and on-duty applications"
        actions={
          <div className="flex gap-2">
            {['', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        } />

      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">📌</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">{pending.length} pending request{pending.length > 1 ? 's' : ''} need your attention</p>
            <p className="text-xs text-amber-600">Review them below and approve or reject.</p>
          </div>
        </div>
      )}

      {leaves.length === 0 ? (
        <EmptyState icon="📝" title="No leave requests" desc="Student leave and OD requests will appear here." />
      ) : (
        <div className="space-y-3">
          {leaves.map(l => (
            <div key={l.id} className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${l.status === 'pending' ? 'border-amber-200' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                    {l.studentName?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{l.studentName}</p>
                      <span className="text-xs text-slate-400">{l.rollNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.type === 'od' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {l.type === 'od' ? '🔵 On Duty' : '📅 Leave'}
                      </span>
                      <StatusBadge status={l.status} />
                    </div>
                    <p className="text-sm text-slate-600 mt-1.5">{l.reason}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>📅 {l.fromDate} → {l.toDate}</span>
                      <span>Applied: {new Date(l.appliedAt).toLocaleDateString('en-IN')}</span>
                      {l.reviewerName && <span>Reviewed by: {l.reviewerName}</span>}
                    </div>
                  </div>
                </div>
                {l.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(l.id, 'approved')}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors">
                      ✓ Approve
                    </button>
                    <button onClick={() => handleReview(l.id, 'rejected')}
                      className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
