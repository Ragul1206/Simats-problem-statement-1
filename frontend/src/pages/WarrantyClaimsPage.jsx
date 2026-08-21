import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/Badge';
import Modal from '../components/Modal';
import { ShieldAlert, Plus, Search, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function WarrantyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFileModal, setShowFileModal] = useState(false);

  const [claimForm, setClaimForm] = useState({
    po_id: '',
    item_serial_number: '',
    issue_description: '',
    claim_amount: 0
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        api.get('/warranty'),
        api.get('/purchase-orders')
      ]);

      setClaims(cRes.data.claims || []);
      setPos(pRes.data.pos || []);

      if (pRes.data.pos?.length > 0) {
        setClaimForm(prev => ({ ...prev, po_id: pRes.data.pos[0].id }));
      }
    } catch (err) {
      console.error('Error fetching warranty claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClaim = async (e) => {
    e.preventDefault();
    try {
      await api.post('/warranty', claimForm);
      setShowFileModal(false);
      fetchClaims();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to file claim');
    }
  };

  const handleUpdateStatus = async (claimId, newStatus) => {
    try {
      await api.put(`/warranty/${claimId}/status`, { status: newStatus });
      fetchClaims();
    } catch (err) {
      alert('Failed to update claim status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Warranty Claims Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Track replacement tickets, equipment defects, and vendor warranty SLA resolutions</p>
        </div>

        <button
          onClick={() => setShowFileModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-600/25 flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>File Warranty Claim</span>
        </button>
      </div>

      {/* Claims List Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-base font-bold font-heading text-white">Active Warranty Tickets ({claims.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Ticket Number</th>
                <th className="p-4">PO & Product</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Serial No</th>
                <th className="p-4">Issue Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {claims.map((wc) => (
                <tr key={wc.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-white text-xs">{wc.claim_number}</td>

                  <td className="p-4">
                    <div className="font-bold text-white">{wc.product_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{wc.po_number}</div>
                  </td>

                  <td className="p-4 font-semibold text-slate-200">{wc.vendor_name}</td>

                  <td className="p-4 font-mono text-slate-400">{wc.item_serial_number || 'N/A'}</td>

                  <td className="p-4 text-slate-300 max-w-xs truncate">{wc.issue_description}</td>

                  <td className="p-4"><StatusBadge status={wc.status} /></td>

                  <td className="p-4 text-right">
                    <select
                      value={wc.status}
                      onChange={(e) => handleUpdateStatus(wc.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
                    >
                      <option value="Filed">Filed</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Replacement Shipped">Replacement Shipped</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Warranty Claim Modal */}
      {showFileModal && (
        <Modal title="File Warranty Claim Ticket" onClose={() => setShowFileModal(false)}>
          <form onSubmit={handleFileClaim} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Purchase Order *</label>
              <select
                value={claimForm.po_id}
                onChange={(e) => setClaimForm({ ...claimForm, po_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              >
                {pos.map(po => (
                  <option key={po.id} value={po.id}>{po.po_number} - {po.product_name} ({po.vendor_name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Equipment Serial Number</label>
              <input
                type="text"
                value={claimForm.item_serial_number}
                onChange={(e) => setClaimForm({ ...claimForm, item_serial_number: e.target.value })}
                placeholder="SN-SRV-900-1122"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Defect / Issue Description *</label>
              <textarea
                rows="3"
                value={claimForm.issue_description}
                onChange={(e) => setClaimForm({ ...claimForm, issue_description: e.target.value })}
                placeholder="Describe component failure or defect..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-amber-600/25 mt-4"
            >
              Submit Ticket to Vendor
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
