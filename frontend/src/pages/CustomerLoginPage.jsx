import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Lock, Mail, ArrowLeft, Tag, Sparkles } from 'lucide-react';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('customer@apex.com');
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
      await login(email, password, 'customer');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid customer portal credentials');
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

        {/* Discount Loyalty Highlights Banner */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 p-4 rounded-2xl flex items-center space-x-3 text-yellow-300">
          <Tag className="w-8 h-8 text-yellow-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold font-heading uppercase tracking-wider">Regular Customer Privilege</h3>
            <p className="text-[11px] text-yellow-200/80 mt-0.5">Gold Buyers enjoy 10% auto-discount on all procurement orders & custom promo offers.</p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-white">Customer Portal Login</h1>
            <p className="text-xs text-slate-400">Sign in to manage requisitions, discounts, & order tracking</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition"
                  placeholder="customer@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-yellow-500/25 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Customer Portal'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">Demo Account: <strong className="text-yellow-400">customer@apex.com</strong> (Gold Tier)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
