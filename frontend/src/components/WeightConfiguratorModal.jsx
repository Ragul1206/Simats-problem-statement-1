import React, { useState } from 'react';
import Modal from './Modal';
import { Sliders, RefreshCw, Check } from 'lucide-react';

export default function WeightConfiguratorModal({ currentWeights, onApplyWeights, onClose }) {
  const [weights, setWeights] = useState({
    price: currentWeights.price ?? 35,
    quality: currentWeights.quality ?? 20,
    delivery: currentWeights.delivery ?? 15,
    medalTrust: currentWeights.medalTrust ?? 15,
    rating: currentWeights.rating ?? 8,
    payment: currentWeights.payment ?? 7,
  });

  const totalSum = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSlider = (key, val) => {
    setWeights({ ...weights, [key]: parseInt(val) || 0 });
  };

  const handleReset = () => {
    setWeights({ price: 35, quality: 20, delivery: 15, medalTrust: 15, rating: 8, payment: 7 });
  };

  const handleSave = () => {
    onApplyWeights(weights);
    onClose();
  };

  return (
    <Modal title="Configure AI Recommendation Algorithm Weights" onClose={onClose}>
      <div className="space-y-5 text-xs text-slate-300">
        <p className="text-slate-400">
          Customize criteria weights to align the AI evaluation engine with your business priorities. Total weights must sum to 100%.
        </p>

        {/* Total Weight Indicator */}
        <div className={`p-3 rounded-xl border flex items-center justify-between font-bold ${
          totalSum === 100
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <span>Total Weight Sum:</span>
          <span className="text-sm font-heading">{totalSum}%</span>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-white">Price Weight ({weights.price}%)</span>
              <span className="text-slate-400">Normalizes quote unit prices</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.price}
              onChange={(e) => handleSlider('price', e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-white">Quality & Warranty ({weights.quality}%)</span>
              <span className="text-slate-400">Historical quality score & warranty months</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.quality}
              onChange={(e) => handleSlider('quality', e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-white">Delivery Speed ({weights.delivery}%)</span>
              <span className="text-slate-400">On-time delivery lead time days</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.delivery}
              onChange={(e) => handleSlider('delivery', e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-white">B2B Medal & GSTIN Trust ({weights.medalTrust}%)</span>
              <span className="text-slate-400">Diamond to Bronze medal & GSTIN verification</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.medalTrust}
              onChange={(e) => handleSlider('medalTrust', e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-white">Vendor Rating ({weights.rating}%)</span>
              <span className="text-slate-400">1 to 5 star historical score</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.rating}
              onChange={(e) => handleSlider('rating', e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-white">Payment & EMI Terms ({weights.payment}%)</span>
              <span className="text-slate-400">Credit window & EMI option availability</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.payment}
              onChange={(e) => handleSlider('payment', e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={totalSum !== 100}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Scoring Model</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
