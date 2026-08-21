import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Mail, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Request Token, 2: Reset Password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Password reset request processed.');
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please enter identical passwords.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        resetToken,
        newPassword
      });
      setSuccessMsg(response.data.message || 'Password reset successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md mx-auto w-full space-y-6">
        <Link to="/login" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-white">Reset Password</h1>
            <p className="text-xs text-slate-400">Recover access to your Procurement ERP Account</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg ? (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-xl flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <Link
                to="/login"
                className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition flex items-center justify-center space-x-2 shadow-lg"
              >
                Return to Login Page
              </Link>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Generating Token...' : 'Generate Reset Token'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {message && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-3 rounded-xl">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password Reset Token</label>
                <textarea
                  rows={2}
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Remembered your password? </span>
            <Link to="/login" className="text-amber-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
