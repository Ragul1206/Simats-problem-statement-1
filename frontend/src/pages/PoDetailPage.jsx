import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, MedalBadge } from '../components/Badge';
import { ArrowLeft, Printer, ShieldCheck, CreditCard, Building2, User } from 'lucide-react';

export default function PoDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPO();
  }, [id]);

  const fetchPO = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/purchase-orders/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching PO detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-400">Loading Purchase Order document...</div>;
  if (!data || !data.po) return <div className="p-8 text-xs text-rose-400">Purchase Order not found</div>;

  const { po, emi } = data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to="/purchase-orders" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Purchase Orders</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl border border-slate-700 font-semibold transition flex items-center space-x-2"
        >
          <Printer className="w-4 h-4 text-indigo-400" />
          <span>Print Purchase Order</span>
        </button>
      </div>

      {/* Printable Formatted PO Document */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-8 bg-slate-900/90 text-xs shadow-2xl">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold font-heading text-white tracking-wide">ProcureAI ERP</h1>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase">Official PO</span>
            </div>
            <p className="text-slate-400 mt-1">Enterprise Procurement & B2B Supply Chain Contract</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xl font-bold font-mono text-indigo-400 block">{po.po_number}</span>
            <p className="text-slate-400">Date: {po.created_at?.split('T')[0] || '2026-08-21'}</p>
            <div className="mt-1">
              <StatusBadge status={po.status} />
            </div>
          </div>
        </div>

        {/* Vendor & Shipping Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Vendor / Supplier Information</span>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">{po.vendor_name}</h3>
              <MedalBadge tier={po.vendor_medal_tier} />
            </div>
            <p className="text-slate-300 font-mono">GSTIN: {po.vendor_gstin}</p>
            <p className="text-slate-400">Company Owner: {po.vendor_owner}</p>
            <p className="text-slate-400">{po.vendor_address || 'Industrial Corridor, Tech Park'}</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Shipping & Delivery Destination</span>
            <h3 className="text-sm font-bold text-white">Central Warehousing Hub</h3>
            <p className="text-slate-300">{po.shipping_address}</p>
            <p className="text-slate-400">Required Delivery Date: <strong className="text-indigo-300">{po.delivery_date}</strong></p>
          </div>
        </div>

        {/* Item Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">SKU & Item Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr>
                <td className="p-3">
                  <div className="font-bold text-white">{po.product_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">SKU: {po.product_sku} | Category: {po.product_category}</div>
                </td>
                <td className="p-3 text-center font-bold">{po.quantity}</td>
                <td className="p-3 text-right font-mono">₹{po.unit_price?.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right font-bold font-mono">₹{po.subtotal?.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary & EMI Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-800 pt-6">
          <div className="space-y-3 max-w-sm">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Payment & Finance Terms</span>
            <p className="text-slate-300 font-medium">{po.payment_terms}</p>
            {emi && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl space-y-1 text-indigo-300">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>EMI Finance Schedule Active</span>
                </div>
                <p className="text-[11px]">₹{emi.monthly_emi_amount?.toLocaleString('en-IN')}/month over {emi.tenure_months} Months @ {emi.interest_rate_annual}% p.a.</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">₹{po.subtotal?.toLocaleString('en-IN')}</span>
            </div>

            {po.discount_amount > 0 && (
              <div className="flex justify-between text-yellow-300 font-semibold">
                <span>Loyalty Discount:</span>
                <span className="font-mono">-₹{po.discount_amount?.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>GST Tax (18%):</span>
              <span className="font-mono text-slate-200">₹{po.tax_amount?.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-emerald-400 font-heading pt-2 border-t border-slate-800">
              <span>Grand Total:</span>
              <span>₹{po.total_amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
