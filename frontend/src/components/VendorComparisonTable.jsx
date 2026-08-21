import React from 'react';
import { MedalBadge, StatusBadge } from './Badge';
import { Check, CreditCard, ShieldCheck, Clock, Award } from 'lucide-react';

export default function VendorComparisonTable({ quotes, winnerId, onSelectQuote }) {
  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold font-heading text-white">Vendor Quotation Comparison Matrix</h3>
          <p className="text-xs text-slate-400">Side-by-side analysis of quotes, warranties, GSTIN verification, and scores</p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
          {quotes.length} Vendors Quoted
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-4 min-w-[200px]">Vendor Name</th>
              <th className="p-4">B2B Medal Tier</th>
              <th className="p-4">Unit Price (₹)</th>
              <th className="p-4">Lead Time</th>
              <th className="p-4">Warranty</th>
              <th className="p-4">Payment Terms</th>
              <th className="p-4">EMI Available</th>
              <th className="p-4 text-center">AI Score</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {quotes.map((quote) => {
              const isWinner = quote.id === winnerId;
              return (
                <tr
                  key={quote.id}
                  className={`transition hover:bg-slate-800/40 ${
                    isWinner ? 'bg-indigo-950/20 font-medium' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {isWinner && <Award className="w-4 h-4 text-amber-400 shrink-0" />}
                      <div>
                        <div className="font-bold text-white text-sm">{quote.vendor_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">GSTIN: {quote.vendor_gstin || '27AAACA1234A1Z5'}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <MedalBadge tier={quote.vendor_medal_tier || 'Bronze'} />
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-white text-sm font-heading">
                      ₹{quote.unit_price?.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-slate-400">+18% GST</div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-1.5 text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quote.lead_time_days} Days</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 text-[11px] font-semibold">
                      {quote.warranty_period_months} Months
                    </span>
                  </td>

                  <td className="p-4 text-slate-300">
                    {quote.payment_terms || 'Net 30'}
                  </td>

                  <td className="p-4">
                    {quote.supports_emi ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CreditCard className="w-3 h-3" />
                        <span>Supported</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">No</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-heading ${
                      (quote.scores?.totalScore || quote.ai_score || 0) >= 90
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {quote.scores?.totalScore || quote.ai_score || 80}/100
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => onSelectQuote(quote)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isWinner
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isWinner ? 'Selected Winner' : 'Select Quote'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
