// Shared UI Components

// ── Modal ──────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[92vh] flex flex-col overflow-hidden animate-slide-up`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate pr-2">{title}</h2>
          <button onClick={onClose} aria-label="Close modal" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl p-2 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    present: 'badge-present',
    absent: 'badge-absent',
    late: 'badge-late',
    'on-duty': 'badge-on-duty',
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  };
  const labels = { 'on-duty': 'On Duty', present: 'Present', absent: 'Absent', late: 'Late', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
  return <span className={`${map[status] || 'badge-pending'} whitespace-nowrap text-xs`}>{labels[status] || status}</span>;
}

// ── Stat Card ──────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'blue', sub }) {
  const colors = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-teal-500',
    red: 'from-red-500 to-rose-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-indigo-500',
    teal: 'from-teal-500 to-cyan-500',
  };
  return (
    <div className="stat-card flex items-start gap-3 sm:gap-4 min-w-0">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-lg sm:text-xl flex-shrink-0 shadow-sm`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
      <div className="text-4xl sm:text-5xl mb-3">{icon}</div>
      <h3 className="text-base sm:text-lg font-bold text-slate-700">{title}</h3>
      {desc && <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">{desc}</p>}
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
}

// ── Percentage Circle ──────────────────────────────────────────────
export function PercentageCircle({ value, size = 120, threshold = 75 }) {
  const radius = (size - 16) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (value / 100) * circ;
  const color = value >= threshold ? '#10b981' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl sm:text-2xl font-bold" style={{ color }}>{value}%</div>
      </div>
    </div>
  );
}

// ── Tab Nav ────────────────────────────────────────────────────────
export function TabNav({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none -mx-1 px-1 py-0.5">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${active === t.id ? 'tab-active' : 'tab-inactive'}`}>
          {t.icon && <span className="mr-1.5">{t.icon}</span>}{t.label}
        </button>
      ))}
    </div>
  );
}

// ── Search Bar ─────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9 py-2 text-sm w-full" />
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 animate-slide-up">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
          <span className="text-2xl">{danger ? '🗑️' : '⚠️'}</span>
        </div>
        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 ${danger ? 'btn-danger' : 'btn-warning'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page Header ────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6 gap-3">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ── Select Field ───────────────────────────────────────────────────
export function SelectField({ label, value, onChange, options, placeholder = 'Select...', required }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} className="input-field">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Input Field ────────────────────────────────────────────────────
export function InputField({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="input-field" />
    </div>
  );
}
