import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, EmptyState, PageHeader } from '../../components/ui';

export default function LeaveApplication() {
  const { user } = useAuth();
  const { getLeaves, addLeave, deleteLeave } = useApp();
  const { toast } = useToast();

  const [type, setType] = useState('leave'); // 'leave' | 'od'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const leaves = getLeaves({ studentId: user.id });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) {
      toast.warning('Please fill in all required fields.');
      return;
    }
    if (fromDate > toDate) {
      toast.error('From Date cannot be after To Date.');
      return;
    }

    setSubmitting(true);
    try {
      addLeave(user.id, {
        type,
        fromDate,
        toDate,
        reason: reason.trim(),
      });
      toast.success(`${type === 'od' ? 'On-Duty' : 'Leave'} application submitted successfully!`);
      setFromDate('');
      setToDate('');
      setReason('');
    } catch (err) {
      toast.error('Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (id) => {
    try {
      deleteLeave(id);
      toast.info('Application cancelled.');
    } catch (err) {
      toast.error('Failed to cancel application.');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Leave & OD Applications"
        subtitle="Submit requests for Leave or On-Duty (OD) approval from your faculty"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Submit Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
          <h2 className="text-base font-bold text-slate-800 mb-4">New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Request Type *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('leave')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    type === 'leave'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  📅 Absence Leave
                </button>
                <button
                  type="button"
                  onClick={() => setType('od')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    type === 'od'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🔵 On Duty (OD)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From Date *</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To Date *</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason / Justification *</label>
              <textarea
                rows={4}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={type === 'od' ? 'Specify event, competition, or official duty details...' : 'State medical or personal reason...'}
                required
                className="input-field py-2.5 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm font-semibold"
            >
              {submitting ? 'Submitting...' : '🚀 Submit Request'}
            </button>
          </form>
        </div>

        {/* Previous Applications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 mb-4">My Application History</h2>
          {leaves.length === 0 ? (
            <EmptyState icon="📝" title="No leave applications" desc="Your submitted leave or OD requests will appear here." />
          ) : (
            <div className="space-y-3">
              {leaves.map(l => (
                <div key={l.id} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${l.type === 'od' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {l.type === 'od' ? '🔵 On Duty' : '📅 Leave'}
                        </span>
                        <StatusBadge status={l.status} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-2">{l.reason}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        📅 {l.fromDate} → {l.toDate}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Applied on: {new Date(l.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {l.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(l.id)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
