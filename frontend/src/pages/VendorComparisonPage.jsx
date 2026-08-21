import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AiRecommendationCard from '../components/AiRecommendationCard';
import VendorComparisonTable from '../components/VendorComparisonTable';
import WeightConfiguratorModal from '../components/WeightConfiguratorModal';
import { ArrowLeft, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function VendorComparisonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [customWeights, setCustomWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const [showWeightsModal, setShowWeightsModal] = useState(false);

  useEffect(() => {
    runRecommendation();
  }, [id, customWeights]);

  const runRecommendation = async () => {
    try {
      setLoading(true);
      const res = await api.post('/ai/recommend-vendor', {
        rfq_id: id,
        customWeights
      });
      setRfq(res.data.rfq);
      setEvaluation(res.data.evaluation);
    } catch (err) {
      console.error('Error running AI vendor recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuote = async (quote) => {
    try {
      const res = await api.post('/purchase-orders/generate', {
        quotation_id: quote.id,
        is_emi: quote.supports_emi ? true : false,
        emi_tenure_months: 6
      });
      alert(`Purchase Order ${res.data.purchaseOrder.po_number} successfully generated!`);
      navigate(`/purchase-orders/${res.data.purchaseOrder.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate Purchase Order');
    }
  };

  if (loading) return <div className="p-8 text-xs text-slate-400">Evaluating multi-criteria vendor scoring model...</div>;

  return (
    <div className="space-y-6">
      <Link to={`/rfqs/${id}`} className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to RFQ Details</span>
      </Link>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multi-Criteria Scoring Model</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white mt-2">Vendor Comparison & AI Recommendation</h1>
          <p className="text-xs text-slate-400">Evaluating bids for: <strong className="text-white">{rfq?.title}</strong> ({rfq?.product_name})</p>
        </div>
      </div>

      {/* AI Winner Spotlight Card */}
      <AiRecommendationCard
        evaluation={evaluation}
        onOpenWeights={() => setShowWeightsModal(true)}
        onApproveQuote={handleApproveQuote}
      />

      {/* Side-by-Side Comparison Table */}
      <VendorComparisonTable
        quotes={evaluation?.evaluatedQuotes || []}
        winnerId={evaluation?.recommendedQuoteId}
        onSelectQuote={handleApproveQuote}
      />

      {/* Weights Configurator Modal */}
      {showWeightsModal && (
        <WeightConfiguratorModal
          currentWeights={evaluation?.weights || {}}
          onApplyWeights={(newWeights) => setCustomWeights(newWeights)}
          onClose={() => setShowWeightsModal(false)}
        />
      )}
    </div>
  );
}
