import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, LogOut, ChevronDown, Award, Sparkles, Building2, Tag } from 'lucide-react';
import RoleSwitcherModal from './RoleSwitcherModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const roleLabels = {
    admin: 'System Admin',
    procurement_manager: 'Procurement Mgr',
    procurement_executive: 'Procurement Exec',
    finance_manager: 'Finance Manager',
    inventory_manager: 'Inventory Mgr',
    customer: 'Regular Customer',
    vendor: 'B2B Vendor',
  };

  const roleColors = {
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    procurement_manager: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    procurement_executive: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    finance_manager: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    inventory_manager: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    customer: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    vendor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      {/* Brand & Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold font-heading text-white tracking-wide">ProcureAI ERP</h1>
            <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">Enterprise</span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">AI-Powered B2B Procurement & Supply Chain Platform</p>
        </div>
      </div>

      {/* User & Role Switcher Actions */}
      <div className="flex items-center space-x-4">
        {/* Customer Discount Banner (if user is customer) */}
        {user?.role === 'customer' && (
          <div className="hidden lg:flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs px-3 py-1.5 rounded-lg">
            <Tag className="w-4 h-4 text-yellow-400" />
            <span>Customer Privilege: <strong className="font-bold">{user.customer_tier} Tier ({Math.round(user.discount_rate * 100)}% Auto-Discount)</strong></span>
          </div>
        )}

        {/* Demo Quick Role Switcher Button */}
        <button
          onClick={() => setShowRoleModal(true)}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition"
          title="Switch role for demo testing"
        >
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline font-medium">Switch Demo Persona</span>
        </button>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center space-x-3 bg-slate-800/80 hover:bg-slate-800 p-1.5 pr-3 rounded-xl border border-slate-700/60 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium inline-block mt-0.5 ${roleColors[user?.role] || 'bg-slate-700 text-slate-300'}`}>
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {userDropdown && (
            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl p-2 border border-slate-700 text-xs z-50">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowRoleModal(true); setUserDropdown(false); }}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-300 transition"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Switch Role Persona</span>
              </button>
              <button
                onClick={logout}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showRoleModal && <RoleSwitcherModal onClose={() => setShowRoleModal(false)} />}
    </header>
  );
}
