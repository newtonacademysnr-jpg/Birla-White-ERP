import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  CreditCard,
  Package,
  TrendingUp,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpRight
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
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { api } from '../api';

const COLORS = ['#0087CF', '#A02225', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('quarterly'); // 'monthly', 'quarterly', 'halfyearly', 'annually'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-birla-crimson/30 border-t-birla-crimson rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold">Generating BI Performance Analytics...</p>
        </div>
      </div>
    );
  }

  const periodMetrics = data?.periodMetrics || {};
  const paymentModes = data?.paymentModesBreakdown || [];
  const topProducts = data?.topSellingProducts || [];
  const volumeByUnit = data?.volumeByUnitType || [];
  const trend = data?.salesVsCollectionTrend || [];

  // Data for Collected vs Due
  const collectedVsDueData = [
    { name: 'Collected', amount: periodMetrics.totalCollected, color: '#10B981' },
    { name: 'Due / Pending', amount: periodMetrics.totalDue, color: '#A02225' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Timeframe Filter Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-birla-crimson" />
            <span>BI Performance Tracker & Business Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aditya Birla - Unit Birla White executive analytics: Timeframe filters, payment-wise breakdowns, and product volume analysis.
          </p>
        </div>

        {/* Timeframe Filter Switcher: Monthly, Quarterly, Half-Yearly, Annually */}
        <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-bold border border-slate-300/50">
          {[
            { id: 'monthly', label: 'Monthly' },
            { id: 'quarterly', label: 'Quarterly' },
            { id: 'halfyearly', label: 'Half-Yearly' },
            { id: 'annually', label: 'Annually' }
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeframe === tf.id
                  ? 'bg-birla-crimson text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period High-Level Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold uppercase text-[11px] block">Period Total Invoiced</span>
          <span className="text-xl font-black text-slate-900 block mt-1">{formatCurrency(periodMetrics.totalInvoiced)}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{periodMetrics.orderCount} orders in this timeframe</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-emerald-700 font-semibold uppercase text-[11px] block">Period Total Collected</span>
          <span className="text-xl font-black text-emerald-600 block mt-1">{formatCurrency(periodMetrics.totalCollected)}</span>
          <span className="text-[10px] text-emerald-800 mt-0.5 block">{periodMetrics.paymentCount} payments received</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-rose-700 font-semibold uppercase text-[11px] block">Period Pending Due</span>
          <span className="text-xl font-black text-rose-600 block mt-1">{formatCurrency(periodMetrics.totalDue)}</span>
          <span className="text-[10px] text-rose-700 mt-0.5 block">Receivable for this period</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-birla-blue font-semibold uppercase text-[11px] block">Collection Efficiency</span>
          <span className="text-xl font-black text-birla-blue block mt-1">
            {periodMetrics.totalInvoiced > 0
              ? `${Math.round((periodMetrics.totalCollected / periodMetrics.totalInvoiced) * 100)}%`
              : '100%'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Target: &gt;85% recovery</span>
        </div>
      </div>

      {/* SECTION 1: PAYMENT-WISE BREAKDOWNS */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <CreditCard className="w-4 h-4 text-birla-blue" />
          <span>1. Payment-Wise Breakdown (Collected vs. Due & Mode Distribution)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1A: Collected vs Due */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-xs text-slate-900 mb-1">Invoiced Recovery: Collected vs. Due Amount</h3>
            <p className="text-[11px] text-slate-500 mb-4">Ratio of realized revenue to pending market receivables</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectedVsDueData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} textAnchor="middle" />
                  <YAxis type="category" dataKey="name" width={90} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                    {collectedVsDueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 1B: Payment Mode Breakdown (Cash, UPI, Cheque, Online) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-xs text-slate-900 mb-1">Collection by Payment Mode (UPI, Cash, Cheque, Online)</h3>
            <p className="text-[11px] text-slate-500 mb-4">Volume of cleared receipts per banking channel</p>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModes}
                    dataKey="amount"
                    nameKey="mode"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    label={(entry) => `${entry.mode}: ${formatCurrency(entry.amount)}`}
                  >
                    {paymentModes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PRODUCT-WISE BREAKDOWNS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Package className="w-4 h-4 text-birla-crimson" />
          <span>2. Product-Wise Breakdown (Top-Selling Products & Volume in Bags/Buckets/Kg/Ltr)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Top Selling Products Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-xs text-slate-900 mb-1">Top-Selling Products by Revenue (₹)</h3>
            <p className="text-[11px] text-slate-500 mb-4">Highest grossing SKUs across Himachal Pradesh dealers</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.slice(0, 5)} margin={{ top: 10, right: 20, left: 20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="productName"
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                    height={45}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="totalRevenue" name="Revenue (₹)" fill="#A02225" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume by Unit Type (Bag vs Bucket vs Box vs PCS vs Manual) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-xs text-slate-900 mb-1">Volume by Packaging Unit</h3>
            <p className="text-[11px] text-slate-500 mb-4">Distribution across Bag, Bucket, Box, PCS, Manual</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={volumeByUnit}
                    dataKey="quantity"
                    nameKey="unit"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.unit}: ${entry.quantity}`}
                  >
                    {volumeByUnit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Product Volume Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">
              Product Volume Breakdown (Quantities & Metric Tonnage / Litres)
            </span>
            <span className="text-[11px] text-slate-500">Live order item aggregates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Product Description</th>
                  <th className="py-2.5 px-4">Unit Type</th>
                  <th className="py-2.5 px-4 text-center">Packaging Size</th>
                  <th className="py-2.5 px-4 text-center">Units Sold</th>
                  <th className="py-2.5 px-4 text-right">Total Net Weight / Volume</th>
                  <th className="py-2.5 px-4 text-right">Total Invoiced (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{p.productName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{p.unitType}</td>
                    <td className="py-2.5 px-4 text-center text-slate-600 font-medium">
                      {p.unitWeight} {p.weightUnit}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-900">{p.totalQuantity} units</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-birla-blue">
                      {p.totalWeightVolume >= 1000 && p.weightUnit === 'Kg'
                        ? `${(p.totalWeightVolume / 1000).toFixed(2)} MT (Metric Tons)`
                        : `${p.totalWeightVolume.toLocaleString('en-IN')} ${p.weightUnit}`}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900">
                      {formatCurrency(p.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
