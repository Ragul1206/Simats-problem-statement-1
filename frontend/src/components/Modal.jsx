import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, children, onClose, maxWidth = 'max-w-xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className={`glass-panel w-full ${maxWidth} rounded-2xl border border-slate-800 shadow-2xl p-6 relative my-8`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h2 className="text-lg font-bold font-heading text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
