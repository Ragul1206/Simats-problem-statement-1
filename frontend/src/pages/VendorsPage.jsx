import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MedalBadge, StatusBadge } from '../components/Badge';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, ShieldCheck, Phone, Mail, Building2, User, Award, CreditCard } from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedal, setSelectedMedal] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    owner_pan: '',
    medal_tier: 'Gold',
    payment_terms: 'Net 30',
    supports_emi: true
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vendors', formData);
      setShowAddModal(false);
      fetchVendors();
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        gstin: '',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        owner_pan: '',
        medal_tier: 'Gold',
        payment_terms: 'Net 30',
        supports_emi: true
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create vendor');
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (v.owner_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMedal = selectedMedal === 'All' || v.medal_tier === selectedMedal;
    return matchesSearch && matchesMedal;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Vendor Directory & Verification</h1>
          <p className="text-xs text-slate-400 mt-1">Manage B2B Suppliers, GSTIN Registrations, Owner Profiles & Medal Tier Trust Rankings</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Vendor, GSTIN, or Owner..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Medal Tier Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedMedal(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedMedal === tier
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tier === 'All' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading leading-tight">{vendor.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {vendor.code}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      <span>GSTIN Verified</span>
                    </span>
                  </div>
                </div>
                <MedalBadge tier={vendor.medal_tier} />
              </div>

              {/* Owner Info Box */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Company Owner:</span>
                  </span>
                  <span className="font-semibold text-white">{vendor.owner_name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">GSTIN No:</span>
                  <span className="font-mono font-medium text-slate-300">{vendor.gstin}</span>
                </div>
                {vendor.owner_pan && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Owner PAN:</span>
                    <span className="font-mono text-slate-300">{vendor.owner_pan}</span>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Trust Score</span>
                  <span className="font-bold text-cyan-400 text-xs">{vendor.b2b_trust_score}/100</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Quality</span>
                  <span className="font-bold text-emerald-400 text-xs">{vendor.quality_score}%</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Rating</span>
                  <span className="font-bold text-amber-400 text-xs">⭐ {vendor.rating}</span>
                </div>
              </div>
            </div>

            {/* Footer Terms & View Link */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-indigo-300 font-medium">{vendor.payment_terms}</span>
              <Link
                to={`/vendors/${vendor.id}`}
                className="text-xs text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold transition"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <Modal title="Add New B2B Vendor Profile" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">GSTIN Number *</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase"
                  placeholder="27AAACA1234A1Z5"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Owner Name *</label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Owner PAN Number</label>
                <input
                  type="text"
                  value={formData.owner_pan}
                  onChange={(e) => setFormData({ ...formData, owner_pan: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase"
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">B2B Medal Tier</label>
                <select
                  value={formData.medal_tier}
                  onChange={(e) => setFormData({ ...formData, medal_tier: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Diamond">💎 Diamond Medal (Highest Reliability)</option>
                  <option value="Platinum">🪙 Platinum Medal</option>
                  <option value="Gold">🥇 Gold Medal</option>
                  <option value="Silver">🥈 Silver Medal</option>
                  <option value="Bronze">🥉 Bronze Medal</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Default Payment Terms</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Net 60 / EMI Available">Net 60 / EMI Available</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Advance Payment Required">Advance Payment</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 mt-4"
            >
              Save Vendor Profile
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
