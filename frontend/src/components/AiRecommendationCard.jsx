import React from 'react';
import { Sparkles, Trophy, ShieldCheck, DollarSign, Calendar, SlidersHorizontal, CheckCircle } from 'lucide-react';
import { MedalBadge } from './Badge';

export default function AiRecommendationCard({ evaluation, onOpenWeights, onApproveQuote }) {
  if (!evaluation || !evaluation.evaluatedQuotes || evaluation.evaluatedQuotes.length === 0) return null;

  const winner = evaluation.evaluatedQuotes[0];
  const { savingsSummary, recommendationReason, weights } = evaluation;

  return (
    <div className="glass-panel rounded-2xl p-6 border-2 border-indigo-500/40 relative overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-purple-950/30">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold font-heading text-white">AI Recommended Supplier</h2>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
                Score: {winner.scores?.totalScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-criteria weighted evaluation engine decision</p>
          </div>
        </div>

        <button
          onClick={onOpenWeights}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition self-start md:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>Configure AI Weights</span>
        </button>
      </div>

      {/* Winner Spotlight Card */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400">Recommended Vendor</span>
              <div className="flex items-center space-x-3 mt-1">
                <h3 className="text-2xl font-bold text-white">{winner.vendor_name}</h3>
                <MedalBadge tier={winner.vendor_medal_tier} />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Winning Quoted Unit Price</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-heading">
                ₹{winner.unit_price?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* AI Rationale Box */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>AI Decision Rationale & Procurement Insights</span>
            </div>
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
              {recommendationReason || winner.ai_recommendation_reason}
            </p>
          </div>
        </div>

        {/* Savings & Score Breakdown Sidebar */}
        <div className="glass-card p-4 rounded-xl space-y-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Cost Savings</span>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Vs Highest Bid:</span>
                <span className="text-sm font-bold text-emerald-400">₹{savingsSummary?.totalSavingsVsMax?.toLocaleString('en-IN')} ({savingsSummary?.savingsPercent}%)</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Vs Average Bid:</span>
                <span className="text-sm font-bold text-indigo-300">₹{savingsSummary?.totalSavingsVsAvg?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Score Metrics Progress Bars */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Price Score:</span>
              <span className="font-semibold text-slate-200">{winner.scores?.priceScore}/100</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Quality & Warranty:</span>
              <span className="font-semibold text-slate-200">{winner.scores?.qualityScore}/100</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">B2B Trust & GSTIN:</span>
              <span className="font-semibold text-cyan-400">{winner.scores?.trustScore}/100</span>
            </div>
          </div>

          <button
            onClick={() => onApproveQuote(winner)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 mt-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve & Generate Purchase Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
