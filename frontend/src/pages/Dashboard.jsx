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
  Receipt,
  Sparkles,
  Layers,
  CalendarCheck2
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
        <div className="flex flex-col items-center space-y-3.5 bg-white p-8 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-700 font-bold tracking-tight">Syncing UltraTech • Birla White Console...</p>
          <span className="text-[11px] text-slate-400 font-mono">Territory Node: Mandi Hub (PZ7550)</span>
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
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. SEAMLESS EXECUTIVE HERO BAR (Clean light-luxe theme with refined obsidian contrast) */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-display font-black text-base shadow-sm ring-2 ring-slate-100">
              BW
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="font-display text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight">
                Mandi Territory Sales Operations
              </h1>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>Active Portal</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-slate-500 mt-1 font-medium">
              <span className="text-slate-800 font-bold">Suraj (PZ7550)</span>
              <span>•</span>
              <span>Territory Sales Officer</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">UltraTech Cement Ltd. (Unit: Birla White)</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">Sundernagar & Mandi Beats</span>
            </div>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadDashboard(true)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200/80 shadow-xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => exportOrdersToExcel(filteredOrders)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 active:scale-95"
            title="Export Sales Orders to formatted Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setPaymentModal({ isOpen: true, defaultRetailerId: null })}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>+ Collect Payment</span>
          </button>

          {onOpenNewOrder && (
            <button
              onClick={onOpenNewOrder}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Book Order</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. COMPACT SEARCH & TERRITORY FILTER STRIP */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-card flex flex-wrap items-center justify-between gap-3">
        {/* Timeframe Selector Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Scope:</span>
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'mtd', label: 'MTD (Nov)' },
            { id: 'qtd', label: 'Q3 (Oct-Dec)' },
            { id: 'ytd', label: 'FY 26-27' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeframe(item.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                timeframe === item.id
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tehsil / Area Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Depot / Beat:</span>
          </span>
          <select
            value={selectedTehsil}
            onChange={(e) => setSelectedTehsil(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Himachal Depots ({counts.stockists || 3})</option>
            <option value="Sundernagar">Sundernagar Depot</option>
            <option value="Mandi Sadar">Mandi Sadar</option>
            <option value="Joginder Nagar">Joginder Nagar</option>
            <option value="Balh">Balh / Ner Chowk</option>
            <option value="Sarkaghat">Sarkaghat Beat</option>
          </select>
        </div>

        {/* Quick Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, retailer, stockist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* 3. FOUR REFINED KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Sales Invoiced */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-blue-300 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Sales Invoiced</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {counts.orders || 0} Orders
              </span>
            </div>
            <p className="font-display text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(kpis.totalSales)}
            </p>
          </div>
          {/* Monthly Target Progress */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500 font-medium">Monthly Target: ₹ 8.00 L</span>
              <span className="font-extrabold text-blue-600">{targetAchieved}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${targetAchieved}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Fulfillment Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-emerald-300 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fulfillment Pipeline</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Depot
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-display text-2xl font-black text-emerald-600 tracking-tight tabular-nums">
                {formatCurrency(kpis.totalDispatchedValue)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Dispatched</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Pending Backorder:</span>
            <span className="font-bold text-amber-600">{formatCurrency(kpis.totalPendingValue)}</span>
          </div>
        </div>

        {/* KPI 3: Total Collections Reconciled */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-purple-300 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Collected</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Reconciled
              </span>
            </div>
            <p className="font-display text-2xl font-black text-purple-600 tracking-tight tabular-nums">
              {formatCurrency(kpis.totalCollected)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Payment Clearance:</span>
            <span className="font-bold text-emerald-600">100% Cleared</span>
          </div>
        </div>

        {/* KPI 4: Market Outstanding Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-rose-300 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Market Receivables</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {counts.retailers || 0} Retailers
              </span>
            </div>
            <p className="font-display text-2xl font-black text-rose-600 tracking-tight tabular-nums">
              {formatCurrency(kpis.totalBalanceDue)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Overdue (&gt;30 Days):</span>
            <span className="font-bold text-rose-600">{overdueRetailers.length} Dealers</span>
          </div>
        </div>
      </div>

      {/* 4. TWO-COLUMN ANALYTICS & FIELD BEAT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Columns): Sales vs Collections Flow & Top SKUs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales vs Collections AreaChart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Revenue & Collection Flow (Mandi Division)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Gross Sales vs Cleared Market Collections trend
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Healthy Recovery
              </span>
            </div>

            <div className="h-64 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesVsCollectionTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0076CE" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0076CE" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="dashboardCol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '11px'
                    }}
                  />
                  <Area type="monotone" dataKey="sales" name="Invoiced Sales" stroke="#0076CE" strokeWidth={2.5} fillOpacity={1} fill="url(#dashboardSales)" />
                  <Area type="monotone" dataKey="collections" name="Collections Cleared" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#dashboardCol)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top SKUs Volume Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span>Top Selling SKUs Volume Breakdown</span>
              </h3>
              <Link to="/catalog" className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1">
                <span>View Full Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topSellingProducts.slice(0, 4).map((p, i) => {
                const totalRev = topSellingProducts.reduce((s, x) => s + (x.totalRevenue || 0), 0) || 1;
                const pct = Math.round(((p.totalRevenue || 0) / totalRev) * 100);

                return (
                  <div key={i} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70 hover:bg-slate-100/70 transition-all">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-900">{p.productName}</span>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(p.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span>{p.totalQuantity} {p.unitType}s ({p.unitWeight} {p.weightUnit})</span>
                      <span className="font-mono font-bold text-blue-600">
                        {p.totalWeightVolume >= 1000 && p.weightUnit === 'Kg'
                          ? `${(p.totalWeightVolume / 1000).toFixed(2)} MT`
                          : `${p.totalWeightVolume} ${p.weightUnit}`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (1 Column): Today's PJP Field Beat & Overdue Watchlist */}
        <div className="space-y-6">
          {/* Today's PJP Beat Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <CalendarCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">Today's PJP Field Beat</h3>
                  <span className="text-[10px] text-slate-500 font-medium">November 2026 Journey Plan</span>
                </div>
              </div>
              <Link to="/pjp" className="text-xs font-bold text-blue-600 hover:underline">
                Open PJP &rarr;
              </Link>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-3.5 rounded-xl border border-amber-500/20 mb-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Active Beat: Mandi Sadar & Bhojpur</span>
                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                  Today
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                Dealer visits scheduled: Verma Hardware, Sharma Paints, Himalayan Traders.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-slate-700">
                <span>Monthly Target Visits:</span>
                <span className="font-bold font-mono">22 Days / 65 Dealers</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-slate-700">
                <span>Officer Tag:</span>
                <span className="font-bold text-slate-900">Suraj (PZ7550)</span>
              </div>
            </div>
          </div>

          {/* Overdue Accounts Watchlist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="font-display font-bold text-sm text-slate-900">Overdue Watchlist (&gt;30 Days)</h3>
              </div>
              <Link to="/ledger" className="text-xs font-bold text-blue-600 hover:underline">
                View Ledger &rarr;
              </Link>
            </div>

            {overdueRetailers.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                <span>All dealer accounts healthy within credit terms!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {overdueRetailers.map((r, i) => (
                  <div key={i} className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{r.firmName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {r.locality}, {r.tehsil} • <span className="text-rose-600 font-bold">{r.dueDays} Days Due</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-xs text-rose-600">{formatCurrency(r.pendingBalance)}</div>
                      <button
                        onClick={() => setPaymentModal({ isOpen: true, defaultRetailerId: r.id })}
                        className="mt-1 px-2.5 py-1 bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 rounded-lg text-[10px] font-bold shadow-xs transition-all"
                      >
                        + Collect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT ORDERS & TAX INVOICES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Live Sales Orders & Fulfillment Register
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time booking status, dual drop-shipping invoices, and delivery fulfillment.
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Full', 'Partial', 'Pending', 'Delivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setOrderTab(tab)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  orderTab === tab
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Retailer / Dealer</th>
                <th className="py-3 px-4">Tehsil / Depot</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-center">Fulfillment</th>
                <th className="py-3 px-4 text-center">Delivery</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No sales orders found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {formatDate(o.orderDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{o.retailer?.firmName}</div>
                      <div className="text-[10px] text-slate-400">{o.retailer?.locality}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {o.retailer?.tehsil || 'Mandi Sadar'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {formatCurrency(o.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          o.fulfillmentStatus === 'Full'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : o.fulfillmentStatus === 'Partial'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {o.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          o.deliveryStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {o.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setReceiptModal({ isOpen: true, order: o })}
                          className="px-2.5 py-1 bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center space-x-1"
                          title="View Dual Drop-Shipping Tax Invoice & Delivery Challan"
                        >
                          <Receipt className="w-3.5 h-3.5 text-blue-600" />
                          <span>Receipt</span>
                        </button>

                        {o.deliveryStatus !== 'Delivered' && (
                          <button
                            onClick={() => handleMarkDelivered(o.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all"
                            title="Mark Order as Delivered"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DUAL RECEIPT MODAL */}
      {receiptModal.isOpen && receiptModal.order && (
        <DualReceiptModal
          order={receiptModal.order}
          onClose={() => setReceiptModal({ isOpen: false, order: null })}
        />
      )}

      {/* PAYMENT MODAL */}
      {paymentModal.isOpen && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          defaultRetailerId={paymentModal.defaultRetailerId}
          onClose={() => setPaymentModal({ isOpen: false, defaultRetailerId: null })}
          onPaymentSuccess={() => {
            showToast('Payment recorded and reconciled successfully!');
            loadDashboard(true);
          }}
        />
      )}
    </div>
  );
}
