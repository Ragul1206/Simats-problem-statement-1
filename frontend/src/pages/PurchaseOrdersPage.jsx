import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge, MedalBadge } from '../components/Badge';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Calendar, FileText, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchase-orders');
      setPos(res.data.pos || []);
    } catch (err) {
      console.error('Error fetching POs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPOs = pos.filter(po => 
    po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Purchase Orders (POs)</h1>
          <p className="text-xs text-slate-400 mt-1">Automated purchase orders generated from approved vendor quotations & RFQs</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PO Number, Vendor, Product..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* PO Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPOs.map((po) => (
          <div key={po.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    {po.po_number}
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading mt-1.5 leading-tight">{po.product_name}</h3>
                </div>
                <StatusBadge status={po.status} />
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Supplier:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{po.vendor_name}</span>
                    <MedalBadge tier={po.vendor_medal_tier} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">GSTIN No:</span>
                  <span className="font-mono text-slate-300">{po.vendor_gstin}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Order Quantity:</span>
                  <span className="font-bold text-indigo-300">{po.quantity} Units @ ₹{po.unit_price?.toLocaleString('en-IN')}</span>
                </div>

                {po.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-yellow-300">
                    <span>Loyalty Discount Applied:</span>
                    <span className="font-bold">-₹{po.discount_amount?.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-1 border-t border-slate-800">
                  <span className="text-slate-400 font-semibold">Total Amount:</span>
                  <span className="text-base font-extrabold text-emerald-400 font-heading">
                    ₹{po.total_amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Delivery Date: {po.delivery_date}</span>
              </div>

              <Link
                to={`/purchase-orders/${po.id}`}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition shadow-md flex items-center space-x-1"
              >
                <span>View Formatted PO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
