import React, { useState, useEffect, useMemo } from 'react';
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
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  Building2,
  Phone,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../api';
import { exportOrdersToExcel } from '../utils/excelExporter';
import DualReceiptModal from '../components/DualReceiptModal';
import PaymentModal from '../components/PaymentModal';

export default function Dashboard({ onOpenNewOrder }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Interactive Filters
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'mtd', 'qtd', 'ytd'
  const [selectedTehsil, setSelectedTehsil] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTab, setOrderTab] = useState('All'); // 'All', 'Full', 'Partial', 'Pending', 'Delivered'

  // Modals
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, order: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, defaultRetailerId: null });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const summary = await api.getDashboardSummary();
      setData(summary);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const formatCurrency = (amt) => {
    if (amt === undefined || amt === null) return '₹ 0';
    return '₹ ' + Number(amt).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // 1-Click Mark as Delivered directly on Dashboard table
  const handleMarkDelivered = async (orderId) => {
    try {
      await api.markOrderDelivered(orderId);
      showToast(`Order marked as Delivered successfully!`);
      loadDashboard(true);
    } catch (e) {
      alert(e.message || 'Error marking delivered');
    }
  };

  // Real Excel/CSV Export
  const handleExportCSV = () => {
    if (!data?.allOrders || data.allOrders.length === 0) {
      alert('No orders available to export.');
      return;
    }
    const headers = [
      'Order Number',
      'Order Date',
      'Retailer Name',
      'Tehsil',
      'Locality',
      'Stockist Name',
      'Grand Total (INR)',
      'Dispatched (INR)',
      'Pending (INR)',
      'Balance Due (INR)',
      'Fulfillment Status',
      'Delivery Status'
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.orderDate}"`,
      `"${o.retailer?.firmName || ''}"`,
      `"${o.retailer?.tehsil || ''}"`,
      `"${o.retailer?.locality || ''}"`,
      `"${o.stockist?.firmName || ''}"`,
      o.grandTotal || 0,
      o.dispatchedAmount || 0,
      o.pendingAmount || 0,
      o.balanceDueAmount || 0,
      `"${o.fulfillmentStatus || ''}"`,
      `"${o.deliveryStatus || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Birla_White_Sales_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sales report exported to CSV successfully!');
  };

  // Filtered Orders Calculation
  const filteredOrders = useMemo(() => {
    if (!data?.allOrders) return [];
    let list = [...data.allOrders];

    // Filter by Tehsil
    if (selectedTehsil !== 'All') {
      list = list.filter((o) => o.retailer?.tehsil === selectedTehsil);
    }

    // Filter by Tab
    if (orderTab === 'Full') {
      list = list.filter((o) => o.fulfillmentStatus === 'Full');
    } else if (orderTab === 'Partial') {
      list = list.filter((o) => o.fulfillmentStatus === 'Partial');
    } else if (orderTab === 'Pending') {
      list = list.filter((o) => o.fulfillmentStatus === 'Out of Stock' || o.pendingAmount > 0);
    } else if (orderTab === 'Delivered') {
      list = list.filter((o) => o.deliveryStatus === 'Delivered');
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.retailer?.firmName?.toLowerCase().includes(q) ||
          o.stockist?.firmName?.toLowerCase().includes(q) ||
          o.retailer?.locality?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, selectedTehsil, orderTab, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="flex flex-col items-center space-y-3 bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 border-4 border-birla-blue/20 border-t-birla-blue rounded-full animate-spin"></div>
          <p className="text-xs text-slate-600 font-semibold tracking-wide">
            Syncing UltraTech • Birla White ERP Console...
          </p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const counts = data?.counts || {};
  const overdueRetailers = data?.overdueRetailers || [];
  const topSellingProducts = data?.topSellingProducts || [];
  const salesVsCollectionTrend = data?.salesVsCollectionTrend || [];
  const pjpVisits = data?.pjpVisits || [];

  const targetAchieved = kpis.targetAchievementPct || 64;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* EXECUTIVE COMMAND RIBBON (Dark Sleek Bar - Compact, High Contrast, NOT Bulky!) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Left: Officer & Territory Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-birla-crimson to-birla-darkRed flex items-center justify-center font-black text-white text-sm shadow-sm ring-1 ring-white/10">
            BW
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-white">
                Sales Operations Command Center
              </h1>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Feed</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mt-0.5">
              <span className="text-slate-200 font-semibold">Suraj (PZ7550)</span>
              <span>•</span>
              <span>UltraTech Cement Ltd. (Unit: Birla White)</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">HP Territory: Mandi Hub</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadDashboard(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-birla-blue' : ''}`} />
          </button>

          <button
            onClick={() => exportOrdersToExcel(filteredOrders)}
            className="px-3 py-2 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all border border-emerald-600/60 flex items-center space-x-1.5"
            title="Export Sales Orders to styled Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setPaymentModal({ isOpen: true, defaultRetailerId: null })}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>+ Collect Payment</span>
          </button>

          {onOpenNewOrder && (
            <button
              onClick={onOpenNewOrder}
              className="px-3.5 py-2 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 ring-1 ring-white/10 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Book Order</span>
            </button>
          )}
        </div>
      </div>

      {/* COMPACT FILTER & CONTROL STRIP */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
        {/* Timeframe Selector Pills */}
        <div className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Period:</span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'mtd', label: 'MTD (Nov)' },
            { id: 'qtd', label: 'Q3 (Oct-Dec)' },
            { id: 'ytd', label: 'FY 26-27' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeframe(item.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                timeframe === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tehsil / Area Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-birla-crimson" />
            <span>Tehsil:</span>
          </span>
          <select
            value={selectedTehsil}
            onChange={(e) => setSelectedTehsil(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
          >
            <option value="All">All Himachal Depots ({counts.stockists || 3})</option>
            <option value="Sundernagar">Sundernagar</option>
            <option value="Mandi Sadar">Mandi Sadar</option>
            <option value="Joginder Nagar">Joginder Nagar</option>
            <option value="Balh">Balh / Ner Chowk</option>
            <option value="Sarkaghat">Sarkaghat</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, retailer, stockist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
          />
        </div>
      </div>

      {/* HIGH-LEVEL KPI METRIC CARDS (Crisp light surfaces with refined dark accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Sales Invoiced */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Sales Invoiced</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-birla-blue border border-blue-100">
                {counts.orders || 0} Orders
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.totalSales)}
            </p>
          </div>
          {/* Monthly Target Progress */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500 font-medium">Monthly Target: ₹ 8.00 L</span>
              <span className="font-extrabold text-birla-blue">{targetAchieved}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-birla-blue h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${targetAchieved}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Dispatched vs Pending Backorders */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fulfillment Pipeline</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                {formatCurrency(kpis.totalDispatchedValue)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Dispatched</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Backorder / Pending Slip:</span>
            <span className="font-bold text-amber-600">{formatCurrency(kpis.totalPendingValue)}</span>
          </div>
        </div>

        {/* KPI 3: Total Collections Reconciled */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Collected</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                Reconciled
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.totalCollected)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Collection Efficiency:</span>
            <span className="font-extrabold text-emerald-600">
              {kpis.totalSales ? Math.round((kpis.totalCollected / kpis.totalSales) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* KPI 4: Overdue Receivables Alert */}
        <div className="bg-white p-4.5 rounded-2xl border border-rose-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-rose-300 transition-all flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/20">
          <div>
            <div className="flex items-center justify-between text-rose-700 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Overdue Receivables</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                {kpis.totalOverdueInvoices || 0} Invoices
              </span>
            </div>
            <p className="text-2xl font-black text-rose-700 tracking-tight">
              {formatCurrency(kpis.totalOverdueAmount)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Due Days Counter:</span>
            <Link to="/ledger" className="font-bold text-rose-600 hover:underline flex items-center space-x-0.5">
              <span>View Ageing</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN ANALYTICAL CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7/12): Trend Chart & SKU Performance */}
        <div className="lg:col-span-7 space-y-5">
          {/* Sales vs Collection Trend Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Revenue Invoiced vs Payments Collected
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Monthly performance run-rate across Himachal Pradesh Territory
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-birla-blue"></span>
                  <span className="text-slate-600 font-medium text-[11px]">Invoiced Sales</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 font-medium text-[11px]">Collections</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesVsCollectionTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0087CF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0087CF" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="sales" name="Invoiced Sales" stroke="#0087CF" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                  <Area type="monotone" dataKey="collections" name="Collections" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling SKUs Volume Tracker */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Top Moving SKUs & Volume Breakdown (MT & Liters)
              </h3>
              <Link to="/catalog" className="text-[11px] text-birla-blue font-bold hover:underline flex items-center space-x-0.5">
                <span>View Full Catalogue</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {topSellingProducts.map((sku, idx) => (
                <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{sku.productName}</span>
                      <span className="text-[10px] text-slate-500">
                        {sku.totalQuantity} Units Booked • Volume: <strong className="text-slate-800">{sku.totalWeightVolume} {sku.volumeUnit}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">{formatCurrency(sku.totalRevenue)}</span>
                    </div>
                  </div>
                  {/* Visual weight bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${idx === 0 ? 'bg-birla-blue' : idx === 1 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${idx === 0 ? 72 : idx === 1 ? 40 : 25}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5/12): Overdue Accounts Watchlist & Today's PJP Field Beat */}
        <div className="lg:col-span-5 space-y-5">
          {/* Actionable Live Overdue Watchlist */}
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Overdue Accounts Watchlist
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                Past Credit Limit
              </span>
            </div>

            {overdueRetailers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <span>All retailer ledgers are cleared and healthy!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {overdueRetailers.map((ret, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-rose-50/30 rounded-xl border border-rose-200/70 hover:border-rose-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{ret.retailerName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {ret.locality} • {ret.tehsil}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                          {ret.maxDaysOverdue} Days (Limit: {ret.creditDays}d)
                        </span>
                        <span className="text-[10px] text-slate-400">Ph: {ret.contact}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end flex-shrink-0">
                      <span className="text-xs font-black text-rose-700 block">
                        {formatCurrency(ret.overdueAmount)}
                      </span>
                      <button
                        onClick={() => setPaymentModal({ isOpen: true, defaultRetailerId: ret.retailerId })}
                        className="mt-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs flex items-center space-x-1"
                        title="Open payment collection receipt modal"
                      >
                        <CreditCard className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Collect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's PJP Field Beat Schedule (Permanent Journey Plan) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-birla-blue" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Today's PJP Beat Schedule
                </h3>
              </div>
              <Link to="/pjp" className="text-[11px] text-birla-blue font-bold hover:underline">
                Manage PJP
              </Link>
            </div>

            <div className="space-y-2.5">
              {pjpVisits.slice(0, 3).map((visit, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {visit.retailer?.firmName || 'Retailer Visit'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {visit.tehsil} • {visit.purpose}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      visit.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {visit.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS FEED & REAL-TIME DISPATCH / DUAL-RECEIPT TRACKER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Header & Status Filter Tabs */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-birla-crimson"></span>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sales Orders Queue & Fulfillment Stream
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">({filteredOrders.length} records)</span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {['All', 'Full', 'Partial', 'Pending', 'Delivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setOrderTab(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  orderTab === tab ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200/60 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order No & Date</th>
                <th className="py-3 px-4">Retailer (Buyer)</th>
                <th className="py-3 px-4">Stockist (Fulfiller)</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-center">Fulfillment</th>
                <th className="py-3 px-4 text-center">Delivery Status</th>
                <th className="py-3 px-4 text-center">Dual Receipts</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No orders match your current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order No & Date */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="text-birla-blue font-bold block">{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400 font-sans font-normal">{formatDate(order.orderDate)}</span>
                    </td>

                    {/* Retailer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{order.retailer?.firmName}</span>
                      <span className="text-[10px] text-slate-500">{order.retailer?.locality} • {order.retailer?.tehsil}</span>
                    </td>

                    {/* Stockist */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {order.stockist?.firmName}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-slate-900 block">{formatCurrency(order.grandTotal)}</span>
                      {order.balanceDueAmount > 0 && (
                        <span className="text-[10px] text-rose-600 font-bold block">
                          Due: {formatCurrency(order.balanceDueAmount)}
                        </span>
                      )}
                    </td>

                    {/* Fulfillment */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

                    {/* Delivery Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.deliveryStatus === 'Delivered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.deliveryStatus}
                      </span>
                    </td>

                    {/* Dual Receipts Trigger */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setReceiptModal({ isOpen: true, order })}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs inline-flex items-center space-x-1"
                        title="View Dual Receipts (Retailer Blind vs Stockist)"
                      >
                        <Receipt className="w-3 h-3 text-birla-gold" />
                        <span>Dual Receipt</span>
                      </button>
                    </td>

                    {/* Action: 1-Click Mark Delivered */}
                    <td className="py-3.5 px-4 text-center">
                      {order.deliveryStatus !== 'Delivered' ? (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs inline-flex items-center space-x-1"
                          title="Mark order as delivered successfully"
                        >
                          <Check className="w-3 h-3" />
                          <span>Delivered</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold inline-flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DUAL-RECEIPT MODAL (Retailer Blind Drop-Shipping vs Stockist Fulfillment Slip) */}
      <DualReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, order: null })}
        order={receiptModal.order}
      />

      {/* RECORD PAYMENT MODAL */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, defaultRetailerId: null })}
        defaultRetailerId={paymentModal.defaultRetailerId}
        onPaymentSuccess={() => {
          showToast('Payment recorded & ledger updated successfully!');
          loadDashboard(true);
        }}
      />
    </div>
  );
}
