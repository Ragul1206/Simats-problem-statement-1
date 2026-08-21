import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { StatusBadge, MedalBadge } from '../components/Badge';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Boxes,
  Sparkles,
  Plus,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    vendors: [],
    rfqs: [],
    pos: [],
    claims: [],
    products: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vRes, rRes, pRes, wRes, iRes] = await Promise.all([
        api.get('/vendors').catch(() => ({ data: { vendors: [] } })),
        api.get('/rfqs').catch(() => ({ data: { rfqs: [] } })),
        api.get('/purchase-orders').catch(() => ({ data: { pos: [] } })),
        api.get('/warranty').catch(() => ({ data: { claims: [] } })),
        api.get('/inventory/products').catch(() => ({ data: { products: [] } })),
      ]);

      setData({
        vendors: vRes.data.vendors || [],
        rfqs: rRes.data.rfqs || [],
        pos: pRes.data.pos || [],
        claims: wRes.data.claims || [],
        products: iRes.data.products || []
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Spend calculations
  const totalSpend = data.pos.reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const totalSavings = Math.round(totalSpend * 0.14); // 14% estimated AI savings
  const activeClaimsCount = data.claims.filter(c => ['Filed', 'Under Review'].includes(c.status)).length;
  const lowStockCount = data.products.filter(p => (p.stock_quantity || 0) <= (p.reorder_level || 5)).length;

  // Chart Data
  const spendChartData = [
    { month: 'Apr', spend: 420000 },
    { month: 'May', spend: 680000 },
    { month: 'Jun', spend: 850000 },
    { month: 'Jul', spend: 1120000 },
    { month: 'Aug', spend: totalSpend > 0 ? totalSpend : 1253160 },
  ];

  const rfqPieData = [
    { name: 'Open', value: data.rfqs.filter(r => r.status === 'Open').length || 1, color: '#3b82f6' },
    { name: 'Quotes Received', value: data.rfqs.filter(r => r.status === 'Quotes Received').length || 2, color: '#6366f1' },
    { name: 'Closed', value: data.rfqs.filter(r => r.status === 'Closed').length || 1, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 to-slate-900">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold font-heading text-white">
              Welcome Back, {user?.name} 👋
            </h1>
            {user?.customer_tier && (
              <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2.5 py-0.5 rounded-full border border-yellow-500/30 font-bold">
                {user.customer_tier} Tier Customer ({Math.round((user.discount_rate || 0) * 100)}% Discount)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Procurement Operations Overview & Multi-Criteria AI Supplier Analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/rfqs"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New RFQ</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total B2B Vendors"
          value={data.vendors.length}
          subtext="Verified Suppliers & GSTINs"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Active RFQs"
          value={data.rfqs.length}
          subtext="Requisitions in Pipeline"
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="Total Procurement Spend"
          value={`₹${totalSpend.toLocaleString('en-IN')}`}
          subtext="Approved Purchase Orders"
          icon={ShoppingBag}
          color="emerald"
          trend="+12% YoY"
        />
        <StatCard
          title="AI Cost Savings"
          value={`₹${totalSavings.toLocaleString('en-IN')}`}
          subtext="Saved via AI Quote Engine"
          icon={Sparkles}
          color="purple"
          trend="14% Avg Savings"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-heading text-white">Procurement Spend Analytics</h3>
              <p className="text-xs text-slate-400">Monthly breakdown of purchase order totals</p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded">2026 Trend</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendChartData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spend']}
                />
                <Bar dataKey="spend" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RFQ Status Pie Chart & Alerts */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-heading text-white">RFQ Status Distribution</h3>
            <p className="text-xs text-slate-400">Requisitions pipeline status breakdown</p>
            
            <div className="h-44 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rfqPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {rfqPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Warnings / Notifications Box */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {activeClaimsCount > 0 && (
              <Link to="/warranty" className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 hover:bg-amber-500/20 transition">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>{activeClaimsCount} Active Warranty Claims</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {lowStockCount > 0 && (
              <Link to="/inventory" className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 hover:bg-rose-500/20 transition">
                <div className="flex items-center space-x-2">
                  <Boxes className="w-4 h-4 text-rose-400" />
                  <span>{lowStockCount} Products Low on Stock</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Top B2B Medal Suppliers Table Spotlight */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold font-heading text-white">Top Rated B2B Medal Suppliers</h3>
            <p className="text-xs text-slate-400">Verified vendors with GSTIN, owner info & performance ratings</p>
          </div>
          <Link to="/vendors" className="text-xs text-indigo-400 hover:underline font-semibold flex items-center space-x-1">
            <span>View All Suppliers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Vendor Name</th>
                <th className="p-3">GSTIN</th>
                <th className="p-3">Medal Tier</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Company Owner</th>
                <th className="p-3 text-right">Payment Terms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.vendors.slice(0, 4).map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-white">{v.name}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{v.gstin}</td>
                  <td className="p-3"><MedalBadge tier={v.medal_tier} /></td>
                  <td className="p-3 font-bold text-amber-400">⭐ {v.rating} / 5.0</td>
                  <td className="p-3 text-slate-300">{v.owner_name}</td>
                  <td className="p-3 text-right font-medium text-indigo-300">{v.payment_terms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
