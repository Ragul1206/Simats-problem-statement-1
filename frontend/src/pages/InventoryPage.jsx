import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Boxes, PackageCheck, AlertTriangle, ArrowDownRight, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const [receiveForm, setReceiveForm] = useState({
    po_id: '',
    quantity_received: 10,
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [iRes, pRes] = await Promise.all([
        api.get('/inventory/products'),
        api.get('/purchase-orders')
      ]);

      setProducts(iRes.data.products || []);
      setTransactions(iRes.data.transactions || []);
      setPos(pRes.data.pos?.filter(po => po.status !== 'Fulfilled') || []);

      if (pRes.data.pos?.length > 0) {
        setReceiveForm(prev => ({ ...prev, po_id: pRes.data.pos[0].id }));
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveGoods = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/receive-goods', receiveForm);
      setShowReceiveModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to receive goods');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Inventory & Warehouse Management</h1>
          <p className="text-xs text-slate-400 mt-1">Track current stock, incoming purchase order shipments & low-stock alerts</p>
        </div>

        <button
          onClick={() => setShowReceiveModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center space-x-2 self-start sm:self-auto"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Receive Goods (GRN)</span>
        </button>
      </div>

      {/* Stock Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-base font-bold font-heading text-white">Current Stock Levels</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">SKU & Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Unit Base Price</th>
                <th className="p-4">In Stock</th>
                <th className="p-4">Incoming PO Stock</th>
                <th className="p-4">Reorder Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => {
                const isLow = (p.stock_quantity || 0) <= (p.reorder_level || 5);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{p.sku}</div>
                    </td>

                    <td className="p-4 text-slate-300">{p.category}</td>

                    <td className="p-4 font-bold text-white font-mono">
                      ₹{p.unit_price?.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 font-extrabold text-white text-sm">
                      {p.stock_quantity} {p.unit}
                    </td>

                    <td className="p-4 text-indigo-300 font-semibold">
                      +{p.incoming_stock || 0} Incoming
                    </td>

                    <td className="p-4">
                      {isLow ? (
                        <span className="inline-flex items-center space-x-1 text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30 text-[11px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock Alert</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Stock Healthy</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Goods Modal */}
      {showReceiveModal && (
        <Modal title="Goods Received Note (GRN) - Receive Stock" onClose={() => setShowReceiveModal(false)}>
          <form onSubmit={handleReceiveGoods} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Purchase Order *</label>
              <select
                value={receiveForm.po_id}
                onChange={(e) => setReceiveForm({ ...receiveForm, po_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              >
                {pos.map(po => (
                  <option key={po.id} value={po.id}>{po.po_number} - {po.product_name} ({po.quantity} units from {po.vendor_name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Quantity Received *</label>
              <input
                type="number"
                min="1"
                value={receiveForm.quantity_received}
                onChange={(e) => setReceiveForm({ ...receiveForm, quantity_received: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Receiving Inspection Notes</label>
              <textarea
                rows="3"
                value={receiveForm.notes}
                onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
                placeholder="Inspected and verified serial numbers..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/25 mt-4"
            >
              Submit GRN & Increment Inventory
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
