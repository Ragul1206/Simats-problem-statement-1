import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/Badge';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Search, Calendar, Users, Sparkles, ArrowRight, Tag } from 'lucide-react';

export default function RfqsPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    product_id: '',
    quantity: 10,
    specifications: '',
    required_delivery_date: '',
    payment_terms: 'Net 30',
    vendor_ids: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes, vRes] = await Promise.all([
        api.get('/rfqs'),
        api.get('/inventory/products'),
        api.get('/vendors')
      ]);

      setRfqs(rRes.data.rfqs || []);
      setProducts(pRes.data.products || []);
      setVendors(vRes.data.vendors || []);

      if (pRes.data.products?.length > 0) {
        setFormData(prev => ({ ...prev, product_id: pRes.data.products[0].id }));
      }
    } catch (err) {
      console.error('Error fetching RFQs data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rfqs', formData);
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create RFQ');
    }
  };

  const handleVendorCheckbox = (vId) => {
    const exists = formData.vendor_ids.includes(vId);
    if (exists) {
      setFormData({ ...formData, vendor_ids: formData.vendor_ids.filter(id => id !== vId) });
    } else {
      setFormData({ ...formData, vendor_ids: [...formData.vendor_ids, vId] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">RFQs & Requisitions</h1>
          <p className="text-xs text-slate-400 mt-1">Create Requests for Quotations, assign B2B suppliers & compare AI bids</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New RFQ</span>
        </button>
      </div>

      {/* Customer Privilege Notification (if customer) */}
      {user?.role === 'customer' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-center space-x-3 text-yellow-300 text-xs">
          <Tag className="w-5 h-5 text-yellow-400 shrink-0" />
          <span>Your <strong>{user.customer_tier} Customer Tier ({Math.round((user.discount_rate || 0) * 100)}% Auto-Discount)</strong> will automatically be applied to all purchase orders generated from these RFQs!</span>
        </div>
      )}

      {/* RFQs List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rfqs.map((rfq) => (
          <div key={rfq.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                    {rfq.rfq_number}
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading mt-1 leading-tight">{rfq.title}</h3>
                </div>
                <StatusBadge status={rfq.status} />
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Product:</span>
                  <span className="font-semibold text-white">{rfq.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity Needed:</span>
                  <span className="font-bold text-indigo-300">{rfq.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Required By:</span>
                  <span className="text-slate-300 font-medium">{rfq.required_delivery_date}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="text-slate-400">
                <span className="font-bold text-white">{rfq.quotation_count || 0}</span> Bids Received
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/rfqs/${rfq.id}`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold transition"
                >
                  View Details
                </Link>
                {rfq.quotation_count > 0 && (
                  <Link
                    to={`/rfqs/${rfq.id}/compare`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Recommendation</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create RFQ Modal */}
      {showCreateModal && (
        <Modal title="Create New Request for Quotation (RFQ)" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">RFQ Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Procurement of 10 Enterprise AI Servers"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Product *</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Base ₹{p.unit_price?.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Quantity Required *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Required Delivery Date *</label>
                <input
                  type="date"
                  value={formData.required_delivery_date}
                  onChange={(e) => setFormData({ ...formData, required_delivery_date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payment Conditions</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Net 60 / EMI Available">Net 60 / EMI Available</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 15">Net 15</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Detailed Technical Specifications</label>
              <textarea
                rows="3"
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                placeholder="Enter custom specifications, certifications required..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-2">Assign B2B Suppliers to Invite</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                {vendors.map(v => (
                  <label key={v.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vendor_ids.includes(v.id)}
                      onChange={() => handleVendorCheckbox(v.id)}
                      className="accent-indigo-500"
                    />
                    <span className="truncate text-slate-200">{v.name} ({v.medal_tier})</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 mt-4"
            >
              Issue RFQ & Notify Suppliers
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
