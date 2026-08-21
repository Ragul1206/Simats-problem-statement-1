import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, MedalBadge } from '../components/Badge';
import Modal from '../components/Modal';
import { ArrowLeft, Sparkles, Upload, FileText, Calendar, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RfqDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Quote Upload state
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [quoteFile, setQuoteFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rfqs/${id}`);
      setData(res.data);
      if (res.data.assignedVendors?.length > 0) {
        setSelectedVendorId(res.data.assignedVendors[0].id);
      }
    } catch (err) {
      console.error('Error fetching RFQ detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadQuote = async (e) => {
    e.preventDefault();
    if (!selectedVendorId) return alert('Select vendor');

    const formData = new FormData();
    formData.append('rfq_id', id);
    formData.append('vendor_id', selectedVendorId);
    if (quoteFile) formData.append('quoteFile', quoteFile);

    try {
      setUploading(true);
      await api.post('/quotations/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-400">Loading RFQ details...</div>;
  if (!data || !data.rfq) return <div className="p-8 text-xs text-rose-400">RFQ not found</div>;

  const { rfq, assignedVendors, quotations } = data;

  return (
    <div className="space-y-6">
      <Link to="/rfqs" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to RFQs List</span>
      </Link>

      {/* RFQ Header Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 font-bold">
                {rfq.rfq_number}
              </span>
              <StatusBadge status={rfq.status} />
            </div>
            <h1 className="text-2xl font-bold font-heading text-white mt-1">{rfq.title}</h1>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-4 py-2.5 rounded-xl font-semibold transition flex items-center space-x-2"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Quotation File</span>
            </button>

            {quotations.length > 0 && (
              <Link
                to={`/rfqs/${id}/compare`}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Recommendation Engine</span>
              </Link>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Product & Quantity</span>
            <p className="text-white font-bold text-sm">{rfq.product_name}</p>
            <p className="text-indigo-300 font-semibold">{rfq.quantity} Units Required</p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Required Delivery</span>
            <p className="text-white font-bold text-sm">{rfq.required_delivery_date}</p>
            <p className="text-slate-400">Terms: {rfq.payment_terms}</p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Technical Specifications</span>
            <p className="text-slate-300 truncate">{rfq.specifications || 'Standard specifications'}</p>
          </div>
        </div>
      </div>

      {/* Submitted Quotations List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold font-heading text-white">Received Vendor Quotations ({quotations.length})</h3>
            <p className="text-xs text-slate-400">AI-extracted bid parameters ready for comparative analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotations.map(q => (
            <div key={q.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">{q.vendor_name}</h4>
                  <MedalBadge tier={q.vendor_medal_tier} />
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-emerald-400 font-heading block">
                    ₹{q.unit_price?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">Total: ₹{q.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-lg text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Lead Time</span>
                  <span className="font-bold text-white">{q.lead_time_days} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Warranty</span>
                  <span className="font-bold text-indigo-300">{q.warranty_period_months} Months</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AI Score</span>
                  <span className="font-bold text-cyan-400">{q.ai_score || 85}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Quote Modal */}
      {showUploadModal && (
        <Modal title="Upload & AI Process Supplier Quotation" onClose={() => setShowUploadModal(false)}>
          <form onSubmit={handleUploadQuote} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Supplier *</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              >
                {assignedVendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.medal_tier} Tier)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Upload Quote Document (PDF / Image / Excel)</label>
              <input
                type="file"
                onChange={(e) => setQuoteFile(e.target.files[0])}
                className="w-full text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-xl p-2"
              />
              <p className="text-[10px] text-slate-500 mt-1">Our AI Engine will run OCR + Regex parsing to extract structured unit price, lead time, tax, & warranty terms.</p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 mt-4 disabled:opacity-50"
            >
              {uploading ? 'Processing OCR & Extracting Data...' : 'Upload & Process Quotation'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
