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
  Edit2
} from 'lucide-react';
import { api } from '../api';
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

        <button
          onClick={() => handleOpenPayment()}
          className="px-4 py-2.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
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
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
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
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
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
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Retailer Ledger Accounts (Paid vs. Unpaid Summary & Live Due Days)
            </h3>
            <span className="text-xs text-slate-500">
              Click any retailer row to expand itemized order ageing breakdown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Retailer Firm & Location</th>
                  <th className="py-3 px-4 text-right">Invoiced (₹)</th>
                  <th className="py-3 px-4 text-right">Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Outstanding (₹)</th>
                  <th className="py-3 px-4 text-center">Credit Days</th>
                  <th className="py-3 px-4 text-center">Live Ageing / Due Days</th>
                  <th className="py-3 px-4 text-right">Overdue Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Loading ledger accounts...
                    </td>
                  </tr>
                ) : ledgerData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No retailer accounts found.
                    </td>
                  </tr>
                ) : (
                  ledgerData.map((item) => {
                    const isExpanded = expandedRetailerId === item.id;

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            item.hasOverdue ? 'bg-rose-50/20' : ''
                          }`}
                          onClick={() => setExpandedRetailerId(isExpanded ? null : item.id)}
                        >
                          {/* Expand chevron */}
                          <td className="py-3.5 px-4 text-slate-400">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </td>

                          {/* Retailer Info */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 text-sm block">{item.firmName}</span>
                            <span className="text-[11px] text-slate-500">
                              {item.ownerName} • {item.mobileNumber} • {item.locality}, {item.tehsil}
                            </span>
                          </td>

                          {/* Total Invoiced */}
                          <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                            {formatCurrency(item.totalInvoiced)}
                          </td>

                          {/* Total Paid */}
                          <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                            {formatCurrency(item.totalPaid)}
                          </td>

                          {/* Outstanding Balance */}
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                            {formatCurrency(item.outstandingBalance)}
                          </td>

                          {/* Credit Terms */}
                          <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                            {item.creditDays} Days
                          </td>

                          {/* Live Ageing / Due Days Counter */}
                          <td className="py-3.5 px-4 text-center">
                            {item.maxOverdueDays > 0 ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                <Clock className="w-3 h-3 text-rose-600" />
                                <span>{item.maxOverdueDays} DAYS OVERDUE</span>
                              </span>
                            ) : item.outstandingBalance > 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Current (Within Limit)
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Zero Balance
                              </span>
                            )}
                          </td>

                          {/* Overdue Amount */}
                          <td className="py-3.5 px-4 text-right">
                            {item.overdueAmount > 0 ? (
                              <span className="font-black text-rose-600">
                                {formatCurrency(item.overdueAmount)}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">₹ 0.00</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenPayment(item.id)}
                              className="px-3 py-1 bg-birla-crimson hover:bg-birla-darkRed text-white text-[11px] font-bold rounded-lg transition-all shadow-xs"
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
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Official Money Receipts & Payment Transactions</h3>
            <button
              onClick={() => handleOpenPayment()}
              className="px-3.5 py-1.5 bg-birla-crimson text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-3 px-4">Receipt No & Date</th>
                  <th className="py-3 px-4">Retailer (Payer)</th>
                  <th className="py-3 px-4">Linked Order</th>
                  <th className="py-3 px-4 text-right">Amount Paid (₹)</th>
                  <th className="py-3 px-4 text-center">Payment Mode</th>
                  <th className="py-3 px-4">Cheque Date / UTR Ref</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4 text-center">Receipt PDF</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No payment receipts generated yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Receipt No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.receiptNumber}
                        <span className="text-[10px] text-slate-500 font-normal block">{formatDate(p.transactionDate)}</span>
                      </td>

                      {/* Retailer */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {p.retailer?.firmName}
                        <span className="text-[10px] text-slate-500 font-normal block">{p.retailer?.locality}</span>
                      </td>

                      {/* Order */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.order ? p.order.orderNumber : 'Running Account Ledger'}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-600">
                        {formatCurrency(p.amountPaid)}
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.paymentMode === 'UPI'
                              ? 'bg-blue-100 text-blue-800'
                              : p.paymentMode === 'Cheque'
                              ? 'bg-amber-100 text-amber-800'
                              : p.paymentMode === 'Cash'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {p.paymentMode}
                        </span>
                      </td>

                      {/* Cheque Date / UTR */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.paymentMode === 'Cheque' && p.chequeDate ? (
                          <span className="text-amber-800 font-semibold block">
                            Chq Date: {formatDate(p.chequeDate)}
                          </span>
                        ) : null}
                        <span className="text-[11px] font-mono text-slate-500">{p.referenceNo || 'Direct Entry'}</span>
                      </td>

                      {/* Recorded By */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {p.recordedBy || 'Suraj (PZ7550)'}
                      </td>

                      {/* Download Receipt PDF */}
                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={`/api/payments/${p.id}/receipt`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-birla-blue hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold transition-all inline-flex items-center space-x-1 shadow-xs"
                        >
                          <Download className="w-3 h-3" />
                          <span>Receipt PDF</span>
                        </a>
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
