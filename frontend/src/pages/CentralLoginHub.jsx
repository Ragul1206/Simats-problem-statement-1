import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, UserCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function CentralLoginHub() {
  const { quickSwitchRole } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (roleKey) => {
    await quickSwitchRole(roleKey);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Enterprise Procurement ERP System v1.0</span>
          </div>
          <h1 className="text-4xl font-extrabold font-heading text-white tracking-tight sm:text-5xl">
            Select Your Access Portal
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Choose your authorized portal to sign in, or create a new account to get started.
          </p>

          <div className="flex justify-center space-x-4 pt-2">
            <Link to="/register" className="inline-flex items-center space-x-2 text-xs font-semibold bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl hover:bg-cyan-600/30 transition">
              <span>Create New Account</span>
            </Link>
            <Link to="/forgot-password" className="inline-flex items-center space-x-2 text-xs font-semibold bg-amber-600/20 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl hover:bg-amber-600/30 transition">
              <span>Forgot Password?</span>
            </Link>
          </div>
        </div>

        {/* 2 Main Dedicated Portal Cards (Company & Customer ONLY) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Card 1: Company / Enterprise Login */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-indigo-500/50 group space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading text-white">Company Portal</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Internal Management, Admins, Procurement Managers, Finance Leads, & Inventory Control.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Link
                to="/login/company"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/25"
              >
                <span>Company Staff Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDemoLogin('procurement_manager')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 px-3 rounded-xl transition"
              >
                Demo as Procurement Mgr
              </button>
            </div>
          </div>

          {/* Card 2: Customer / Buyer Login */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-yellow-500/50 group space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold font-heading text-white">Customer Portal</h2>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2.5 py-0.5 rounded font-bold">10% Off</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  B2B Buyers & Regular Customers with Loyalty Discount Tiers, Requisitions, & PO Tracking.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Link
                to="/login/customer"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-yellow-500/25"
              >
                <span>Customer Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDemoLogin('customer')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-400 text-xs py-2.5 px-3 rounded-xl transition"
              >
                Demo as Gold Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
