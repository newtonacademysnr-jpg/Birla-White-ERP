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

export default function Dispatches() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dispatchModal, setDispatchModal] = useState({ isOpen: false, order: null });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Truck className="w-6 h-6 text-birla-crimson" />
            <span>Fulfillment, Partial Dispatch & Split Receipts Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage-specific dual documentation: Dispatched Delivery Challan & Pending Backorder Note with reason tracking.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-emerald-950 uppercase text-[11px] block">Full Dispatches</span>
            <span className="text-base font-black text-emerald-700">
              {orders.filter((o) => o.fulfillmentStatus === 'Full').length} Orders Fully Fulfilled
            </span>
            <span className="text-[10px] text-emerald-800 block">Complete delivery challan issued</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-amber-950 uppercase text-[11px] block">Partial Dispatches</span>
            <span className="text-base font-black text-amber-700">
              {orders.filter((o) => o.fulfillmentStatus === 'Partial').length} Partial Shipments
            </span>
            <span className="text-[10px] text-amber-800 block">Dispatched Bill vs Pending Backorder split</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-blue-950 uppercase text-[11px] block">Pending Orders</span>
            <span className="text-base font-black text-birla-blue">
              {orders.filter((o) => o.fulfillmentStatus === 'Pending' || o.fulfillmentStatus === 'Out of Stock').length} Awaiting Dispatch
            </span>
            <span className="text-[10px] text-blue-800 block">Stock allocation in progress</span>
          </div>
        </div>
      </div>

      {/* Orders Dispatch Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Orders Dispatch Queue & Split Receipts History</h3>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search dispatch records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Retailer & Site</th>
                <th className="py-3 px-4">Fulfillment Mode</th>
                <th className="py-3 px-4 text-right">Dispatched Bill Value</th>
                <th className="py-3 px-4 text-right">Pending Balance Value</th>
                <th className="py-3 px-4">Partial Reason (If Any)</th>
                <th className="py-3 px-4 text-center">Stage-Specific Split Receipts</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading dispatch records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No orders in dispatch queue.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const latestDispatch = order.dispatchRecords?.[0];

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order Ref */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{order.orderNumber}</span>
                        <span className="text-[11px] text-slate-500">{formatDate(order.orderDate)}</span>
                      </td>

                      {/* Retailer & Site */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{order.retailer?.firmName}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">{order.deliveryLocation}</span>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.fulfillmentStatus === 'Full'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.fulfillmentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-900'
                              : order.fulfillmentStatus === 'Out of Stock'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </td>

                      {/* Dispatched Bill Value */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-emerald-700 block">
                          {formatCurrency(order.dispatchedAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">Total Billed: {formatCurrency(order.grandTotal)}</span>
                      </td>

                      {/* Pending Balance Value */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-rose-600 block">
                          {formatCurrency(order.pendingAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">Remaining to Fulfill</span>
                      </td>

                      {/* Partial Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {order.partialReason ? (
                          <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                            <strong>Reason:</strong> {order.partialReason}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">None (Standard flow)</span>
                        )}
                      </td>

                      {/* Stage-Specific Split Receipts */}
                      <td className="py-3.5 px-4 text-center">
                        {latestDispatch ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* 1. Dispatched Goods Challan */}
                            <button
                              onClick={() => {
                                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                                  window.open(`/api/dispatches/${latestDispatch.id}/receipt/dispatched`, '_blank');
                                } else {
                                  window.print();
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center space-x-1 shadow-xs"
                              title="Stage 1: Dispatched Delivery Challan"
                            >
                              <Download className="w-3 h-3" />
                              <span>1. Dispatch Challan</span>
                            </button>

                            {/* 2. Pending Backorder Slip */}
                            {order.fulfillmentStatus === 'Partial' && (
                              <button
                                onClick={() => {
                                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                                    window.open(`/api/dispatches/${latestDispatch.id}/receipt/pending`, '_blank');
                                  } else {
                                    window.print();
                                  }
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center space-x-1 shadow-xs"
                                title="Stage 2: Pending Backorder & Balance Slip"
                              >
                                <Download className="w-3 h-3" />
                                <span>2. Pending Slip</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No dispatch challan yet</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setDispatchModal({ isOpen: true, order })}
                          className="px-3 py-1.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-[11px] font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 mx-auto"
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

      {/* Partial Dispatch Modal */}
      <PartialDispatchModal
        isOpen={dispatchModal.isOpen}
        onClose={() => setDispatchModal({ isOpen: false, order: null })}
        order={dispatchModal.order}
        onDispatchSuccess={() => loadOrders()}
      />
    </div>
  );
}
