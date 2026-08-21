import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MedalBadge, StatusBadge } from '../components/Badge';
import { ArrowLeft, Building2, User, ShieldCheck, Mail, Phone, MapPin, Award, ShoppingBag, ShieldAlert, FileText } from 'lucide-react';

export default function VendorDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vendors/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching vendor detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-400">Loading vendor details...</div>;
  if (!data || !data.vendor) return <div className="p-8 text-xs text-rose-400">Vendor not found</div>;

  const { vendor, quotes, pos, claims } = data;

  return (
    <div className="space-y-6">
      <Link to="/vendors" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Vendors Directory</span>
      </Link>

      {/* Header Profile Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
              {vendor.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold font-heading text-white">{vendor.name}</h1>
                <MedalBadge tier={vendor.medal_tier} />
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Vendor Code: {vendor.code} | GSTIN: {vendor.gstin}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>GSTIN Verified Supplier</span>
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Company Owner Details</span>
            <p className="text-white font-bold text-sm">{vendor.owner_name}</p>
            <p className="text-slate-400">PAN: {vendor.owner_pan || 'N/A'}</p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Contact Person</span>
            <p className="text-white font-bold text-sm">{vendor.contact_person || vendor.owner_name}</p>
            <p className="text-slate-400">{vendor.email} | {vendor.phone}</p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Terms & Rating</span>
            <p className="text-indigo-300 font-bold text-sm">{vendor.payment_terms}</p>
            <p className="text-amber-400 font-semibold">⭐ {vendor.rating} / 5.0 Rating | {vendor.b2b_trust_score}/100 Trust</p>
          </div>
        </div>
      </div>

      {/* History Tabs / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Orders History */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold font-heading text-white">Purchase Orders History ({pos.length})</h3>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {pos.map(po => (
              <div key={po.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{po.po_number}</span>
                  <span className="text-slate-400">{po.product_name} ({po.quantity} units)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">₹{po.total_amount?.toLocaleString('en-IN')}</span>
                  <StatusBadge status={po.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warranty Claims History */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-heading text-white">Warranty Claims ({claims.length})</h3>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {claims.map(claim => (
              <div key={claim.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{claim.claim_number}</span>
                  <span className="text-slate-400 truncate max-w-xs block">{claim.issue_description}</span>
                </div>
                <StatusBadge status={claim.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
