// Shared UI Components

// ── Modal ──────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden animate-slide-up`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
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
  return <span className={map[status] || 'badge-pending'}>{labels[status] || status}</span>;
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
    <div className="stat-card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {desc && <p className="text-sm text-slate-500 mt-1 max-w-sm">{desc}</p>}
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
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold" style={{ color }}>{value}%</div>
      </div>
    </div>
  );
}

// ── Tab Nav ────────────────────────────────────────────────────────
export function TabNav({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`pb-3 px-4 text-sm whitespace-nowrap transition-all duration-200 ${active === t.id ? 'tab-active' : 'tab-inactive'}`}>
          {t.icon && <span className="mr-1.5">{t.icon}</span>}{t.label}
        </button>
      ))}
    </div>
  );
}

// ── Search Bar ─────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9 py-2 text-sm" />
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
          <span className="text-2xl">{danger ? '🗑️' : '⚠️'}</span>
        </div>
        <h3 className="text-lg font-semibold text-center text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
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
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
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
