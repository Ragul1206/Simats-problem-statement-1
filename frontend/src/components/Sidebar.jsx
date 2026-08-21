import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Sparkles,
  ShoppingBag,
  Boxes,
  ShieldAlert,
  CreditCard,
  History,
  Tag
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'procurement_manager', 'procurement_executive', 'finance_manager', 'inventory_manager', 'customer', 'vendor'] },
    { label: 'Vendor Directory', path: '/vendors', icon: Users, roles: ['admin', 'procurement_manager', 'procurement_executive', 'finance_manager'] },
    { label: 'RFQs & Requisitions', path: '/rfqs', icon: FileText, roles: ['admin', 'procurement_manager', 'procurement_executive', 'customer', 'vendor'] },
    { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag, roles: ['admin', 'procurement_manager', 'procurement_executive', 'finance_manager', 'inventory_manager', 'customer', 'vendor'] },
    { label: 'Inventory & Stock', path: '/inventory', icon: Boxes, roles: ['admin', 'procurement_manager', 'inventory_manager'] },
    { label: 'Warranty Claims', path: '/warranty', icon: ShieldAlert, roles: ['admin', 'procurement_manager', 'customer', 'vendor'] },
    { label: 'Finance & Payables', path: '/finance', icon: CreditCard, roles: ['admin', 'finance_manager', 'customer', 'vendor'] },
    { label: 'Audit Activity Logs', path: '/audit', icon: History, roles: ['admin', 'procurement_manager'] },
  ];

  const allowedNav = navItems.filter(item => item.roles.includes(user?.role || 'admin'));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Navigation Menu</p>
        </div>

        <nav className="space-y-1">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-white">AI Engine Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Multi-criteria scoring & OCR data extraction enabled for automated quote comparison.
        </p>
      </div>
    </aside>
  );
}
