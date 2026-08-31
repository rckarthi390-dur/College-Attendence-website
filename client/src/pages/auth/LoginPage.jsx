import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const { login, studentLogin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'student'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'staff') {
        await login(email, password);
      } else {
        await studentLogin(rollNumber, dob);
      }
      toast.success('Welcome back! Redirecting...');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
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

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl">🎓</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">College Attendance Portal</h1>
          <p className="text-slate-400">G.T.N. Arts College</p>
        </div>

        {/* Centered Premium Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
          {/* Tab buttons inside the card */}
          <div className="flex bg-black/20 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('staff'); setEmail(''); setPassword(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'staff' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
              👨‍🏫 Staff & Admin
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setRollNumber(''); setDob(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'student' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
              🎓 Student Login
            </button>
          </div>

          <h2 className="text-white font-semibold text-lg mb-1">
            {activeTab === 'staff' ? 'Sign In as Staff / Admin' : 'Sign In as Student'}
          </h2>
          <p className="text-slate-400 text-xs mb-5">
            {activeTab === 'staff' ? 'Enter institutional email and password' : 'Enter your Roll Number and Date of Birth'}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {activeTab === 'staff' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="name@college.edu"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-sm">
                      {showPwd ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Roll / Register Number</label>
                  <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)} required
                    placeholder="e.g. CS21001"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Date of Birth (DOB)</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 active:scale-95 mt-2">
              {loading ? 'Verifying...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
