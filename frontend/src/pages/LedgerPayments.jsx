import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Receipt,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Store,
  User,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api';
import { exportLedgerToExcel } from '../utils/excelExporter';
import PaymentModal from '../components/PaymentModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function LedgerPayments() {
  const [ledgerData, setLedgerData] = useState([]);
  const [creatorSummary, setCreatorSummary] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRetailerId, setExpandedRetailerId] = useState(null);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' or 'payments'

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPreselect, setPaymentPreselect] = useState({ retailerId: '', orderId: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, payment: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLedger();
    loadPayments();
  }, []);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await api.getLedgerSummary();
      setLedgerData(res.ledgerSummary || []);
      setCreatorSummary(res.ordersGroupedByCreator || []);
    } catch (e) {
      console.error('Error loading ledger summary:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch (e) {
      console.error('Error loading payments:', e);
    }
  };

  const handleOpenPayment = (retailerId = '', orderId = '') => {
    setPaymentPreselect({ retailerId, orderId });
    setIsPaymentModalOpen(true);
  };

  const handleDeletePayment = async () => {
    if (!deleteModal.payment) return;
    setSubmitting(true);
    try {
      await api.deletePayment(deleteModal.payment.id);
      setDeleteModal({ isOpen: false, payment: null });
      loadPayments();
      loadLedger();
    } catch (err) {
      alert(err.message || 'Failed to delete payment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amt) => {
    if (amt === undefined || amt === null) return '₹ 0.00';
    return '₹ ' + Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // High-level aggregates
  const totalInvoicedAll = ledgerData.reduce((sum, r) => sum + r.totalInvoiced, 0);
  const totalPaidAll = ledgerData.reduce((sum, r) => sum + r.totalPaid, 0);
  const totalOutstandingAll = ledgerData.reduce((sum, r) => sum + r.outstandingBalance, 0);
  const totalOverdueAll = ledgerData.reduce((sum, r) => sum + r.overdueAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-birla-crimson" />
            <span>Retailer Ledger & Live Ageing / Overdue Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Paid vs Unpaid statements, Live Ageing counter calculating due days, and payment receipts generation.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => exportLedgerToExcel(ledgerData, payments)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            title="Download Retailer Ageing & Payment History in styled Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Ledger (.xlsx)</span>
          </button>

          <button
            onClick={() => handleOpenPayment()}
            className="px-4 py-2.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Payment</span>
          </button>
        </div>
      </div>

      {/* Aggregate Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold uppercase text-[11px] block">Total Invoiced Billing</span>
          <span className="text-xl font-black text-slate-900 block mt-1">{formatCurrency(totalInvoicedAll)}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Across all retail accounts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-emerald-700 font-semibold uppercase text-[11px] block">Total Payments Received</span>
          <span className="text-xl font-black text-emerald-600 block mt-1">{formatCurrency(totalPaidAll)}</span>
          <span className="text-[10px] text-emerald-800 mt-0.5 block">Cleared via UPI/NEFT/Cheque/Cash</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-600 font-semibold uppercase text-[11px] block">Current Outstanding Balance</span>
          <span className="text-xl font-black text-slate-900 block mt-1">{formatCurrency(totalOutstandingAll)}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Gross receivable</span>
        </div>

        {/* Highlighted Overdue Card */}
        <div className="bg-rose-50 border border-rose-300 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-rose-800 font-bold uppercase text-[11px] block">Live Overdue Balance</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-xl font-black text-rose-700 block mt-1">{formatCurrency(totalOverdueAll)}</span>
          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">Exceeded Credit Period (Urgent)</span>
        </div>
      </div>

      {/* Grouping by Created By (Requirement: Track total order amounts grouped by Created By) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-birla-gold mb-3">
          <User className="w-4 h-4" />
          <span>Total Order Portfolio Grouped by Territory Sales Officer (Created By):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creatorSummary.map((creator, i) => (
            <div key={i} className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs">
              <span className="font-extrabold text-sm block text-white">{creator.createdBy || 'Suraj (PZ7550)'}</span>
              <div className="mt-1 space-y-0.5 text-slate-300">
                <p>Total Booked: <strong>{formatCurrency(creator._sum?.grandTotal)}</strong> ({creator._count?.id} orders)</p>
                <p className="text-emerald-400">Total Paid: {formatCurrency(creator._sum?.totalPaidAmount)}</p>
                <p className="text-rose-300">Balance Due: {formatCurrency(creator._sum?.balanceDueAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Switcher: Ledger Statement vs Payment Transactions */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-birla-crimson text-birla-crimson'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>1. Retailer Account Ledger & Overdue Ageing Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-birla-crimson text-birla-crimson'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>2. Payment Receipts History ({payments.length})</span>
        </button>
      </div>

      {/* TAB 1: RETAILER LEDGER & LIVE AGEING TRACKER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <h3 className="font-bold text-sm text-slate-900">
              Retailer Ledger Accounts (Paid vs. Unpaid Summary & Live Due Days)
            </h3>
            <span className="text-xs text-slate-500">
              Tap any retailer to view itemized order ageing
            </span>
          </div>

          {/* Mobile View: High-Touch Ledger Cards (Visible on screens < md) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading ledger accounts...</div>
            ) : ledgerData.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No retailer accounts found.</div>
            ) : (
              ledgerData.map((item) => {
                const isExpanded = expandedRetailerId === item.id;
                return (
                  <div key={item.id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.firmName}</h4>
                        <div className="text-[10px] text-slate-500">{item.ownerName} • {item.locality}, {item.tehsil}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-mono font-black text-sm text-slate-900 block">{formatCurrency(item.outstandingBalance)}</span>
                        <span className="text-[10px] text-slate-400">Balance Due</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total Invoiced:</span>
                        <span className="font-mono font-semibold text-slate-800">{formatCurrency(item.totalInvoiced)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Total Paid:</span>
                        <span className="font-mono font-bold text-emerald-600">{formatCurrency(item.totalPaid)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div>
                        {item.maxOverdueDays > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <Clock className="w-3 h-3 text-rose-600" />
                            <span>{item.maxOverdueDays} DAYS OVERDUE</span>
                          </span>
                        ) : item.outstandingBalance > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Current ({item.creditDays}d limit)
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Fully Settled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                        >
                          + Collect
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedRetailerId(isExpanded ? null : item.id)}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center space-x-0.5"
                        >
                          <span>{isExpanded ? 'Hide' : 'Orders'}</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Order Breakdown on Mobile */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-2 animate-in fade-in duration-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Itemized Orders:</span>
                        {item.orders.map((ord) => (
                          <div key={ord.id} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-slate-900 block">{ord.orderNumber}</span>
                              <span className="text-[10px] text-slate-400">{formatDate(ord.orderDate)} • {ord.fulfillmentStatus}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-rose-700 block">Due: {formatCurrency(ord.balanceDueAmount)}</span>
                              <button
                                type="button"
                                onClick={() => handleOpenPayment(item.id, ord.id)}
                                className="text-[10px] text-birla-crimson font-bold hover:underline"
                              >
                                Pay this order &rarr;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop / Tablet View: Full Table (Hidden on screens < md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1200px] border-collapse">
              <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-8"></th>
                  <th className="py-3.5 px-4 min-w-[240px]">Retailer Firm & Location</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[125px]">Invoiced (₹)</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[125px]">Paid (₹)</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[125px]">Outstanding (₹)</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[100px]">Credit Days</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[160px]">Live Ageing / Due Days</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[125px]">Overdue Amount (₹)</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEDFB8]/70 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-stone-400 font-medium">
                      Loading ledger accounts...
                    </td>
                  </tr>
                ) : ledgerData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-stone-400 font-medium">
                      No retailer accounts found.
                    </td>
                  </tr>
                ) : (
                  ledgerData.map((item) => {
                    const isExpanded = expandedRetailerId === item.id;

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          className={`hover:bg-[#FAF6E8]/70 transition-colors cursor-pointer ${
                            item.hasOverdue ? 'bg-rose-50/20' : ''
                          }`}
                          onClick={() => setExpandedRetailerId(isExpanded ? null : item.id)}
                        >
                          {/* Expand chevron */}
                          <td className="py-3.5 px-4 text-stone-400 align-middle">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-700" /> : <ChevronRight className="w-4 h-4" />}
                          </td>

                          {/* Retailer Info */}
                          <td className="py-3.5 px-4 align-middle">
                            <span className="font-bold text-stone-900 text-xs block leading-snug">{item.firmName}</span>
                            <span className="text-[11px] text-stone-500 truncate block mt-0.5">
                              {item.ownerName} • {item.mobileNumber} • {item.locality}, {item.tehsil}
                            </span>
                          </td>

                          {/* Total Invoiced */}
                          <td className="py-3.5 px-4 text-right font-medium text-stone-900 whitespace-nowrap align-middle font-mono">
                            {formatCurrency(item.totalInvoiced)}
                          </td>

                          {/* Total Paid */}
                          <td className="py-3.5 px-4 text-right font-bold text-emerald-700 whitespace-nowrap align-middle font-mono">
                            {formatCurrency(item.totalPaid)}
                          </td>

                          {/* Outstanding Balance */}
                          <td className="py-3.5 px-4 text-right font-black text-stone-900 whitespace-nowrap align-middle font-mono">
                            {formatCurrency(item.outstandingBalance)}
                          </td>

                          {/* Credit Terms */}
                          <td className="py-3.5 px-4 text-center font-medium text-stone-600 whitespace-nowrap align-middle">
                            {item.creditDays} Days
                          </td>

                          {/* Live Ageing / Due Days Counter */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                            {item.maxOverdueDays > 0 ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse whitespace-nowrap">
                                <Clock className="w-3 h-3 text-rose-600" />
                                <span>{item.maxOverdueDays} DAYS OVERDUE</span>
                              </span>
                            ) : item.outstandingBalance > 0 ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                                Current (Within Limit)
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
                                Zero Balance
                              </span>
                            )}
                          </td>

                          {/* Overdue Amount */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle font-mono">
                            {item.overdueAmount > 0 ? (
                              <span className="font-black text-rose-700 whitespace-nowrap">
                                {formatCurrency(item.overdueAmount)}
                              </span>
                            ) : (
                              <span className="text-stone-400 font-mono whitespace-nowrap">₹ 0.00</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenPayment(item.id)}
                              className="px-3.5 py-1.5 bg-birlaRed-800 hover:bg-birlaRed-900 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
                            >
                              Pay Now
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED STATEMENT OF ORDERS FOR THIS RETAILER */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90">
                            <td colSpan={9} className="p-4 pl-12 border-t border-b border-slate-200">
                              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-birla-crimson" />
                                    <span>Detailed Unpaid Order Ageing for {item.firmName}:</span>
                                  </span>
                                  <button
                                    onClick={() => handleOpenPayment(item.id)}
                                    className="px-3 py-1 bg-birla-blue text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all shadow-xs"
                                  >
                                    + Add Payment Receipt
                                  </button>
                                </div>

                                {item.agedOrders?.length === 0 ? (
                                  <p className="text-xs text-slate-500 italic">No unpaid pending invoices.</p>
                                ) : (
                                  <table className="w-full text-left text-xs border border-slate-100 rounded-lg overflow-hidden">
                                    <thead className="bg-slate-100 text-slate-600">
                                      <tr>
                                        <th className="py-2 px-3">Order Number</th>
                                        <th className="py-2 px-3">Invoice Date</th>
                                        <th className="py-2 px-3 text-right">Order Value</th>
                                        <th className="py-2 px-3 text-right">Paid So Far</th>
                                        <th className="py-2 px-3 text-right">Balance Due</th>
                                        <th className="py-2 px-3 text-center">Invoice Age</th>
                                        <th className="py-2 px-3 text-center">Overdue Days</th>
                                        <th className="py-2 px-3 text-center">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {item.agedOrders.map((ord) => (
                                        <tr key={ord.id} className={ord.isOverdue ? 'bg-rose-50/40' : ''}>
                                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                                          <td className="py-2 px-3 text-slate-500">{formatDate(ord.orderDate)}</td>
                                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(ord.grandTotal)}</td>
                                          <td className="py-2 px-3 text-right text-emerald-600 font-semibold">{formatCurrency(ord.totalPaidAmount)}</td>
                                          <td className="py-2 px-3 text-right font-bold text-slate-900">{formatCurrency(ord.balanceDueAmount)}</td>
                                          <td className="py-2 px-3 text-center font-medium text-slate-600">{ord.ageDays} Days</td>
                                          <td className="py-2 px-3 text-center">
                                            {ord.dueDays > 0 ? (
                                              <span className="px-2 py-0.5 rounded font-black text-rose-700 bg-rose-100 text-[10px]">
                                                {ord.dueDays} Days Due
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 rounded font-bold text-emerald-700 bg-emerald-100 text-[10px]">
                                                Current
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-3 text-center">
                                            <button
                                              onClick={() => handleOpenPayment(item.id, ord.id)}
                                              className="px-2 py-0.5 bg-slate-900 hover:bg-birla-crimson text-white rounded text-[10px] font-bold transition-all"
                                            >
                                              Clear Bill
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT RECEIPTS HISTORY */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Official Money Receipts & Payment Transactions</h3>
            <button
              onClick={() => handleOpenPayment()}
              className="px-3.5 py-1.5 bg-birla-crimson text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>

          {/* Mobile View: High-Touch Payment Cards (Visible on screens < md) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No payment receipts generated yet.</div>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono font-bold text-xs text-slate-900 block">{p.receiptNumber}</span>
                      <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">{p.retailer?.firmName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{formatDate(p.transactionDate)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-black text-sm text-emerald-600 block">{formatCurrency(p.amountPaid)}</span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-birla-blue border border-blue-200/60">
                        {p.paymentMode}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Linked Account:</span>
                      <span className="font-mono font-medium text-slate-800">{p.order ? p.order.orderNumber : 'Running Account Ledger'}</span>
                    </div>
                    {p.referenceNo && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ref / Cheque:</span>
                        <span className="font-mono text-slate-800">{p.referenceNo}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] pt-0.5 border-t border-slate-200/60">
                      <span className="text-slate-500">Recorded By:</span>
                      <span className="text-slate-700 font-medium">{p.recordedBy || 'Suraj (PZ7550)'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center space-x-1"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>Print PDF</span>
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, payment: p })}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-all flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop / Tablet View: Full Table (Hidden on screens < md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1180px] border-collapse">
              <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Receipt No & Date</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Retailer (Payer)</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">Linked Order</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[130px]">Amount Paid (₹)</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[110px]">Payment Mode</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Cheque Date / UTR Ref</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Recorded By</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[110px]">Receipt PDF</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[90px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEDFB8]/70 bg-white">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-stone-400 font-medium">
                      No payment receipts generated yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF6E8]/70 transition-colors">
                      {/* Receipt No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap align-middle">
                        <span className="block font-black text-xs text-birlaRed-950">{p.receiptNumber}</span>
                        <span className="text-[10px] text-stone-500 font-normal block font-mono">{formatDate(p.transactionDate)}</span>
                      </td>

                      {/* Retailer */}
                      <td className="py-3.5 px-4 align-middle">
                        <span className="font-bold text-stone-900 block text-xs leading-snug">{p.retailer?.firmName}</span>
                        <span className="text-[10px] text-stone-500 font-normal block truncate">{p.retailer?.locality}</span>
                      </td>

                      {/* Order */}
                      <td className="py-3.5 px-4 font-mono text-stone-600 whitespace-nowrap align-middle">
                        {p.order ? p.order.orderNumber : 'Running Account Ledger'}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-700 whitespace-nowrap align-middle font-mono">
                        {formatCurrency(p.amountPaid)}
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                            p.paymentMode === 'UPI'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : p.paymentMode === 'Cheque'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : p.paymentMode === 'Cash'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                          }`}
                        >
                          {p.paymentMode}
                        </span>
                      </td>

                      {/* Cheque Date / UTR */}
                      <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap align-middle">
                        {p.paymentMode === 'Cheque' && p.chequeDate ? (
                          <span className="text-amber-800 font-semibold block text-[11px]">
                            Chq Date: {formatDate(p.chequeDate)}
                          </span>
                        ) : null}
                        <span className="text-[11px] font-mono text-stone-500">{p.referenceNo || 'Direct Entry'}</span>
                      </td>

                      {/* Recorded By */}
                      <td className="py-3.5 px-4 text-stone-600 font-medium whitespace-nowrap align-middle">
                        {p.recordedBy || 'Suraj (PZ7550)'}
                      </td>

                      {/* Download Receipt PDF */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                        <button
                          onClick={() => {
                            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                              window.open(`/api/payments/${p.id}/receipt`, '_blank');
                            } else {
                              window.print();
                            }
                          }}
                          className="px-2.5 py-1 bg-birla-blue hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold transition-all inline-flex items-center space-x-1 shadow-xs"
                          title="Print or Save Official Receipt PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>Receipt PDF</span>
                        </button>
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, payment: p })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Entry Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultRetailerId={paymentPreselect.retailerId}
        defaultOrderId={paymentPreselect.orderId}
        onPaymentSuccess={() => {
          loadLedger();
          loadPayments();
        }}
      />

      {/* Delete Payment Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Payment Record?"
        message={`Are you sure you want to delete payment receipt "${deleteModal.payment?.receiptNumber}" for ₹${deleteModal.payment?.amountPaid}? The corresponding order outstanding balance will be automatically readjusted.`}
        onConfirm={handleDeletePayment}
        onCancel={() => setDeleteModal({ isOpen: false, payment: null })}
        isDeleting={submitting}
      />
    </div>
  );
}
