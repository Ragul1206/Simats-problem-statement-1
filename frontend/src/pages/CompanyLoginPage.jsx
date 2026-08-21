import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function CompanyLoginPage() {
  const [email, setEmail] = useState('pm@company.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'company');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials for Company Portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md mx-auto w-full space-y-6">
        <Link to="/login" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Portals</span>
        </Link>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-white">Company Portal Login</h1>
            <p className="text-xs text-slate-400">Sign in with your Enterprise Employee & Executive credentials</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Company Portal'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Need a new account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Create Account / Register
            </Link>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5 text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Test Login Credentials</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">Password: password123</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setEmail('admin@company.com'); setPassword('password123'); }}
                className="p-2 bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 border border-slate-700/50 rounded-lg text-left transition group"
              >
                <div className="text-[10px] font-bold text-rose-400">Admin</div>
                <div className="text-[9px] text-slate-400 truncate">admin@company.com</div>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('pm@company.com'); setPassword('password123'); }}
                className="p-2 bg-slate-800/80 hover:bg-indigo-500/20 hover:border-indigo-500/40 border border-slate-700/50 rounded-lg text-left transition group"
              >
                <div className="text-[10px] font-bold text-indigo-300">Procurement</div>
                <div className="text-[9px] text-slate-400 truncate">pm@company.com</div>
              </button>

              <button
                type="button"
                onClick={() => { setEmail('finance@company.com'); setPassword('password123'); }}
                className="p-2 bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-700/50 rounded-lg text-left transition group"
              >
                <div className="text-[10px] font-bold text-emerald-300">Finance</div>
                <div className="text-[9px] text-slate-400 truncate">finance@company.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
