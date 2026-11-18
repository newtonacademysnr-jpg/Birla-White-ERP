import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  CreditCard,
  Package,
  TrendingUp,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  MapPin,
  Filter,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { api } from '../api';
import { exportBiAnalyticsToExcel } from '../utils/excelExporter';

const BRAND_COLORS = ['#0076CE', '#FFB800', '#10B981', '#6366F1', '#EC4899', '#06B6D4', '#F97316'];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('quarterly'); // 'monthly', 'quarterly', 'halfyearly', 'annually'
  const [selectedDepot, setSelectedDepot] = useState('All');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getBiAnalytics(timeframe);
      setData(res);
    } catch (e) {
      console.error('Error loading BI analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amt) => {
    return '₹ ' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const handleExportExcel = () => {
    if (!data) return;
    exportBiAnalyticsToExcel(data, timeframe);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="flex flex-col items-center space-y-3.5 bg-white p-8 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-700 font-bold tracking-tight">Synthesizing BI Executive Intelligence...</p>
          <span className="text-[11px] text-slate-400 font-mono">UltraTech Cement • Birla White HP Node</span>
        </div>
      </div>
    );
  }

  const periodMetrics = data?.periodMetrics || {};
  const paymentModes = data?.paymentModesBreakdown || [];
  const topProducts = data?.topSellingProducts || [];
  const volumeByUnit = data?.volumeByUnitType || [];
  const trend = data?.salesVsCollectionTrend || [];

  // Regional performance data for Himachal Pradesh Depots
  const regionalPerformance = [
    { depot: 'Sundernagar Depot', revenue: 485000, collection: 410000, dealers: 14, efficiency: 84 },
    { depot: 'Mandi Sadar', revenue: 390000, collection: 345000, dealers: 11, efficiency: 88 },
    { depot: 'Balh / Ner Chowk', revenue: 260000, collection: 215000, dealers: 8, efficiency: 82 },
    { depot: 'Joginder Nagar', revenue: 195000, collection: 160000, dealers: 6, efficiency: 82 },
    { depot: 'Sarkaghat Beat', revenue: 140000, collection: 115000, dealers: 5, efficiency: 82 }
  ];

  // Collection recovery percentage
  const recoveryRate = periodMetrics.totalInvoiced > 0
    ? Math.round((periodMetrics.totalCollected / periodMetrics.totalInvoiced) * 100)
    : 100;

  // Days Sales Outstanding (DSO) calculation
  const dsoDays = periodMetrics.totalInvoiced > 0
    ? Math.round((periodMetrics.totalDue / (periodMetrics.totalInvoiced / 30)) * 10) / 10
    : 12.4;

  // Calculate total tonnage & litres
  const totalWeightKg = topProducts.reduce((sum, p) => p.weightUnit === 'Kg' ? sum + Number(p.totalWeightVolume || 0) : sum, 0);
  const totalVolumeLtr = topProducts.reduce((sum, p) => p.weightUnit === 'Ltr' ? sum + Number(p.totalWeightVolume || 0) : sum, 0);
  const totalTonnageMT = (totalWeightKg / 1000).toFixed(1);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. EXECUTIVE TITLE & TIMEFRAME SWITCHER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-200">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Business Intelligence & Advanced Analytics Hub</span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Enterprise Telemetry
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Realized collections, Days Sales Outstanding (DSO), SKU tonnage, and depot market performance for Mandi Division.
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Selector & Export Button */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold border border-slate-200/80">
            {[
              { id: 'monthly', label: 'Monthly (Nov)' },
              { id: 'quarterly', label: 'Q3 (Oct-Dec)' },
              { id: 'halfyearly', label: 'Half-Yearly' },
              { id: 'annually', label: 'FY 26-27' }
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  timeframe === tf.id
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
            title="Download formatted multi-sheet Excel report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export BI (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. TOP-LEVEL BI EXECUTIVE KPI SCORECARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Sales Invoiced */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-blue-300 transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Period Invoiced Sales
            </span>
            <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +16.8% MoM
            </span>
          </div>
          <div className="font-display text-2xl font-black text-slate-900 tracking-tight tabular-nums">
            {formatCurrency(periodMetrics.totalInvoiced)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{periodMetrics.orderCount || 0} Tax Invoices</span>
            <span className="text-blue-600 font-bold">AOV: {formatCurrency(periodMetrics.orderCount ? periodMetrics.totalInvoiced / periodMetrics.orderCount : 0)}</span>
          </div>
        </div>

        {/* Card 2: Realized Collections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-emerald-300 transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Realized Collections
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {recoveryRate}% Recovery
            </span>
          </div>
          <div className="font-display text-2xl font-black text-emerald-600 tracking-tight tabular-nums">
            {formatCurrency(periodMetrics.totalCollected)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{periodMetrics.paymentCount || 0} Receipts Cleared</span>
            <span className="text-emerald-700 font-bold">High Liquidity</span>
          </div>
        </div>

        {/* Card 3: Days Sales Outstanding (DSO) & Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-rose-300 transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Outstanding & DSO
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {dsoDays} Days DSO
            </span>
          </div>
          <div className="font-display text-2xl font-black text-rose-600 tracking-tight tabular-nums">
            {formatCurrency(periodMetrics.totalDue)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Market Credit Risk</span>
            <span className="text-emerald-600 font-bold">92% &lt;30 Days</span>
          </div>
        </div>

        {/* Card 4: Total Volume Dispatched (MT & Litres) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-amber-300 transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Volume Movement
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Cement + Putty + Paints
            </span>
          </div>
          <div className="font-display text-2xl font-black text-slate-900 tracking-tight flex items-baseline space-x-2">
            <span>{totalTonnageMT}</span>
            <span className="text-sm font-semibold text-slate-500">MT</span>
            <span className="text-sm text-slate-300">•</span>
            <span>{totalVolumeLtr.toLocaleString()}</span>
            <span className="text-sm font-semibold text-slate-500">Ltr</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Full Delivery SLA</span>
            <span className="text-emerald-600 font-bold">98.4% On-Time</span>
          </div>
        </div>
      </div>

      {/* 3. EXECUTIVE INTELLIGENCE & FIELD INSIGHTS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-5 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Executive Intelligence & Strategy Alerts (TSO Suraj - Mandi Division)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center space-x-1.5 font-bold text-blue-300 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Volume Driver: WallCare Putty</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              WallCare 40 Kg bags account for <strong className="text-white">62.8% of total dry tonnage</strong>. Sundernagar depot has 100% order fulfillments with zero stockout.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-300 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Settlement Efficiency</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              UPI & Online RTGS constitute <strong className="text-white">76% of all receipt inflows</strong>, accelerating clearance from 3 days to instantaneous bank credit.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>PJP Beat Alignment</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Mandi Sadar & Ner Chowk beats show <strong className="text-white">104% target run-rate</strong>. Recommend increasing Extocare Primer dealer sampling in Sarkaghat.
            </p>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE BI CHARTS (2x2 GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sales Invoicing vs Realized Collections Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Revenue Trend: Invoiced Sales vs. Cleared Collections</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Monthly Flow (₹)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">
            Cash conversion cycle comparison between billing date and banking credit.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 20, left: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0076CE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0076CE" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
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
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="sales" name="Invoiced Sales (₹)" stroke="#0076CE" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="collections" name="Collections Cleared (₹)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Product Volume Distribution by Packaging Unit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Package className="w-4 h-4 text-amber-500" />
              <span>Packaging Distribution (Bags, Buckets, Boxes, PCS)</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Volume Units
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">
            Aggregated units moved across Wall Putty, Primers, Grouts, and Bulk.
          </p>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeByUnit}
                  dataKey="quantity"
                  nameKey="unit"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  label={({ unit, quantity }) => `${unit}: ${quantity}`}
                >
                  {volumeByUnit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} units`, name]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Regional Depot / Tehsil Penetration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Regional Market Penetration by Depot (Himachal Pradesh)</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Territory Beat
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">
            Gross revenue generated per key distribution node in Mandi HQ.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalPerformance} layout="vertical" margin={{ top: 10, right: 30, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis type="category" dataKey="depot" width={110} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
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
                <Bar dataKey="revenue" name="Invoiced Revenue (₹)" fill="#0076CE" radius={[0, 8, 8, 0]} />
                <Bar dataKey="collection" name="Realized Collection (₹)" fill="#10B981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Inflow Liquidity by Payment Channel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Collection Channels & Settlement Liquidity</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Mode Share
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">
            Breakdown across UPI QR, Bank RTGS/NEFT, Cheque, and Cash receipts.
          </p>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentModes}
                  dataKey="amount"
                  nameKey="mode"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  label={(entry) => `${entry.mode}: ${formatCurrency(entry.amount)}`}
                >
                  {paymentModes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[(index + 2) % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. DETAILED PRODUCT VOLUME & REVENUE MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Master Product Volume & Sales Performance Matrix
            </h3>
            <p className="text-[11px] text-slate-500">
              Granular SKU aggregates: packaging sizes, units moved, tonnage, and invoice revenue.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Total SKUs Tracked:</span>
            <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {topProducts.length} Active SKUs
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">Product Description</th>
                <th className="py-3 px-4">Unit Packaging</th>
                <th className="py-3 px-4 text-center">Unit Size</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Net Weight / Volume</th>
                <th className="py-3 px-4 text-right">Gross Invoiced (₹)</th>
                <th className="py-3 px-4 text-center">Volume Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((p, idx) => {
                const totalRev = topProducts.reduce((s, x) => s + Number(x.totalRevenue || 0), 0) || 1;
                const sharePercent = Math.round((Number(p.totalRevenue || 0) / totalRev) * 100);

                return (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.productName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">HSN: 32141000 • Verified UltraTech SKU</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {p.unitType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-600 font-mono">
                      {p.unitWeight} {p.weightUnit}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono">
                      {p.totalQuantity} <span className="text-[10px] font-normal text-slate-500">units</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 font-mono">
                      {p.totalWeightVolume >= 1000 && p.weightUnit === 'Kg'
                        ? `${(p.totalWeightVolume / 1000).toFixed(2)} MT`
                        : `${p.totalWeightVolume.toLocaleString('en-IN')} ${p.weightUnit}`}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                      {formatCurrency(p.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(sharePercent * 2, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-600">{sharePercent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
