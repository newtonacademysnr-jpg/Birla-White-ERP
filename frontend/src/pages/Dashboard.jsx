import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Truck,
  CreditCard,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard({ onOpenNewOrder }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const summary = await api.getDashboardSummary();
      setData(summary);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amt) => {
    if (amt === undefined || amt === null) return '₹ 0';
    return '₹ ' + Number(amt).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-birla-crimson/30 border-t-birla-crimson rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading Birla White Command Center...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const counts = data?.counts || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-birla-crimson rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-white/10 rounded-full text-xs text-birla-gold font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>UltraTech Cement Ltd. - Unit Birla White ERP Command Center</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Welcome back, Suraj (PZ7550)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Himachal Pradesh Territory (Mandi, Sundernagar, Joginder Nagar & Balh Belt). Monitor real-time sales orders, blind drop-shipping dual-receipts, partial dispatches, and live overdue ageing.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenNewOrder && (
              <button
                onClick={onOpenNewOrder}
                className="px-4 py-2.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 border border-white/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book New Order</span>
              </button>
            )}
            <Link
              to="/pjp"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>PJP Beat Today ({kpis.activePjpToday || 0})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales Invoiced</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-birla-blue flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(kpis.totalSales)}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span>{counts.orders || 0} active orders booked</span>
          </p>
        </div>

        {/* KPI 2: Dispatched Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dispatched Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-600">{formatCurrency(kpis.totalDispatchedValue)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Goods delivered or in-transit
          </p>
        </div>

        {/* KPI 3: Pending Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending / Backorder</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-amber-600">{formatCurrency(kpis.totalPendingValue)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Split pending delivery slips
          </p>
        </div>

        {/* KPI 4: Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Collected</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(kpis.totalCollected)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Payments reconciled
          </p>
        </div>

        {/* KPI 5: Total Overdue Amount */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs hover:shadow-md transition-all bg-rose-50/30">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overdue Balance</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-rose-700">{formatCurrency(kpis.totalOverdueAmount)}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
            <span>{kpis.totalOverdueInvoices || 0} overdue invoices</span>
          </p>
        </div>
      </div>

      {/* Quick Access Shortcuts & Master Directory Counts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/masters?tab=stockists"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-birla-blue transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Stockists Master</span>
            <span className="text-lg font-bold text-slate-900">{counts.stockists || 0} Authorized</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Mandi & Sundernagar Depots</span>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-birla-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link
          to="/masters?tab=retailers"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-birla-blue transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Retailers Master</span>
            <span className="text-lg font-bold text-slate-900">{counts.retailers || 0} Registered</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Mapped to Stockists</span>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-birla-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link
          to="/catalog"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-birla-blue transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Product Catalogue</span>
            <span className="text-lg font-bold text-slate-900">{counts.products || 0} SKUs</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Bag, Bucket, Box, PCS, Manual</span>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-birla-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link
          to="/ledger"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-rose-400 transition-all flex items-center justify-between group shadow-xs bg-rose-50/10"
        >
          <div>
            <span className="text-xs text-rose-800 font-semibold block">Live Ageing Tracker</span>
            <span className="text-lg font-bold text-rose-700">Due Days Counter</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Follow-up overdue accounts</span>
          </div>
          <ArrowUpRight className="w-5 h-5 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      {/* Recent Orders Feed & Delivery Tracking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-birla-crimson"></span>
            <h3 className="text-sm font-bold text-slate-900">Recent Sales Orders & Fulfillment Status</h3>
          </div>
          <Link
            to="/orders"
            className="text-xs text-birla-blue font-semibold hover:underline flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Retailer (Buyer)</th>
                <th className="py-3 px-4">Stockist (Fulfiller)</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-center">Fulfillment</th>
                <th className="py-3 px-4 text-center">Delivery</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No orders booked yet. Click "Book New Order" to start.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <Link to={`/orders?search=${order.orderNumber}`} className="text-birla-blue hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{order.retailer?.firmName}</span>
                      <span className="text-[10px] text-slate-400">{order.retailer?.locality}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{order.stockist?.firmName}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(order.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.fulfillmentStatus === 'Full'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.fulfillmentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : order.fulfillmentStatus === 'Out of Stock'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.deliveryStatus === 'Delivered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to="/orders"
                        className="px-2.5 py-1 text-[11px] font-semibold text-birla-blue hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Receipts
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
