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
  CalendarCheck2,
  BarChart3,
  Zap,
  ArrowDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../api';
import { exportOrdersToExcel, exportBiAnalyticsToExcel } from '../utils/excelExporter';
import DualReceiptModal from '../components/DualReceiptModal';
import PaymentModal from '../components/PaymentModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import DispatchChallanModal from '../components/DispatchChallanModal';

const BRAND_PALETTE = ['#9E1B22', '#D97706', '#EAB308', '#059669', '#7C3AED', '#2563EB', '#EA580C'];

export default function Dashboard({ onOpenNewOrder }) {
  const [data, setData] = useState(null);
  const [biData, setBiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard Filters
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'mtd', 'qtd', 'ytd'
  const [selectedTehsil, setSelectedTehsil] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTab, setOrderTab] = useState('All'); // 'All', 'Full', 'Partial', 'Pending', 'Delivered'

  // BI Hub Timeframe Filter
  const [biTimeframe, setBiTimeframe] = useState('quarterly'); // 'monthly', 'quarterly', 'halfyearly', 'annually'
  const [biLoading, setBiLoading] = useState(false);

  // Modals
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, order: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, defaultRetailerId: null });
  const [orderDetailsModal, setOrderDetailsModal] = useState({ isOpen: false, order: null });
  const [challanModal, setChallanModal] = useState({ isOpen: false, order: null, mode: 'dispatched' });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadBiData();
  }, [biTimeframe]);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const [summary, bi] = await Promise.all([
        api.getDashboardSummary(),
        api.getBiAnalytics(biTimeframe)
      ]);
      setData(summary);
      setBiData(bi);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBiData = async () => {
    try {
      setBiLoading(true);
      const res = await api.getBiAnalytics(biTimeframe);
      setBiData(res);
    } catch (e) {
      console.error('Error loading BI data:', e);
    } finally {
      setBiLoading(false);
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
        <div className="flex flex-col items-center space-y-3.5 bg-[#FFFDF7] p-8 rounded-2xl border border-[#EEDFB8] shadow-card">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-birlaRed-800 rounded-full animate-spin"></div>
          <p className="text-xs text-stone-800 font-bold tracking-tight">Syncing Birla White Red & Cream Console...</p>
          <span className="text-[11px] text-stone-500 font-mono">Suraj (PZ7550) • Mandi Operations</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const counts = data?.counts || {};
  const overdueRetailers = data?.overdueRetailers || [];
  const topSellingProducts = data?.topSellingProducts || [];
  const salesVsCollectionTrend = data?.salesVsCollectionTrend || [];
  const targetAchieved = kpis.targetAchievementPct || 64;

  // BI Data parsing
  const biPeriod = biData?.periodMetrics || {};
  const biVolume = biData?.volumeByUnitType || [];
  const biPaymentModes = biData?.paymentModesBreakdown || [];
  const biTopProds = biData?.topSellingProducts || [];

  const biWeightKg = biTopProds.reduce((s, p) => p.weightUnit === 'Kg' ? s + Number(p.totalWeightVolume || 0) : s, 0);
  const biTonnageMT = (biWeightKg / 1000).toFixed(1);

  // Regional depots data
  const regionalPerformance = [
    { depot: 'Sundernagar Depot', revenue: 485000, collection: 410000, dealers: 14 },
    { depot: 'Mandi Sadar Beat', revenue: 390000, collection: 345000, dealers: 11 },
    { depot: 'Balh / Ner Chowk', revenue: 260000, collection: 215000, dealers: 8 },
    { depot: 'Joginder Nagar', revenue: 195000, collection: 160000, dealers: 6 },
    { depot: 'Sarkaghat Beat', revenue: 140000, collection: 115000, dealers: 5 }
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 lg:bottom-6 right-4 sm:right-6 z-50 bg-[#1A0B0E] text-white px-4 py-3 rounded-xl shadow-2xl border border-amber-500/50 flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. EXECUTIVE HERO CARD (Red & Cream Theme, Fully Responsive) */}
      <div className="bg-[#FFFDF7] p-4 sm:p-5 lg:p-6 rounded-2xl border border-[#EEDFB8] shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Officer & Mandi Region */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-birlaRed-900 to-birlaRed-700 text-amber-300 flex items-center justify-center font-display font-black text-base shadow-md border border-amber-300/40">
              BW
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-base sm:text-lg lg:text-xl font-extrabold text-birlaRed-950 tracking-tight">
                Mandi Territory Sales Operations
              </h1>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-600 mt-1 font-medium">
              <span className="text-birlaRed-900 font-bold">Suraj (PZ7550)</span>
              <span>•</span>
              <span>Territory Sales Officer</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-stone-700 font-semibold hidden sm:inline">UltraTech Cement Ltd. (Unit: Birla White)</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">HP Mandi Hub</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls (Touch Friendly) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#EEDFB8]">
          <button
            onClick={() => loadDashboard(true)}
            className="p-2 sm:p-2.5 rounded-xl bg-[#FAF6E8] hover:bg-[#F5ECCB] text-stone-700 hover:text-birlaRed-900 transition-all border border-[#EEDFB8] shadow-xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-birlaRed-800' : ''}`} />
          </button>

          <a
            href="#bi-analytics-section"
            className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-xl border border-amber-300 transition-all flex items-center space-x-1.5"
            title="Jump to BI & Analytics Hub"
          >
            <BarChart3 className="w-3.5 h-3.5 text-birlaRed-800" />
            <span>BI Hub &darr;</span>
          </a>

          <button
            onClick={() => exportOrdersToExcel(filteredOrders)}
            className="px-3 py-2 bg-[#1A0B0E] hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 active:scale-95"
            title="Export Sales Orders to styled Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export Excel (.xlsx)</span>
            <span className="sm:hidden">Excel</span>
          </button>

          <button
            onClick={() => setPaymentModal({ isOpen: true, defaultRetailerId: null })}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>+ Payment</span>
          </button>

          {onOpenNewOrder && (
            <button
              onClick={onOpenNewOrder}
              className="px-3.5 py-2 bg-gradient-to-r from-birlaRed-800 to-birlaRed-900 hover:from-birlaRed-700 hover:to-birlaRed-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:shadow-birlaRed-800/30 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Book Order</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. COMPACT SEARCH & TERRITORY FILTER STRIP */}
      <div className="bg-[#FFFDF7] p-3 sm:p-3.5 rounded-2xl border border-[#EEDFB8] shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Timeframe Selector Pills */}
        <div className="flex items-center space-x-1 bg-[#FAF6E8] p-1 rounded-xl border border-[#EEDFB8] text-xs overflow-x-auto">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1.5 sm:px-2">Scope:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'mtd', label: 'MTD (Nov)' },
            { id: 'qtd', label: 'Q3' },
            { id: 'ytd', label: 'FY 26-27' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeframe(item.id)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                timeframe === item.id
                  ? 'bg-birlaRed-800 text-white font-bold shadow-xs'
                  : 'text-stone-700 hover:text-birlaRed-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
          {/* Tehsil Dropdown */}
          <select
            value={selectedTehsil}
            onChange={(e) => setSelectedTehsil(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#FAF6E8] border border-[#EEDFB8] rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-birlaRed-700/20"
          >
            <option value="All">All Depots ({counts.stockists || 3})</option>
            <option value="Sundernagar">Sundernagar Depot</option>
            <option value="Mandi Sadar">Mandi Sadar Beat</option>
            <option value="Joginder Nagar">Joginder Nagar</option>
            <option value="Balh">Balh / Ner Chowk</option>
            <option value="Sarkaghat">Sarkaghat Beat</option>
          </select>

          {/* Quick Search Bar */}
          <div className="relative flex-1 sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6E8] border border-[#EEDFB8] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-birlaRed-700/20"
            />
          </div>
        </div>
      </div>

      {/* 3. FOUR REFINED KPI STAT CARDS (Cream surfaces with Red & Gold accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Gross Sales Invoiced */}
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card hover:border-birlaRed-700/50 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-birlaRed-800"></div>
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Gross Sales Invoiced</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {counts.orders || 0} Orders
              </span>
            </div>
            <p className="font-display text-2xl font-black text-birlaRed-950 tracking-tight tabular-nums">
              {formatCurrency(kpis.totalSales)}
            </p>
          </div>
          {/* Monthly Target Progress */}
          <div className="mt-3 pt-2.5 border-t border-[#EEDFB8]">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-stone-500 font-medium">Monthly Target: ₹ 8.00 L</span>
              <span className="font-extrabold text-birlaRed-800">{targetAchieved}%</span>
            </div>
            <div className="w-full bg-[#FAF6E8] rounded-full h-1.5 overflow-hidden border border-[#EEDFB8]">
              <div
                className="bg-birlaRed-800 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${targetAchieved}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Fulfillment Pipeline */}
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card hover:border-emerald-500/50 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Fulfillment Pipeline</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-display text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
                {formatCurrency(kpis.totalDispatchedValue)}
              </span>
              <span className="text-xs text-stone-400 font-semibold">Dispatched</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#EEDFB8] flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">Pending Backorder:</span>
            <span className="font-bold text-amber-700">{formatCurrency(kpis.totalPendingValue)}</span>
          </div>
        </div>

        {/* KPI 3: Total Collections Reconciled */}
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card hover:border-amber-500/50 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Total Collected</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Reconciled
              </span>
            </div>
            <p className="font-display text-2xl font-black text-amber-800 tracking-tight tabular-nums">
              {formatCurrency(kpis.totalCollected)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#EEDFB8] flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">Payment Clearance:</span>
            <span className="font-bold text-emerald-700">100% Cleared</span>
          </div>
        </div>

        {/* KPI 4: Market Outstanding Receivables */}
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card hover:border-rose-400/50 transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600"></div>
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Market Receivables</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                {counts.retailers || 0} Retailers
              </span>
            </div>
            <p className="font-display text-2xl font-black text-rose-700 tracking-tight tabular-nums">
              {formatCurrency(kpis.totalBalanceDue)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#EEDFB8] flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">Overdue (&gt;30 Days):</span>
            <span className="font-bold text-rose-700">{overdueRetailers.length} Dealers</span>
          </div>
        </div>
      </div>

      {/* 4. TWO-COLUMN ANALYTICS & FIELD BEAT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left (2 Columns): Sales vs Collections Flow & Top SKUs */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Sales vs Collections AreaChart */}
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-display font-bold text-sm text-birlaRed-950 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-birlaRed-800" />
                  <span>Revenue & Collection Flow (Mandi Division)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Gross Sales vs Cleared Market Collections
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                Healthy Recovery
              </span>
            </div>

            <div className="h-56 sm:h-64 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesVsCollectionTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="creamSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9E1B22" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#9E1B22" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="creamCol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEDFB8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#78716C' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: '#1A0B0E',
                      borderRadius: '12px',
                      color: '#fff',
                      border: '1px solid #7F1318',
                      fontSize: '11px'
                    }}
                  />
                  <Area type="monotone" dataKey="sales" name="Invoiced Sales" stroke="#9E1B22" strokeWidth={2.5} fillOpacity={1} fill="url(#creamSales)" />
                  <Area type="monotone" dataKey="collections" name="Collections Cleared" stroke="#D97706" strokeWidth={2.5} fillOpacity={1} fill="url(#creamCol)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top SKUs Volume Matrix */}
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-birlaRed-950 flex items-center space-x-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Top Selling SKUs Volume Breakdown</span>
              </h3>
              <Link to="/catalog" className="text-xs text-birlaRed-800 font-bold hover:underline flex items-center space-x-1">
                <span>View Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {topSellingProducts.slice(0, 4).map((p, i) => {
                const totalRev = topSellingProducts.reduce((s, x) => s + (x.totalRevenue || 0), 0) || 1;
                const pct = Math.round(((p.totalRevenue || 0) / totalRev) * 100);

                return (
                  <div key={i} className="p-3 bg-[#FAF6E8] rounded-xl border border-[#EEDFB8] hover:border-amber-400 transition-all">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-stone-900">{p.productName}</span>
                      <span className="font-mono font-bold text-birlaRed-900">{formatCurrency(p.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                      <span>{p.totalQuantity} {p.unitType}s ({p.unitWeight} {p.weightUnit})</span>
                      <span className="font-mono font-bold text-amber-800">
                        {p.totalWeightVolume >= 1000 && p.weightUnit === 'Kg'
                          ? `${(p.totalWeightVolume / 1000).toFixed(2)} MT`
                          : `${p.totalWeightVolume} ${p.weightUnit}`}
                      </span>
                    </div>
                    <div className="w-full bg-[#EEDFB8] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-birlaRed-800 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (1 Column): Today's PJP Field Beat & Overdue Watchlist */}
        <div className="space-y-5 sm:space-y-6">
          {/* Today's PJP Beat Card */}
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                  <CalendarCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-birlaRed-950">Today's PJP Field Beat</h3>
                  <span className="text-[10px] text-stone-500 font-medium">November 2026 Plan</span>
                </div>
              </div>
              <Link to="/pjp" className="text-xs font-bold text-birlaRed-800 hover:underline">
                Open PJP &rarr;
              </Link>
            </div>

            <div className="bg-gradient-to-br from-amber-100/70 via-cream-100 to-transparent p-3.5 rounded-xl border border-amber-300/80 mb-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                <span>Active Beat: Mandi Sadar & Bhojpur</span>
                <span className="bg-birlaRed-800 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                  Today
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-1 font-medium">
                Dealer visits: Verma Hardware, Sharma Paints, Himalayan Traders.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[#FAF6E8] rounded-lg text-stone-700 border border-[#EEDFB8]/60">
                <span>Monthly Target Visits:</span>
                <span className="font-bold font-mono">22 Days / 65 Dealers</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#FAF6E8] rounded-lg text-stone-700 border border-[#EEDFB8]/60">
                <span>Officer Tag:</span>
                <span className="font-bold text-birlaRed-900">Suraj (PZ7550)</span>
              </div>
            </div>
          </div>

          {/* Overdue Accounts Watchlist */}
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-display font-bold text-sm text-birlaRed-950">Overdue Watchlist (&gt;30 Days)</h3>
              </div>
              <Link to="/ledger" className="text-xs font-bold text-birlaRed-800 hover:underline">
                Ledger &rarr;
              </Link>
            </div>

            {overdueRetailers.length === 0 ? (
              <div className="py-6 text-center text-stone-400 text-xs font-medium">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <span>All dealer accounts healthy within credit terms!</span>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueRetailers.map((r, i) => (
                  <div key={i} className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-stone-900">{r.firmName}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {r.locality}, {r.tehsil} • <span className="text-rose-700 font-bold">{r.dueDays} Days Due</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-xs text-rose-700">{formatCurrency(r.pendingBalance)}</div>
                      <button
                        onClick={() => setPaymentModal({ isOpen: true, defaultRetailerId: r.id })}
                        className="mt-1 px-2.5 py-1 bg-white hover:bg-birlaRed-800 hover:text-white text-stone-800 border border-[#EEDFB8] rounded-lg text-[10px] font-bold shadow-xs transition-all"
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

      {/* 5. RECENT ORDERS & TAX INVOICES TABLE (Responsive Card on Mobile) */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EEDFB8] shadow-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-[#FAF6E8] border-b border-[#EEDFB8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-sm text-birlaRed-950">
              Live Sales Orders & Fulfillment Register
            </h3>
            <p className="text-[11px] text-stone-500">
              Real-time booking status, dual drop-shipping invoices, and delivery fulfillment.
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl text-xs font-semibold border border-[#EEDFB8] overflow-x-auto">
            {['All', 'Full', 'Partial', 'Pending', 'Delivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setOrderTab(tab)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                  orderTab === tab
                    ? 'bg-birlaRed-800 text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:text-birlaRed-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px] lg:min-w-full">
            <thead className="bg-[#1A0B0E] text-amber-100 font-semibold">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Retailer / Dealer</th>
                <th className="py-3 px-4">Tehsil</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-center">Fulfillment</th>
                <th className="py-3 px-4 text-center">Delivery</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEDFB8]/70">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400 font-medium">
                    No sales orders found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF6E8]/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-birlaRed-900">
                      <button
                        type="button"
                        onClick={() => setOrderDetailsModal({ isOpen: true, order: o })}
                        className="hover:underline text-left font-mono font-black text-birlaRed-900 hover:text-amber-700 flex items-center space-x-1 cursor-pointer transition-colors group"
                        title="Click to view full Order Details"
                      >
                        <span>{o.orderNumber}</span>
                        <ArrowUpRight className="w-3 h-3 text-amber-700 opacity-60 group-hover:opacity-100" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono">
                      {formatDate(o.orderDate)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setOrderDetailsModal({ isOpen: true, order: o })}
                        className="text-left cursor-pointer group block"
                        title="Click to view full Order Details"
                      >
                        <div className="font-bold text-stone-900 group-hover:text-birlaRed-900 group-hover:underline">
                          {o.retailer?.firmName}
                        </div>
                        <div className="text-[10px] text-stone-400">{o.retailer?.locality}</div>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {o.retailer?.tehsil || 'Mandi Sadar'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-stone-900">
                      {formatCurrency(o.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          o.fulfillmentStatus === 'Full'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : o.fulfillmentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
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
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {o.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-y-1">
                        <button
                          type="button"
                          onClick={() => setReceiptModal({ isOpen: true, order: o })}
                          className="px-2.5 py-1 bg-white hover:bg-birlaRed-800 hover:text-white text-stone-800 border border-[#EEDFB8] rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                          title="View Dual Drop-Shipping Tax Invoice & Delivery Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5 text-birlaRed-800" />
                          <span>Receipt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setChallanModal({ isOpen: true, order: o, mode: 'dispatched' })}
                          className="px-2 py-1 bg-[#FAF6E8] hover:bg-emerald-700 hover:text-white text-emerald-900 border border-[#EEDFB8] rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                          title="View Dispatched Material Delivery Challan"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Challan</span>
                        </button>

                        {o.deliveryStatus !== 'Delivered' && (
                          <button
                            type="button"
                            onClick={() => handleMarkDelivered(o.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                            title="Mark Order as Delivered"
                          >
                            Delivered
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

      {/* ========================================================================= */}
      {/* 6. BI & ADVANCED ANALYTICS COMMAND CENTER (EMBEDDED UNDER DASHBOARD) */}
      {/* ========================================================================= */}
      <section id="bi-analytics-section" className="pt-6 border-t-2 border-[#EEDFB8] space-y-5 sm:space-y-6">
        {/* BI Hub Header Ribbon */}
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-birlaRed-800 text-amber-300 flex items-center justify-center border border-amber-300/40 shadow-xs flex-shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base sm:text-lg lg:text-xl font-black text-birlaRed-950 tracking-tight">
                  Business Intelligence & Analytics Hub
                </h2>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                  Executive Telemetry
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Realized collections, Days Sales Outstanding (DSO), SKU tonnage, and depot market performance for Mandi Division.
              </p>
            </div>
          </div>

          {/* Timeframe Switcher & Export Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-[#FAF6E8] p-1 rounded-xl flex items-center text-xs font-semibold border border-[#EEDFB8] overflow-x-auto">
              {[
                { id: 'monthly', label: 'Monthly' },
                { id: 'quarterly', label: 'Q3' },
                { id: 'halfyearly', label: 'Half-Yearly' },
                { id: 'annually', label: 'FY 26-27' }
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setBiTimeframe(tf.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    biTimeframe === tf.id
                      ? 'bg-birlaRed-800 text-white font-bold shadow-xs'
                      : 'text-stone-700 hover:text-birlaRed-900'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => exportBiAnalyticsToExcel(biData, biTimeframe)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
              <span>Export BI (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* BI 4 KPI Scorecard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-birlaRed-800"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Period Invoiced</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +16.8% MoM
              </span>
            </div>
            <div className="font-display text-2xl font-black text-birlaRed-950 tracking-tight tabular-nums">
              {formatCurrency(biPeriod.totalInvoiced)}
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EEDFB8] text-[11px] text-stone-500 flex justify-between">
              <span>{biPeriod.orderCount || 0} Invoices</span>
              <span className="text-birlaRed-800 font-bold">AOV: {formatCurrency(biPeriod.orderCount ? biPeriod.totalInvoiced / biPeriod.orderCount : 0)}</span>
            </div>
          </div>

          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Collections Cleared</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {biPeriod.totalInvoiced > 0 ? Math.round((biPeriod.totalCollected / biPeriod.totalInvoiced) * 100) : 100}% Recovery
              </span>
            </div>
            <div className="font-display text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
              {formatCurrency(biPeriod.totalCollected)}
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EEDFB8] text-[11px] text-stone-500 flex justify-between">
              <span>{biPeriod.paymentCount || 0} Receipts</span>
              <span className="text-emerald-700 font-bold">Zero Bounced</span>
            </div>
          </div>

          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Market Receivables</span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                14.8 Days DSO
              </span>
            </div>
            <div className="font-display text-2xl font-black text-rose-700 tracking-tight tabular-nums">
              {formatCurrency(biPeriod.totalDue)}
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EEDFB8] text-[11px] text-stone-500 flex justify-between">
              <span>Credit Health</span>
              <span className="text-emerald-700 font-bold">92% &lt;30 Days</span>
            </div>
          </div>

          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Volume Movement</span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Dry + Liquid
              </span>
            </div>
            <div className="font-display text-2xl font-black text-stone-900 tracking-tight flex items-baseline space-x-2">
              <span>{biTonnageMT}</span>
              <span className="text-sm font-semibold text-stone-500">MT</span>
              <span className="text-sm text-stone-300">•</span>
              <span className="text-amber-800">4,200</span>
              <span className="text-sm font-semibold text-stone-500">Ltr</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EEDFB8] text-[11px] text-stone-500 flex justify-between">
              <span>Delivery SLA</span>
              <span className="text-emerald-700 font-bold">98.4% On-Time</span>
            </div>
          </div>
        </div>

        {/* Executive Intelligence Alerts Banner */}
        <div className="bg-[#1A0B0E] p-4 sm:p-5 rounded-2xl text-white shadow-md border border-amber-900/50">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Executive Field Intelligence (TSO Suraj - Mandi Division)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Volume Driver: WallCare Putty</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                WallCare 40 Kg bags account for <strong className="text-amber-200">62.8% of dry tonnage</strong> with fast dealer turnover in Sundernagar.
              </p>
            </div>

            <div className="bg-white/5 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-300 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Digital Settlement Speed</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                UPI & Online RTGS constitute <strong className="text-amber-200">76% of inflows</strong>, reducing payment settlement to same-day bank realization.
              </p>
            </div>

            <div className="bg-white/5 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>PJP Beat Pacing</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                Mandi Sadar & Ner Chowk beats show <strong className="text-amber-200">104% target run-rate</strong>. Recommend Extocare primer sampling in Sarkaghat.
              </p>
            </div>
          </div>
        </div>

        {/* 4 BI Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Chart 1: Packaging Distribution */}
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card">
            <h3 className="font-display font-bold text-sm text-birlaRed-950 mb-1 flex items-center space-x-2">
              <Package className="w-4 h-4 text-birlaRed-800" />
              <span>Packaging Distribution (Bags, Buckets, Boxes)</span>
            </h3>
            <p className="text-[11px] text-stone-500 mb-3">Volume units moved across putty, primers, and tile grouts.</p>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={biVolume}
                    dataKey="quantity"
                    nameKey="unit"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={4}
                    label={({ unit, quantity }) => `${unit}: ${quantity}`}
                  >
                    {biVolume.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_PALETTE[index % BRAND_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A0B0E',
                      borderRadius: '12px',
                      color: '#fff',
                      border: '1px solid #7F1318',
                      fontSize: '11px'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Regional Market Penetration by Depot */}
          <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card">
            <h3 className="font-display font-bold text-sm text-birlaRed-950 mb-1 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>Regional Depot Sales & Collections</span>
            </h3>
            <p className="text-[11px] text-stone-500 mb-3">Gross revenue vs cleared receipts per key distribution hub.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalPerformance} layout="vertical" margin={{ top: 5, right: 25, left: 65, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEDFB8" />
                  <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 10, fill: '#78716C' }} />
                  <YAxis type="category" dataKey="depot" width={110} tick={{ fontSize: 11, fill: '#1C1917', fontWeight: 600 }} />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: '#1A0B0E',
                      borderRadius: '12px',
                      color: '#fff',
                      border: '1px solid #7F1318',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="revenue" name="Invoiced Revenue" fill="#9E1B22" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="collection" name="Collections Cleared" fill="#D97706" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Master SKU Volume & Profitability Matrix Table */}
        <div className="bg-[#FFFDF7] rounded-2xl border border-[#EEDFB8] shadow-card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-[#FAF6E8] border-b border-[#EEDFB8] flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-birlaRed-950">
                Master Product Volume & Sales Performance Matrix
              </h3>
              <p className="text-[11px] text-stone-500">
                Granular SKU aggregates: packaging sizes, units moved, tonnage, and invoice revenue.
              </p>
            </div>
            <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
              {biTopProds.length} SKUs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-[#1A0B0E] text-amber-100 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4">Product Description</th>
                  <th className="py-3 px-4">Packaging Unit</th>
                  <th className="py-3 px-4 text-center">Packaging Size</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4 text-right">Net Weight / Volume</th>
                  <th className="py-3 px-4 text-right">Gross Invoiced (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEDFB8]/70">
                {biTopProds.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF6E8]/70 transition-colors">
                    <td className="py-3 px-4 text-center text-stone-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{p.productName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF6E8] text-stone-800 border border-[#EEDFB8]">
                        {p.unitType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-stone-700">
                      {p.unitWeight} {p.weightUnit}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-stone-900 font-mono">
                      {p.totalQuantity}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-800 font-mono">
                      {p.totalWeightVolume >= 1000 && p.weightUnit === 'Kg'
                        ? `${(p.totalWeightVolume / 1000).toFixed(2)} MT`
                        : `${p.totalWeightVolume} ${p.weightUnit}`}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-birlaRed-950 font-mono">
                      {formatCurrency(p.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ORDER DETAILS MODAL */}
      {orderDetailsModal.isOpen && orderDetailsModal.order && (
        <OrderDetailsModal
          isOpen={orderDetailsModal.isOpen}
          order={orderDetailsModal.order}
          onClose={() => setOrderDetailsModal({ isOpen: false, order: null })}
          onOpenReceipt={(ord) => setReceiptModal({ isOpen: true, order: ord })}
          onOpenChallan={(ord, mode) => setChallanModal({ isOpen: true, order: ord, mode: mode || 'dispatched' })}
          onOpenPayment={(ord) => setPaymentModal({ isOpen: true, defaultRetailerId: ord.retailerId || ord.retailer?.id })}
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

      {/* DUAL RECEIPT MODAL */}
      {receiptModal.isOpen && receiptModal.order && (
        <DualReceiptModal
          isOpen={receiptModal.isOpen}
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
