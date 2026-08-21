import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/Badge';
import StatCard from '../components/StatCard';
import { CreditCard, DollarSign, Calendar, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FinancePage() {
  const [data, setData] = useState({
    invoices: [],
    emiSchedules: [],
    discountOffers: [],
    stats: { totalPayables: 0, totalPaid: 0, activeEmiCount: 0, invoiceCount: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/finance/overview');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching finance overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayEMI = async (emiId) => {
    try {
      const res = await api.post('/finance/pay-emi', { emi_id: emiId });
      alert(res.data.message);
      fetchFinance();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to pay installment');
    }
  };

  const { invoices, emiSchedules, discountOffers, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold font-heading text-white">Finance, Payables & EMI Schedules</h1>
        <p className="text-xs text-slate-400 mt-1">Vendor accounts payable, tax invoices, customer discounts, & EMI installment tracking</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vendor Payables"
          value={`₹${stats.totalPayables?.toLocaleString('en-IN')}`}
          subtext="Outstanding Accounts Payable"
          icon={CreditCard}
          color="amber"
        />
        <StatCard
          title="Total Payments Completed"
          value={`₹${stats.totalPaid?.toLocaleString('en-IN')}`}
          subtext="Settled Invoices"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Active EMI Schedules"
          value={stats.activeEmiCount}
          subtext="Monthly Financing Plans"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Total Invoices"
          value={stats.invoiceCount}
          subtext="B2B Tax Invoices Processed"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* EMI Financing Schedules Section */}
      {emiSchedules.length > 0 && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold font-heading text-white">Active EMI Financing Schedules</h3>
              <p className="text-xs text-slate-400">Monthly installment plans with interest rate calculations & due dates</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Invoice / PO</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Principal Total</th>
                  <th className="p-4">Interest Rate</th>
                  <th className="p-4">Monthly EMI</th>
                  <th className="p-4">Installment Progress</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {emiSchedules.map(emi => (
                  <tr key={emi.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono">
                      <span className="font-bold text-white block">{emi.invoice_number}</span>
                      <span className="text-[10px] text-slate-400">{emi.po_number}</span>
                    </td>

                    <td className="p-4 font-semibold text-slate-200">{emi.vendor_name}</td>

                    <td className="p-4 font-bold text-white font-mono">
                      ₹{emi.total_amount?.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 text-indigo-300 font-semibold">{emi.interest_rate_annual}% p.a.</td>

                    <td className="p-4 font-bold text-emerald-400 font-mono">
                      ₹{emi.monthly_emi_amount?.toLocaleString('en-IN')}/mo
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${(emi.paid_installments / emi.tenure_months) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-200 text-xs">{emi.paid_installments}/{emi.tenure_months}</span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      {emi.status === 'Completed' ? (
                        <span className="text-emerald-400 font-bold">Fully Paid</span>
                      ) : (
                        <button
                          onClick={() => handlePayEMI(emi.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md"
                        >
                          Pay Installment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Privilege Discount Vouchers */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-yellow-400" />
          <h3 className="text-base font-bold font-heading text-white">Regular Customer Discount Privileges</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {discountOffers.map(disc => (
            <div key={disc.id} className="bg-yellow-500/10 border border-yellow-500/30 p-3.5 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">{disc.code}</span>
                <span className="font-extrabold text-yellow-300 text-sm">{disc.discount_percent}% OFF</span>
              </div>
              <h4 className="font-bold text-white mt-1">{disc.title}</h4>
              <p className="text-[11px] text-yellow-200/70">Applicable to: {disc.applicable_tier} Tier Buyers</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
