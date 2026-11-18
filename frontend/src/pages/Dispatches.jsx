import React, { useState, useEffect } from 'react';
import {
  Truck,
  Download,
  Printer,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
  Clock,
  Eye,
  Search,
  Building2,
  Store
} from 'lucide-react';
import { api } from '../api';
import PartialDispatchModal from '../components/PartialDispatchModal';
import DispatchChallanModal from '../components/DispatchChallanModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import DualReceiptModal from '../components/DualReceiptModal';

export default function Dispatches() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dispatchModal, setDispatchModal] = useState({ isOpen: false, order: null });
  const [challanModal, setChallanModal] = useState({ isOpen: false, order: null, mode: 'dispatched' });
  const [orderDetailsModal, setOrderDetailsModal] = useState({ isOpen: false, order: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, order: null });

  useEffect(() => {
    loadOrders();
  }, [search]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders({ search });
      setOrders(data);
    } catch (e) {
      console.error('Error loading dispatch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amt) => {
    return '₹ ' + Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-birlaRed-950 tracking-tight flex items-center space-x-2">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-birlaRed-800" />
            <span>Fulfillment, Partial Dispatch & Split Receipts Engine</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">
            Stage-specific documentation: Dispatched Delivery Challan & Pending Backorder Note with 7-day payment statutory terms.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
        <div className="bg-[#FFFDF7] border border-emerald-300/80 rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-emerald-950 uppercase text-[11px] block">Full Dispatches</span>
            <span className="text-base font-black text-emerald-700">
              {orders.filter((o) => o.fulfillmentStatus === 'Full').length} Orders Fulfilled
            </span>
            <span className="text-[10px] text-emerald-800 block">Complete delivery challan issued</span>
          </div>
        </div>

        <div className="bg-[#FFFDF7] border border-amber-300 rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-amber-950 uppercase text-[11px] block">Partial Dispatches</span>
            <span className="text-base font-black text-amber-700">
              {orders.filter((o) => o.fulfillmentStatus === 'Partial').length} Partial Shipments
            </span>
            <span className="text-[10px] text-amber-800 block">Dispatched Bill vs Pending Slip split</span>
          </div>
        </div>

        <div className="bg-[#FFFDF7] border border-rose-300 rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-rose-950 uppercase text-[11px] block">Pending Orders</span>
            <span className="text-base font-black text-rose-700">
              {orders.filter((o) => o.fulfillmentStatus === 'Pending' || o.fulfillmentStatus === 'Out of Stock').length} Awaiting Dispatch
            </span>
            <span className="text-[10px] text-rose-800 block">Factory allocation in progress</span>
          </div>
        </div>
      </div>

      {/* Orders Dispatch Queue Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EEDFB8] shadow-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-[#FAF6E8] border-b border-[#EEDFB8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="font-display font-bold text-sm text-birlaRed-950">
            Orders Dispatch Queue & Split Receipts Register
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search dispatch records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#EEDFB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-birlaRed-800/20"
            />
          </div>
        </div>

        {/* Mobile View: High-Touch Dispatch Cards (Visible on screens < md) */}
        <div className="block md:hidden divide-y divide-[#EEDFB8]/70">
          {loading ? (
            <div className="p-8 text-center text-stone-400 text-xs">Loading dispatch records...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs">No orders in dispatch queue.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 space-y-3 bg-[#FFFDF7] hover:bg-[#FAF6E8]/70 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setOrderDetailsModal({ isOpen: true, order })}
                      className="font-mono font-black text-xs text-birlaRed-950 hover:underline block text-left cursor-pointer"
                    >
                      {order.orderNumber}
                    </button>
                    <div className="font-bold text-stone-900 text-xs mt-0.5 truncate">{order.retailer?.firmName}</div>
                    <div className="text-[10px] text-stone-500 truncate">{order.deliveryLocation || order.retailer?.locality}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        order.fulfillmentStatus === 'Full'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : order.fulfillmentStatus === 'Partial'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">{formatDate(order.orderDate)}</div>
                  </div>
                </div>

                {/* Values strip */}
                <div className="grid grid-cols-2 gap-2 bg-[#FAF6E8] p-2 rounded-xl border border-[#EEDFB8] text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Dispatched Value:</span>
                    <span className="font-mono font-bold text-emerald-700">{formatCurrency(order.dispatchedAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 block">Pending Balance:</span>
                    <span className="font-mono font-bold text-rose-700">{formatCurrency(order.pendingAmount)}</span>
                  </div>
                </div>

                {order.partialReason && (
                  <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-300">
                    <strong>Reason:</strong> {order.partialReason}
                  </div>
                )}

                {/* Mobile Action Buttons */}
                <div className="flex items-center space-x-2 pt-1 border-t border-[#EEDFB8]/50">
                  <button
                    type="button"
                    onClick={() => setChallanModal({ isOpen: true, order, mode: 'dispatched' })}
                    className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 shadow-xs active:scale-95"
                  >
                    <Truck className="w-3 h-3 text-amber-300" />
                    <span>1. Dispatch Challan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChallanModal({ isOpen: true, order, mode: 'pending' })}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 shadow-xs active:scale-95 ${
                      order.pendingAmount > 0 || order.fulfillmentStatus === 'Partial'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-[#FAF6E8] text-stone-600 border border-[#EEDFB8]'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>2. Pending Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDispatchModal({ isOpen: true, order })}
                    className="py-1.5 px-3 bg-birlaRed-800 hover:bg-birlaRed-700 text-white text-[11px] font-bold rounded-lg shadow-xs active:scale-95"
                    title="Fulfill"
                  >
                    Fulfill
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet View: Full Table (Hidden on screens < md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-[#1A0B0E] text-amber-100 font-semibold">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Retailer & Site</th>
                <th className="py-3 px-4">Fulfillment Mode</th>
                <th className="py-3 px-4 text-right">Dispatched Value</th>
                <th className="py-3 px-4 text-right">Pending Balance</th>
                <th className="py-3 px-4">Partial Reason</th>
                <th className="py-3 px-4 text-center">Split Receipts & Challan</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEDFB8]/70">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Loading dispatch records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No orders in dispatch queue.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-[#FAF6E8]/70 transition-colors">
                      {/* Order Ref */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setOrderDetailsModal({ isOpen: true, order })}
                          className="font-mono font-bold text-birlaRed-950 hover:text-amber-700 hover:underline block text-left cursor-pointer transition-colors"
                          title="Click to view full Order Details"
                        >
                          {order.orderNumber}
                        </button>
                        <span className="text-[11px] text-stone-500 font-mono">{formatDate(order.orderDate)}</span>
                      </td>

                      {/* Retailer & Site */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setOrderDetailsModal({ isOpen: true, order })}
                          className="text-left cursor-pointer group block"
                          title="Click to view full Order Details"
                        >
                          <span className="font-bold text-stone-900 group-hover:text-birlaRed-800 group-hover:underline block">{order.retailer?.firmName}</span>
                          <span className="text-[11px] text-stone-500 truncate block max-w-xs">{order.deliveryLocation || order.retailer?.locality}</span>
                        </button>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            order.fulfillmentStatus === 'Full'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.fulfillmentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : order.fulfillmentStatus === 'Out of Stock'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </td>

                      {/* Dispatched Bill Value */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-emerald-700 block">
                          {formatCurrency(order.dispatchedAmount)}
                        </span>
                        <span className="text-[10px] text-stone-400">Billed: {formatCurrency(order.grandTotal)}</span>
                      </td>

                      {/* Pending Balance Value */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-rose-700 block">
                          {formatCurrency(order.pendingAmount)}
                        </span>
                        <span className="text-[10px] text-stone-400">Remaining</span>
                      </td>

                      {/* Partial Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {order.partialReason ? (
                          <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-300">
                            <strong>Reason:</strong> {order.partialReason}
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">None (Standard flow)</span>
                        )}
                      </td>

                      {/* Stage-Specific Split Receipts */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5 flex-wrap gap-y-1">
                          {/* 1. Dispatched Goods Challan */}
                          <button
                            onClick={() => setChallanModal({ isOpen: true, order, mode: 'dispatched' })}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg transition-all flex items-center space-x-1 shadow-xs"
                            title="Open Dispatched Delivery Challan"
                          >
                            <Truck className="w-3 h-3 text-amber-300" />
                            <span>1. Dispatch Challan</span>
                          </button>

                          {/* 2. Pending Backorder Slip */}
                          <button
                            onClick={() => setChallanModal({ isOpen: true, order, mode: 'pending' })}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center space-x-1 shadow-xs ${
                              order.pendingAmount > 0 || order.fulfillmentStatus === 'Partial'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-[#FAF6E8] text-stone-600 hover:bg-[#F5ECCB] border border-[#EEDFB8]'
                            }`}
                            title="Open Pending Backorder Slip"
                          >
                            <Clock className="w-3 h-3" />
                            <span>2. Pending Slip</span>
                          </button>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setDispatchModal({ isOpen: true, order })}
                          className="px-3 py-1.5 bg-birlaRed-800 hover:bg-birlaRed-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 mx-auto"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Fulfill Dispatch</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {orderDetailsModal.isOpen && orderDetailsModal.order && (
        <OrderDetailsModal
          isOpen={orderDetailsModal.isOpen}
          order={orderDetailsModal.order}
          onClose={() => setOrderDetailsModal({ isOpen: false, order: null })}
          onOpenReceipt={(ord) => setReceiptModal({ isOpen: true, order: ord })}
          onOpenChallan={(ord, mode) => setChallanModal({ isOpen: true, order: ord, mode: mode || 'dispatched' })}
        />
      )}

      {/* DUAL RECEIPT MODAL */}
      {receiptModal.isOpen && receiptModal.order && (
        <DualReceiptModal
          isOpen={receiptModal.isOpen}
          order={receiptModal.order}
          onClose={() => setReceiptModal({ isOpen: false, order: null })}
        />
      )}

      {/* DISPATCH CHALLAN & PENDING SLIP MODAL */}
      {challanModal.isOpen && challanModal.order && (
        <DispatchChallanModal
          isOpen={challanModal.isOpen}
          order={challanModal.order}
          initialMode={challanModal.mode}
          onClose={() => setChallanModal({ isOpen: false, order: null, mode: 'dispatched' })}
        />
      )}

      {/* PARTIAL DISPATCH FULFILLMENT MODAL */}
      {dispatchModal.isOpen && dispatchModal.order && (
        <PartialDispatchModal
          order={dispatchModal.order}
          isOpen={dispatchModal.isOpen}
          onClose={() => setDispatchModal({ isOpen: false, order: null })}
          onDispatchSuccess={() => loadOrders()}
        />
      )}
    </div>
  );
}
