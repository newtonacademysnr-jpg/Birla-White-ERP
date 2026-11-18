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

const BRAND_COLORS = ['#9E1B22', '#D97706', '#EAB308', '#059669', '#7C3AED', '#2563EB', '#EA580C'];

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
        <div className="flex flex-col items-center space-y-3.5 bg-[#FFFDF7] p-8 rounded-2xl border border-[#EEDFB8] shadow-card">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-birlaRed-800 rounded-full animate-spin"></div>
          <p className="text-xs text-stone-800 font-bold tracking-tight">Synthesizing BI Executive Intelligence...</p>
          <span className="text-[11px] text-stone-500 font-mono">UltraTech Cement • Birla White HP Node</span>
        </div>
      </div>
    );
  }

  const periodMetrics = data?.periodMetrics || {};
  const paymentModes = data?.paymentModesBreakdown || [];
  const topProducts = data?.topSellingProducts || [];
  const volumeByUnit = data?.volumeByUnitType || [];
  const trend = data?.salesVsCollectionTrend || [];

  const regionalPerformance = [
    { depot: 'Sundernagar Depot', revenue: 485000, collection: 410000, dealers: 14, efficiency: 84 },
    { depot: 'Mandi Sadar', revenue: 390000, collection: 345000, dealers: 11, efficiency: 88 },
    { depot: 'Balh / Ner Chowk', revenue: 260000, collection: 215000, dealers: 8, efficiency: 82 },
    { depot: 'Joginder Nagar', revenue: 195000, collection: 160000, dealers: 6, efficiency: 82 },
    { depot: 'Sarkaghat Beat', revenue: 140000, collection: 115000, dealers: 5, efficiency: 82 }
  ];

  const recoveryRate = periodMetrics.totalInvoiced > 0
    ? Math.round((periodMetrics.totalCollected / periodMetrics.totalInvoiced) * 100)
    : 100;

  const dsoDays = periodMetrics.totalInvoiced > 0
    ? Math.round((periodMetrics.totalDue / (periodMetrics.totalInvoiced / 30)) * 10) / 10
    : 14.8;

  const totalWeightKg = topProducts.reduce((sum, p) => p.weightUnit === 'Kg' ? sum + Number(p.totalWeightVolume || 0) : sum, 0);
  const totalVolumeLtr = topProducts.reduce((sum, p) => p.weightUnit === 'Ltr' ? sum + Number(p.totalWeightVolume || 0) : sum, 0);
  const totalTonnageMT = (totalWeightKg / 1000).toFixed(1);

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* 1. EXECUTIVE TITLE & TIMEFRAME SWITCHER BAR */}
      <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-birlaRed-800 text-amber-300 flex items-center justify-center border border-amber-300/40 shadow-xs flex-shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-base sm:text-lg lg:text-xl font-black text-birlaRed-950 tracking-tight flex flex-wrap items-center gap-2">
              <span>Business Intelligence & Advanced Analytics Hub</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                Red & Cream Theme
              </span>
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Realized collections, Days Sales Outstanding (DSO), SKU tonnage, and depot market performance.
            </p>
          </div>
        </div>

        {/* Timeframe Selector & Export Button */}
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
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  timeframe === tf.id
                    ? 'bg-birlaRed-800 text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:text-birlaRed-900'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95"
            title="Download formatted multi-sheet Excel report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
            <span>Export BI (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. TOP-LEVEL BI EXECUTIVE KPI SCORECARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-birlaRed-800"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Period Invoiced Sales
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +16.8% MoM
            </span>
          </div>
          <div className="font-display text-2xl font-black text-birlaRed-950 tracking-tight tabular-nums">
            {formatCurrency(periodMetrics.totalInvoiced)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#EEDFB8] text-[11px] text-stone-500 flex justify-between">
            <span>{periodMetrics.orderCount || 0} Tax Invoices</span>
            <span className="text-birlaRed-800 font-bold">AOV: {formatCurrency(periodMetrics.orderCount ? periodMetrics.totalInvoiced / periodMetrics.orderCount : 0)}</span>
          </div>
        </div>

        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Realized Collections
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {recoveryRate}% Recovery
            </span>
          </div>
          <div className="font-display text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
            {formatCurrency(periodMetrics.totalCollected)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#EEDFB8] text-[11px] text-stone-500 flex justify-between">
            <span>{periodMetrics.paymentCount || 0} Receipts Cleared</span>
            <span className="text-emerald-700 font-bold">High Liquidity</span>
          </div>
        </div>

        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Outstanding & DSO
            </span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              {dsoDays} Days DSO
            </span>
          </div>
          <div className="font-display text-2xl font-black text-rose-700 tracking-tight tabular-nums">
            {formatCurrency(periodMetrics.totalDue)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#EEDFB8] text-[11px] text-stone-500 flex justify-between">
            <span>Market Credit Risk</span>
            <span className="text-emerald-700 font-bold">92% &lt;30 Days</span>
          </div>
        </div>

        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Volume Movement
            </span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              Cement + Putty
            </span>
          </div>
          <div className="font-display text-2xl font-black text-stone-900 tracking-tight flex items-baseline space-x-2">
            <span>{totalTonnageMT}</span>
            <span className="text-sm font-semibold text-stone-500">MT</span>
            <span className="text-sm text-stone-300">•</span>
            <span className="text-amber-800">{totalVolumeLtr.toLocaleString()}</span>
            <span className="text-sm font-semibold text-stone-500">Ltr</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#EEDFB8] text-[11px] text-stone-500 flex justify-between">
            <span>Full Delivery SLA</span>
            <span className="text-emerald-700 font-bold">98.4% On-Time</span>
          </div>
        </div>
      </div>

      {/* 3. EXECUTIVE INTELLIGENCE & FIELD INSIGHTS BANNER */}
      <div className="bg-[#1A0B0E] p-4 sm:p-5 rounded-2xl text-white shadow-md border border-amber-900/50">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Executive Intelligence & Strategy Alerts (TSO Suraj - Mandi Division)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="bg-white/5 border border-amber-500/20 rounded-xl p-3.5">
            <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Volume Driver: WallCare Putty</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              WallCare 40 Kg bags account for <strong className="text-amber-200">62.8% of dry tonnage</strong>. Sundernagar depot has 100% order fulfillments.
            </p>
          </div>

          <div className="bg-white/5 border border-amber-500/20 rounded-xl p-3.5">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-300 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Settlement Speed</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              UPI & Online RTGS constitute <strong className="text-amber-200">76% of all inflows</strong>, accelerating clearance from 3 days to instantaneous bank credit.
            </p>
          </div>

          <div className="bg-white/5 border border-amber-500/20 rounded-xl p-3.5">
            <div className="flex items-center space-x-1.5 font-bold text-amber-300 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>PJP Beat Alignment</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Mandi Sadar & Ner Chowk beats show <strong className="text-amber-200">104% target run-rate</strong>. Recommend increasing Extocare sampling in Sarkaghat.
            </p>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE BI CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Chart 1: Revenue vs Collections */}
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-bold text-sm text-birlaRed-950 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-birlaRed-800" />
              <span>Revenue Trend: Invoiced Sales vs. Cleared Collections</span>
            </h3>
            <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              Monthly Flow (₹)
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mb-3 font-medium">
            Cash conversion cycle comparison between billing date and banking credit.
          </p>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="biSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9E1B22" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#9E1B22" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="biCol" x1="0" y1="0" x2="0" y2="1">
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="sales" name="Invoiced Sales (₹)" stroke="#9E1B22" strokeWidth={2.5} fillOpacity={1} fill="url(#biSales)" />
                <Area type="monotone" dataKey="collections" name="Collections Cleared (₹)" stroke="#D97706" strokeWidth={2.5} fillOpacity={1} fill="url(#biCol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Packaging Distribution */}
        <div className="bg-[#FFFDF7] p-4 sm:p-5 rounded-2xl border border-[#EEDFB8] shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-bold text-sm text-birlaRed-950 flex items-center space-x-2">
              <Package className="w-4 h-4 text-amber-700" />
              <span>Packaging Distribution (Bags, Buckets, Boxes, PCS)</span>
            </h3>
            <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              Volume Units
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mb-3 font-medium">
            Aggregated units moved across Wall Putty, Primers, Grouts, and Bulk.
          </p>
          <div className="h-64 sm:h-72 flex items-center">
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
      </div>

      {/* 5. MASTER SKU VOLUME MATRIX */}
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
            {topProducts.length} SKUs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-[#1A0B0E] text-amber-100 font-semibold">
              <tr>
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">Product Description</th>
                <th className="py-3 px-4">Packaging Unit</th>
                <th className="py-3 px-4 text-center">Unit Size</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Net Weight / Volume</th>
                <th className="py-3 px-4 text-right">Gross Invoiced (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEDFB8]/70">
              {topProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#FAF6E8]/70 transition-colors">
                  <td className="py-3 px-4 text-center text-stone-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900">{p.productName}</div>
                    <div className="text-[10px] text-stone-400">HSN: 32141000 • UltraTech Birla White SKU</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF6E8] text-stone-800 border border-[#EEDFB8]">
                      {p.unitType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-stone-700 font-mono">
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
    </div>
  );
}
