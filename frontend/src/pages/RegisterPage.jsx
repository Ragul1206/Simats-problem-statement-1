import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Mail, Lock, User, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function RegisterPage() {
  const [accountType, setAccountType] = useState('user'); // 'user' or 'vendor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (accountType === 'vendor') {
        const response = await api.post('/auth/register-vendor', {
          companyName,
          contactPerson: name,
          email,
          password,
          gstin: gstin || '29ABCDE1234F1Z5',
          ownerName: name
        });
        setSuccess('Vendor Account Registered Successfully! Redirecting to login...');
        if (response.data.token) {
          localStorage.setItem('erp_token', response.data.token);
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } else {
        const response = await api.post('/auth/register', {
          name,
          email,
          password,
          role
        });
        setSuccess('Account Created Successfully! Logging you in...');
        if (response.data.token) {
          localStorage.setItem('erp_token', response.data.token);
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register account. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md mx-auto w-full space-y-6">
        <Link to="/login" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portals</span>
        </Link>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Create ERP Account</h1>
            <p className="text-xs text-slate-400">Register a new Buyer, Vendor, or Staff account</p>
          </div>

          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setAccountType('user')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                accountType === 'user'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buyer / User Account
            </button>
            <button
              type="button"
              onClick={() => setAccountType('vendor')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                accountType === 'vendor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vendor Supplier
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {accountType === 'user' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="customer">B2B Customer Buyer</option>
                  <option value="procurement_executive">Procurement Executive</option>
                  <option value="finance_manager">Finance Manager</option>
                  <option value="inventory_manager">Inventory Manager</option>
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Business Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Solutions Pvt Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="29ABCDE1234F1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-xs text-white transition flex items-center justify-center space-x-2 shadow-lg ${
                accountType === 'vendor'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400'
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Already have an ERP account? </span>
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
