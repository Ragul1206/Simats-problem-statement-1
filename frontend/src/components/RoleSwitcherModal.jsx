import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, CreditCard, Boxes, UserCheck, Building, X, CheckCircle2 } from 'lucide-react';

export default function RoleSwitcherModal({ onClose }) {
  const { user, quickSwitchRole } = useAuth();

  const personas = [
    {
      roleKey: 'admin',
      title: 'System Administrator',
      subtitle: 'Full System Control & System Management',
      icon: Shield,
      color: 'from-rose-500 to-pink-600',
      badge: 'Admin'
    },
    {
      roleKey: 'procurement_manager',
      title: 'Procurement Manager',
      subtitle: 'RFQs, AI Quotation Approvals & Vendor Matrix',
      icon: Users,
      color: 'from-indigo-500 to-blue-600',
      badge: 'Procurement'
    },
    {
      roleKey: 'finance_manager',
      title: 'Finance Manager',
      subtitle: 'Vendor Invoices, EMI Schedules & Accounts Payable',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Finance'
    },
    {
      roleKey: 'inventory_manager',
      title: 'Inventory Manager',
      subtitle: 'Stock Reorders & Goods Received Notes (GRN)',
      icon: Boxes,
      color: 'from-amber-500 to-orange-600',
      badge: 'Logistics'
    },
    {
      roleKey: 'customer',
      title: 'Regular B2B Customer (Gold Tier)',
      subtitle: 'Requisitions, 10% Loyalty Auto-Discount & Status',
      icon: UserCheck,
      color: 'from-yellow-500 to-amber-600',
      badge: 'Buyer'
    },
    {
      roleKey: 'vendor',
      title: 'Apex Solutions (B2B Diamond Vendor)',
      subtitle: 'Submit Quotes, Track Assigned RFQs & GSTIN Info',
      icon: Building,
      color: 'from-purple-500 to-indigo-600',
      badge: 'Supplier'
    }
  ];

  const handleSelect = async (roleKey) => {
    await quickSwitchRole(roleKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-800 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold font-heading text-white">Switch Demo User Persona</h2>
          <p className="text-xs text-slate-400 mt-1">Select a role below to test role-based capabilities and permissions instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
          {personas.map((p) => {
            const Icon = p.icon;
            const isCurrent = user?.role === p.roleKey;
            return (
              <button
                key={p.roleKey}
                onClick={() => handleSelect(p.roleKey)}
                className={`text-left p-4 rounded-xl border transition flex items-start space-x-3.5 ${isCurrent
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white truncate">{p.title}</h3>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{p.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
