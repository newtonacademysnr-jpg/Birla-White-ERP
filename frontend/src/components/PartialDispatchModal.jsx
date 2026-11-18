import React, { useState, useEffect } from 'react';
import { X, Truck, AlertCircle, Calculator, PackageCheck, FileText } from 'lucide-react';
import { api } from '../api';

export default function PartialDispatchModal({ isOpen, onClose, order, onDispatchSuccess }) {
  const [dispatchType, setDispatchType] = useState('Partial'); // 'Full', 'Partial', 'Out of Stock'
  const [reason, setReason] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [itemDispatches, setItemDispatches] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order && order.items) {
      // Initialize with remaining quantities to dispatch
      const initial = {};
      order.items.forEach((item) => {
        const remainingToDispatch = Math.max(0, item.orderedQty - (item.dispatchedQty || 0));
        initial[item.id] = remainingToDispatch;
      });
      setItemDispatches(initial);
      setReason('');
      setVehicleNo('');
      setDriverContact('');
      setError('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleQtyChange = (itemId, val, maxQty) => {
    const qty = parseInt(val) || 0;
    const clampedQty = Math.min(Math.max(0, qty), maxQty);
    setItemDispatches((prev) => ({
      ...prev,
      [itemId]: clampedQty
    }));
  };

  // Live Auto-Calculations
  let liveDispatchedAmt = 0;
  let livePendingAmt = 0;
  let totalDispatchedQty = 0;
  let totalPendingQty = 0;

  order.items?.forEach((item) => {
    const maxPending = Math.max(0, item.orderedQty - (item.dispatchedQty || 0));
    let dispatchNow = 0;

    if (dispatchType === 'Full') {
      dispatchNow = maxPending;
    } else if (dispatchType === 'Out of Stock') {
      dispatchNow = 0;
    } else {
      dispatchNow = itemDispatches[item.id] !== undefined ? itemDispatches[item.id] : maxPending;
    }

    const pendingNow = Math.max(0, maxPending - dispatchNow);
    const rateWithGst = item.manualUnitRate * (1 + (item.gstRate || 18) / 100);

    liveDispatchedAmt += dispatchNow * rateWithGst;
    livePendingAmt += pendingNow * rateWithGst;
    totalDispatchedQty += dispatchNow;
    totalPendingQty += pendingNow;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (dispatchType === 'Partial' && (!reason || !reason.trim())) {
      setError('Please provide a mandatory reason for Partial Dispatch.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        dispatchType,
        reason: dispatchType === 'Partial' ? reason : null,
        vehicleNo,
        driverContact,
        itemDispatches: Object.keys(itemDispatches).map((id) => ({
          orderItemId: parseInt(id),
          dispatchedQtyNow: itemDispatches[id]
        }))
      };

      const result = await api.processDispatch(order.id, payload);
      onDispatchSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process dispatch.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amt) => {
    return '₹ ' + Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-birla-blue/20 text-birla-blue flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">ORDER DISPATCH & PARTIAL FULFILLMENT</h3>
              <p className="text-xs text-slate-400">Order #{order.orderNumber} | {order.retailer?.firmName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Dispatch Type Selection */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Dispatch Fulfillment Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'Full', label: 'Full Dispatch', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                { id: 'Partial', label: 'Partial Dispatch', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                { id: 'Out of Stock', label: 'Out of Stock / Hold', color: 'border-rose-500 bg-rose-50 text-rose-900' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDispatchType(opt.id)}
                  className={`py-2 px-3 rounded-xl border-2 font-semibold text-xs transition-all text-center ${
                    dispatchType === opt.id
                      ? `${opt.color} shadow-sm font-bold`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Partial Reason (Mandatory when Partial) */}
          {dispatchType === 'Partial' && (
            <div className="bg-amber-50/70 p-3.5 sm:p-4 rounded-xl border border-amber-200 space-y-2">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                Reason for Partial Dispatch * (Mandatory):
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Transporter vehicle load exceeded, Plant lot stock check pending, Staggered site delivery requested by retailer..."
                className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-amber-800">
                This reason will be officially printed on the <strong>Stage 2: Pending Backorder & Balance Slip</strong>.
              </p>
            </div>
          )}

          {/* Transporter Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle / Tempo No:</label>
              <input
                type="text"
                placeholder="e.g. HP-31-B-4412"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Contact Mobile:</label>
              <input
                type="text"
                placeholder="e.g. 98160 99112"
                value={driverContact}
                onChange={(e) => setDriverContact(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Breakdown: Dispatched Qty vs Pending Qty */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Item-Wise Dispatch Fulfillment:
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Adjust quantities
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3 text-center">Ordered</th>
                    <th className="py-2 px-3 text-center">Prev. Dispatched</th>
                    <th className="py-2 px-3 text-center w-28">Dispatch Now</th>
                    <th className="py-2 px-3 text-center">Pending After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {order.items?.map((item) => {
                    const alreadyDispatched = item.dispatchedQty || 0;
                    const remainingTotal = Math.max(0, item.orderedQty - alreadyDispatched);
                    const dispatchNow = dispatchType === 'Full'
                      ? remainingTotal
                      : dispatchType === 'Out of Stock'
                      ? 0
                      : itemDispatches[item.id] !== undefined ? itemDispatches[item.id] : remainingTotal;
                    const pendingAfter = Math.max(0, remainingTotal - dispatchNow);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {item.productName}
                          <div className="text-[10px] text-slate-500">
                            Unit: {item.unitType} | Rate: ₹{item.manualUnitRate} + {item.gstRate}% GST
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-700">{item.orderedQty}</td>
                        <td className="py-2 px-3 text-center text-slate-500">{alreadyDispatched}</td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={remainingTotal}
                            disabled={dispatchType !== 'Partial'}
                            value={dispatchNow}
                            onChange={(e) => handleQtyChange(item.id, e.target.value, remainingTotal)}
                            className="w-20 px-2 py-1 text-center font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-birla-blue focus:outline-none disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-rose-600">{pendingAfter}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Auto-Calculated Financial Summary Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-amber-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold mb-2">
              <Calculator className="w-4 h-4 text-birla-crimson" />
              <span>AUTOMATIC FINANCIAL SUMMARY (INCL. GST):</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">1. Dispatched Bill Amount (Going Out):</span>
                <span className="text-base font-extrabold text-emerald-700">{formatCurrency(liveDispatchedAmt)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{totalDispatchedQty} units in this challan</span>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200">
                <span className="text-[11px] text-amber-800 font-semibold block">2. Pending Bill Amount (Remaining Balance):</span>
                <span className="text-base font-extrabold text-amber-700">{formatCurrency(livePendingAmt)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{totalPendingQty} units on backorder</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-birla-crimson hover:bg-birla-darkRed rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Dispatch...</span>
                </span>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>Confirm Dispatch & Generate Split Receipts</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
