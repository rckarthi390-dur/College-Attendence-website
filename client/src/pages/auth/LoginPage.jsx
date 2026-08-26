import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DEMO_ROLES = [
  { role: 'admin', label: 'Administrator', icon: '🛡️', desc: 'Full system access', color: 'from-blue-600 to-indigo-600', email: 'admin@college.edu' },
  { role: 'faculty', label: 'Faculty / Staff', icon: '👨‍🏫', desc: 'Attendance & analytics', color: 'from-emerald-600 to-teal-600', email: 'anand@college.edu' },
  { role: 'student', label: 'Student', icon: '🎓', desc: 'View own attendance', color: 'from-purple-600 to-indigo-600', email: 'arjun@student.edu' },
];

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [mode, setMode] = useState('demo'); // 'demo' | 'login'

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      login(email, password);
      toast.success('Welcome back! Redirecting...');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (role) => {
    try {
      demoLogin(role);
      toast.success(`Logged in as ${role}!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl">🎓</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">College Attendance System</h1>
          <p className="text-slate-400">Sri Venkateswara College of Engineering · 2024-25</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Demo Login Panel */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-1">Quick Demo Access</h2>
            <p className="text-slate-400 text-sm mb-5">Click any role to log in instantly with demo data</p>
            <div className="space-y-3">
              {DEMO_ROLES.map(r => (
                <button key={r.role} onClick={() => handleDemo(r.role)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group text-left">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{r.label}</p>
                    <p className="text-slate-400 text-xs truncate">{r.email}</p>
                    <p className="text-slate-500 text-xs">{r.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-xl">
              <p className="text-blue-300 text-xs text-center">💡 All demo accounts use <strong>password</strong> as the password</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-1">Sign In</h2>
            <p className="text-slate-400 text-sm mb-5">Use your institutional credentials</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@college.edu"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPwd ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 active:scale-95">
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            {/* Quick fill buttons */}
            <div className="mt-5">
              <p className="text-slate-500 text-xs mb-3 text-center">Or fill credentials quickly:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {DEMO_ROLES.map(r => (
                  <button key={r.role} type="button"
                    onClick={() => { setEmail(r.email); setPassword('password'); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '✅', label: 'Smart Attendance', desc: 'Present, Absent, Late, OD' },
            { icon: '📈', label: 'Live Analytics', desc: 'Charts & 75% alerts' },
            { icon: '📋', label: 'Audit Trails', desc: 'Full modification history' },
            { icon: '📝', label: 'Leave Management', desc: 'OD & absence requests' },
          ].map(f => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="text-white text-xs font-semibold">{f.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
