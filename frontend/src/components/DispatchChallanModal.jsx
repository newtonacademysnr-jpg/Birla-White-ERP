import React, { useState } from 'react';
import { X, Printer, Download, Truck, AlertTriangle, ShieldCheck, CheckCircle2, Clock, MapPin, Building2, Phone, Loader2 } from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';
import { numberToWordsINR } from '../utils/numberToWords';
import { downloadElementAsPdf, printElementIsolated } from '../utils/printHelper';

export default function DispatchChallanModal({ isOpen = true, onClose, order, initialMode = 'dispatched' }) {
  const [activeTab, setActiveTab] = useState(initialMode); // 'dispatched' or 'pending'
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    printElementIsolated('printable-challan-slip');
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const title = activeTab === 'dispatched' ? `Birla_White_Delivery_Challan_${order.orderNumber}` : `Birla_White_Pending_Slip_${order.orderNumber}`;
      await downloadElementAsPdf('printable-challan-slip', `${title}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Could not download PDF directly. Opening print dialog as fallback.');
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amt) => {
    if (amt === undefined || amt === null) return '₹ 0.00';
    return '₹ ' + Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const rawItems = order.items || order.orderItems || [];
  const items = rawItems.map((it, idx) => {
    const rate = parseFloat(it.manualUnitRate !== undefined ? it.manualUnitRate : (it.unitPrice || 0));
    const qty = parseInt(it.orderedQty !== undefined ? it.orderedQty : (it.quantity || 0));
    const dQty = it.dispatchedQty !== undefined ? it.dispatchedQty : (it.dispatchedQuantity !== undefined ? it.dispatchedQuantity : qty);
    const pQty = it.pendingQty !== undefined ? it.pendingQty : (it.pendingQuantity !== undefined ? it.pendingQuantity : 0);
    const gstRate = parseFloat(it.gstRate || 18.0);
    const lineTotal = it.lineTotal !== undefined ? parseFloat(it.lineTotal) : (rate * qty);

    return {
      id: it.id || idx,
      productName: it.productName || it.product?.name || 'Birla White Product',
      unitType: it.unitType || it.product?.unitType || 'Bag',
      unitWeight: it.unitWeight || it.product?.unitWeight || 40,
      weightUnit: it.weightUnit || it.product?.weightUnit || 'Kg',
      orderedQty: qty,
      dispatchedQty: dQty,
      pendingQty: pQty,
      manualUnitRate: rate,
      gstRate,
      lineTotal
    };
  });

  const dispatchedItems = items.filter((it) => it.dispatchedQty > 0);
  const pendingItems = items.filter((it) => it.pendingQty > 0);

  const displayItems = activeTab === 'dispatched' ? dispatchedItems : pendingItems;

  // Rate is INCLUSIVE of GST (e.g. 980 * 10 = 9800)
  const totalDispatchedVal = order.dispatchedAmount !== undefined && order.dispatchedAmount > 0
    ? order.dispatchedAmount
    : dispatchedItems.reduce((s, it) => s + (it.dispatchedQty * it.manualUnitRate), 0);

  const totalPendingVal = order.pendingAmount !== undefined && order.pendingAmount > 0
    ? order.pendingAmount
    : pendingItems.reduce((s, it) => s + (it.pendingQty * it.manualUnitRate), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-2xl max-w-4xl w-full shadow-2xl border border-[#EEDFB8] overflow-hidden my-auto max-h-[96vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Top Header / Mode Switcher */}
        <div className="px-4 sm:px-6 py-3 bg-[#1A0B0E] text-white flex flex-wrap items-center justify-between gap-3 border-b border-amber-950/60 no-print">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-lg">
              <img src={brandLogo} alt="Birla White" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-xs tracking-wide text-amber-300 uppercase">
                {activeTab === 'dispatched' ? '1. MATERIAL DISPATCH CHALLAN' : '2. PENDING BACKORDER SLIP'}
              </h3>
              <p className="text-[11px] text-stone-300 font-mono">Order #{order.orderNumber} • Mandi Operations</p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-[#2D1217] p-1 rounded-xl border border-amber-900/50">
            <button
              onClick={() => setActiveTab('dispatched')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'dispatched'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1. Dispatch Challan</span>
              <span className="sm:hidden">1. Challan</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-300/40'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2. Pending Slip</span>
              <span className="sm:hidden">2. Pending</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-75 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Download Genuine PDF Document"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-birlaRed-800 hover:bg-birlaRed-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Print Clean 1-Page Official Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#FAF6E8] print-container">
          <div id="printable-challan-slip" className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-slate-200 max-w-3xl mx-auto text-slate-800 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b-2 border-birlaRed-800 pb-3 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="bg-white p-1 rounded border border-slate-200 shadow-2xs">
                  <img
                    src={brandLogo}
                    alt="Aditya Birla UltraTech Birla White"
                    className="h-11 sm:h-13 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-birlaRed-900 leading-tight">
                    UltraTech Cement Ltd. - Unit: Birla White
                  </h1>
                  <p className="text-[10px] text-slate-700 font-bold">
                    Aditya Birla Group • Building Solutions Division
                  </p>
                  <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                    Central Logistics Depot, Sundernagar & Mandi Hub, Himachal Pradesh<br />
                    GSTIN: <strong>02AAACU1234F1Z0</strong> | Officer: <strong>Suraj (PZ7550) • 8219796922</strong>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right flex-shrink-0">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mb-1 ${
                    activeTab === 'dispatched'
                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}
                >
                  {activeTab === 'dispatched' ? 'DELIVERY CHALLAN & DISPATCH NOTE' : 'BACKORDER ADVISORY & PENDING SLIP'}
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">
                  {activeTab === 'dispatched' ? `CH-${order.orderNumber}` : `PEND-${order.orderNumber}`}
                </p>
                <p className="text-[10px] text-slate-500">Date: {formatDate(order.orderDate)}</p>
                <p className="text-[9px] text-emerald-700 font-bold">Original Document</p>
              </div>
            </div>

            {/* Consignee & Transit Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 mb-3 text-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Consignee / Dealer Destination:
                </span>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{order.retailer?.firmName || 'Retailer Firm'}</h4>
                <p className="text-slate-600 mt-0.5 text-[11px]">
                  {order.deliveryLocation || order.retailer?.locality}, {order.retailer?.tehsil || 'Mandi'}, HP
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  GSTIN: {order.retailer?.gstNumber || '02AAFPS1122B1Z1'} | Mobile: {order.retailer?.mobileNumber || '98160XXXXX'}
                </p>
              </div>

              <div className="sm:border-l sm:border-slate-200 sm:pl-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Logistics & Shipment Transit Data:
                </span>
                <p className="text-slate-700 font-medium text-[11px]">Vehicle: <strong>HP-31-TR-8492 (Dedicated Fleet)</strong></p>
                <p className="text-slate-600 text-[10px]">Dispatch Hub: Sundernagar Depot Central Yard</p>
                <p className="text-slate-600 text-[10px]">
                  Fulfillment Status: <strong className="text-emerald-700">{order.fulfillmentStatus}</strong>
                </p>
                {activeTab === 'pending' && order.partialReason && (
                  <p className="text-rose-700 font-bold text-[10px] mt-0.5 bg-rose-50 p-1 rounded border border-rose-200">
                    Reason: {order.partialReason}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-left text-xs border border-slate-200 min-w-[700px] border-collapse">
                <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5 whitespace-nowrap w-8">#</th>
                    <th className="py-2 px-2.5 min-w-[200px]">Product Description</th>
                    <th className="py-2 px-2 text-center whitespace-nowrap min-w-[100px]">Packaging</th>
                    <th className="py-2 px-2 text-center whitespace-nowrap min-w-[65px]">Ordered</th>
                    <th className="py-2 px-2 text-center whitespace-nowrap min-w-[95px]">
                      {activeTab === 'dispatched' ? 'Dispatched Qty' : 'Pending Qty'}
                    </th>
                    <th className="py-2 px-2.5 text-right whitespace-nowrap min-w-[110px]">Rate (₹ Inc. GST)</th>
                    <th className="py-2 px-2.5 text-right whitespace-nowrap min-w-[110px]">Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {displayItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                        {activeTab === 'dispatched' ? 'No items dispatched yet.' : 'No pending balance for this order (100% fulfilled).'}
                      </td>
                    </tr>
                  ) : (
                    displayItems.map((item, idx) => {
                      const qty = activeTab === 'dispatched' ? item.dispatchedQty : item.pendingQty;
                      const lineVal = qty * item.manualUnitRate;

                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="py-1.5 px-2.5 text-slate-400 font-mono whitespace-nowrap">{idx + 1}</td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-900 leading-snug">{item.productName}</td>
                          <td className="py-1.5 px-2 text-center text-slate-600 font-mono text-[10px] whitespace-nowrap">
                            {item.unitWeight} {item.weightUnit} {item.unitType}
                          </td>
                          <td className="py-1.5 px-2 text-center text-slate-500 font-mono whitespace-nowrap">{item.orderedQty}</td>
                          <td className="py-1.5 px-2 text-center font-black text-emerald-700 font-mono whitespace-nowrap">
                            {qty} units
                          </td>
                          <td className="py-1.5 px-2.5 text-right text-slate-800 font-mono font-semibold whitespace-nowrap">
                            ₹{Number(item.manualUnitRate).toFixed(2)}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-black text-slate-900 font-mono whitespace-nowrap">
                            {formatCurrency(lineVal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Value Summary Box */}
            <div className="flex justify-between items-center p-2.5 bg-slate-100 rounded-xl mb-3 text-xs">
              <span className="font-bold text-slate-700 uppercase text-[11px]">
                {activeTab === 'dispatched' ? 'Total Dispatched Material Value (Incl. GST):' : 'Total Pending Backorder Value (Incl. GST):'}
              </span>
              <span className="font-mono font-black text-sm text-birlaRed-900">
                {formatCurrency(activeTab === 'dispatched' ? totalDispatchedVal : totalPendingVal)}
              </span>
            </div>

            {/* MANDATORY STATUTORY PAYMENT NOTICE (PENALTY & LEGAL ACTION CLAUSE) */}
            <div className="my-2.5 p-2.5 bg-red-50 border-2 border-red-500 rounded-xl text-left shadow-2xs">
              <div className="flex items-center space-x-1.5 text-red-950 font-black text-[11px] uppercase tracking-wider mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <span>महत्वपूर्ण वैधानिक सूचना / STATUTORY PAYMENT TERMS & PENALTY NOTICE</span>
              </div>
              <p className="text-[10px] font-black text-red-900 leading-snug">
                माल डिलीवरी प्राप्ति के 7 दिनों (1 सप्ताह) के भीतर पूर्ण भुगतान अनिवार्य है। यदि डिलीवरी के 7 दिनों में भुगतान प्राप्त नहीं होता है तो 24% वार्षिक दर से विलंब दंड (Penalty Interest) देय होगा एवं बिना किसी पूर्व सूचना के विधिक कार्यवाही (Legal Action under Commercial & Negotiable Instruments Act) प्रारंभ की जाएगी।
              </p>
              <p className="text-[9px] text-red-700 mt-0.5 font-semibold">
                (Full payment is strictly mandatory within 7 calendar days of delivery receipt. Default beyond 7 days will attract 24% p.a. penal interest and initiate strict statutory legal recovery proceedings).
              </p>
            </div>

            {/* Signatures */}
            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-700 mb-6 text-[11px]">Received Material in Good Condition:</p>
                <div className="w-40 border-b border-slate-400"></div>
                <p className="text-[9px] text-slate-400 mt-1">Consignee Stamp & Date</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="font-bold text-slate-700 mb-1.5 text-[11px]">For UltraTech Cement Ltd. (Unit: Birla White):</p>
                <div className="w-32 h-12 border-2 border-dashed border-birlaRed-800 rounded-lg flex flex-col items-center justify-center text-birlaRed-900 bg-red-50/50">
                  <span className="text-[8px] font-black tracking-widest uppercase">DISPATCH SEAL</span>
                  <span className="text-[9px] font-bold">Suraj (PZ7550)</span>
                  <span className="text-[7px] opacity-75">Territory Sales Officer</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">Authorized Logistics Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
