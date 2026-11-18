import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, Receipt, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function PaymentModal({ isOpen, onClose, defaultRetailerId, defaultOrderId, onPaymentSuccess }) {
  const [retailers, setRetailers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [retailerId, setRetailerId] = useState(defaultRetailerId || '');
  const [orderId, setOrderId] = useState(defaultOrderId || '');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'Cash', 'UPI', 'Cheque', 'Online'
  const [chequeDate, setChequeDate] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (defaultRetailerId) setRetailerId(defaultRetailerId);
      if (defaultOrderId) setOrderId(defaultOrderId);
      setAmountPaid('');
      setPaymentMode('UPI');
      setChequeDate('');
      setReferenceNo('');
      setNotes('');
      setError('');
    }
  }, [isOpen, defaultRetailerId, defaultOrderId]);

  const loadDropdowns = async () => {
    try {
      const [rets, ords] = await Promise.all([
        api.getRetailers({ status: 'Active' }),
        api.getOrders({ state: 'Active' })
      ]);
      setRetailers(rets);
      setOrders(ords);
    } catch (e) {
      console.error('Error loading payment dropdowns:', e);
    }
  };

  if (!isOpen) return null;

  // Selected order details for balance calc
  const selectedOrder = orders.find((o) => o.id === parseInt(orderId));
  const orderTotal = selectedOrder ? selectedOrder.grandTotal : 0;
  const alreadyPaid = selectedOrder ? selectedOrder.totalPaidAmount : 0;
  const currentPending = selectedOrder ? selectedOrder.balanceDueAmount : 0;
  const enteredAmount = parseFloat(amountPaid) || 0;
  const balanceAfter = Math.max(0, currentPending - enteredAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!retailerId) {
      setError('Please select a Retailer.');
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    if (paymentMode === 'Cheque' && !chequeDate) {
      setError('Cheque Date is strictly mandatory when payment mode is Cheque.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        retailerId: parseInt(retailerId),
        orderId: orderId ? parseInt(orderId) : null,
        amountPaid: parseFloat(amountPaid),
        transactionDate: new Date(transactionDate),
        paymentMode,
        chequeDate: paymentMode === 'Cheque' && chequeDate ? new Date(chequeDate) : null,
        referenceNo: referenceNo || null,
        notes: notes || null,
        recordedBy: 'Suraj (PZ7550)'
      };

      const result = await api.recordPayment(payload);
      onPaymentSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amt) => {
    return '₹ ' + Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-birla-crimson/20 text-birla-gold flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">RECORD PAYMENT & GENERATE RECEIPT</h3>
              <p className="text-xs text-slate-400">Birla White Financial Accounting Module</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Retailer Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Retailer (Payer) *
            </label>
            <select
              required
              value={retailerId}
              onChange={(e) => {
                setRetailerId(e.target.value);
                setOrderId('');
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
            >
              <option value="">-- Choose Retailer --</option>
              {retailers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.firmName} ({r.locality}, {r.tehsil}) - Mob: {r.mobileNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Linked Order (Optional but recommended) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Link to Specific Order (Optional / Running Ledger):
            </label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
            >
              <option value="">-- Direct Running Account / General Ledger Deposit --</option>
              {orders
                .filter((o) => !retailerId || o.retailerId === parseInt(retailerId))
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} ({formatCurrency(o.grandTotal)}) | Due: {formatCurrency(o.balanceDueAmount)} | {o.fulfillmentStatus}
                  </option>
                ))}
            </select>
          </div>

          {/* Order Snapshot if selected */}
          {selectedOrder && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex justify-between items-center text-blue-900">
              <div>
                <span className="font-semibold block">{selectedOrder.orderNumber} Total: {formatCurrency(orderTotal)}</span>
                <span className="text-[11px] text-blue-700">Already Paid: {formatCurrency(alreadyPaid)}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-600 block">Pending Due:</span>
                <span className="font-extrabold text-sm text-rose-700">{formatCurrency(currentPending)}</span>
              </div>
            </div>
          )}

          {/* Amount Paid & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Amount Paid (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="e.g. 50000"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Payment Mode *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['UPI', 'Cash', 'Cheque', 'Online'].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-birla-blue text-white border-birla-blue shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Cheque Date field (MANDATORY if Cheque is selected) */}
          {paymentMode === 'Cheque' && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 space-y-2">
              <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                Cheque Clearance / Due Date * (Mandatory for Cheques):
              </label>
              <input
                type="date"
                required
                value={chequeDate}
                onChange={(e) => setChequeDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-amber-800">
                Cheque date must be accurately entered for banking reconciliation and clearance tracking.
              </p>
            </div>
          )}

          {/* Reference No & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference / UTR / Cheque No:
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-98219082 or CHQ-445511"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Note:</label>
              <input
                type="text"
                placeholder="e.g. Part payment received at shop visit"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Balance Remaining Preview */}
          {selectedOrder && (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <span className="text-slate-600">Balance Remaining After This Payment:</span>
              <span className="font-extrabold text-sm text-slate-900">{formatCurrency(balanceAfter)}</span>
            </div>
          )}

          {/* Footer */}
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
                  <span>Recording Payment...</span>
                </span>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Generate Payment Receipt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
