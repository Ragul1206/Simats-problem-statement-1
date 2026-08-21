import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { History, ShieldCheck, FileText, ShoppingBag, Database, User } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold font-heading text-white">System Audit & Activity Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable timeline tracking RFQs, quote extractions, PO approvals, & user actions</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start space-x-3 text-xs">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{log.created_at}</span>
                </div>
                <p className="text-slate-300">{log.details}</p>
                <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                  <span>User: <strong className="text-slate-200">{log.user_name || 'System'}</strong></span>
                  <span>Entity: <strong className="text-slate-200">{log.entity_type} ({log.entity_id})</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
