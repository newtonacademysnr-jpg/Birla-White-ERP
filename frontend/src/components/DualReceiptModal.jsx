import React, { useState } from 'react';
import { X, Printer, Download, Eye, ShieldCheck, Truck, CheckCircle2, Building2, MapPin, Phone, Award, AlertTriangle, Loader2 } from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';
import { numberToWordsINR } from '../utils/numberToWords';
import { downloadElementAsPdf, printElementIsolated } from '../utils/printHelper';

export default function DualReceiptModal({ isOpen = true, onClose, order }) {
  const [activeTab, setActiveTab] = useState('retailer'); // 'retailer' or 'stockist'
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    printElementIsolated('printable-tax-invoice');
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const fileName = `Birla_White_Tax_Invoice_${order.orderNumber}_${activeTab}.pdf`;
      await downloadElementAsPdf('printable-tax-invoice', fileName);
    } catch (err) {
      console.error('PDF download error:', err);
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

  // 18% GST Inclusive Line Items & Financial Totals
  const rawItems = order.items || order.orderItems || [];
  const items = rawItems.map((it, idx) => {
    const rate = parseFloat(it.manualUnitRate !== undefined ? it.manualUnitRate : (it.unitPrice || 0));
    const qty = parseInt(it.orderedQty !== undefined ? it.orderedQty : (it.quantity || 0));
    const gstRate = parseFloat(it.gstRate || 18.0);

    // Rule: Entered Rate is INCLUSIVE of 18% GST (e.g. 980 * 10 = 9800 Total)
    const lineTotal = it.lineTotal !== undefined ? parseFloat(it.lineTotal) : (rate * qty);
    const lineSubtotal = it.lineSubtotal !== undefined ? parseFloat(it.lineSubtotal) : (lineTotal / (1 + gstRate / 100));
    const lineGst = it.lineGst !== undefined ? parseFloat(it.lineGst) : (lineTotal - lineSubtotal);

    return {
      id: it.id || idx,
      productName: it.productName || it.product?.name || 'Birla White Product',
      unitType: it.unitType || it.product?.unitType || 'Bag',
      unitWeight: it.unitWeight || it.product?.unitWeight || 40,
      weightUnit: it.weightUnit || it.product?.weightUnit || 'Kg',
      orderedQty: qty,
      dispatchedQty: it.dispatchedQty !== undefined ? it.dispatchedQty : (it.dispatchedQuantity !== undefined ? it.dispatchedQuantity : qty),
      pendingQty: it.pendingQty !== undefined ? it.pendingQty : (it.pendingQuantity !== undefined ? it.pendingQuantity : 0),
      manualUnitRate: rate,
      catalogueReferencePrice: it.catalogueReferencePrice || it.cataloguePrice || rate,
      gstRate,
      lineSubtotal,
      lineGst,
      lineTotal
    };
  });

  const computedGrandTotal = items.reduce((s, it) => s + it.lineTotal, 0);
  const grandTotal = order.grandTotal ? parseFloat(order.grandTotal) : computedGrandTotal;
  const computedSubtotal = items.reduce((s, it) => s + it.lineSubtotal, 0);
  const subtotal = order.subtotal ? parseFloat(order.subtotal) : (grandTotal / 1.18);
  const gstTotal = order.gstTotal ? parseFloat(order.gstTotal) : (grandTotal - subtotal);
  const cgstAmount = gstTotal / 2;
  const sgstAmount = gstTotal / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-2xl max-w-4xl w-full shadow-2xl border border-[#EEDFB8] overflow-hidden my-auto max-h-[96vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Top Header / Mode Switcher (Hidden in Print) */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#1A0B0E] text-white flex flex-wrap items-center justify-between gap-3 border-b border-amber-950/60 no-print">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-lg">
              <img src={brandLogo} alt="Birla White" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-xs tracking-wide text-amber-300 uppercase">OFFICIAL TAX INVOICE & RECEIPT</h3>
              <p className="text-[11px] text-stone-300 font-mono">Order #{order.orderNumber} • Mandi Division, HP</p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-[#2D1217] p-1 rounded-xl border border-amber-900/50">
            <button
              onClick={() => setActiveTab('retailer')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition-all ${
                activeTab === 'retailer'
                  ? 'bg-birlaRed-800 text-white shadow-sm ring-1 ring-amber-400/30'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1. Retailer Tax Invoice</span>
              <span className="sm:hidden">1. Retailer</span>
            </button>
            <button
              onClick={() => setActiveTab('stockist')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition-all ${
                activeTab === 'stockist'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2. Stockist Dispatch Copy</span>
              <span className="sm:hidden">2. Stockist</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-75 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Download Genuine PDF Invoice to your device"
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
              title="Print Clean 1-Page Official Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#FAF6E8] print-container">
          <div id="printable-tax-invoice" className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-slate-200 max-w-3xl mx-auto text-slate-800 print:border-none print:shadow-none print:p-0">
            {/* 1. Official Corporate Header */}
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
                    Regd. Office: Ahura Centre, B-Wing, Mahakali Caves Road, Andheri (E), Mumbai 400093<br />
                    CIN: L26940MH2000PLC128420 | GSTIN: <strong>02AAACU1234F1Z0</strong> | State: Himachal Pradesh (02)
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right flex-shrink-0">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mb-1 ${
                    activeTab === 'retailer'
                      ? 'bg-amber-100 text-amber-950 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  }`}
                >
                  {activeTab === 'retailer' ? 'TAX INVOICE & ORDER RECEIPT' : 'STOCKIST DISPATCH ADVISORY'}
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">{order.orderNumber}</p>
                <p className="text-[10px] text-slate-500">Date: {formatDate(order.orderDate)}</p>
                <p className="text-[9px] text-emerald-700 font-bold">Original for Recipient</p>
              </div>
            </div>

            {/* 2. Blind Drop-Shipping Compliance Banner (Retailer Copy Only) */}
            {activeTab === 'retailer' && (
              <div className="mb-3 p-2 bg-amber-50/80 border-l-4 border-birlaRed-800 rounded-r-lg text-[10px] text-amber-950 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-birlaRed-800 flex-shrink-0" />
                  <span>
                    <strong>Blind Drop-Shipping Guarantee:</strong> Direct Factory / Brand Order Confirmation for Retailer. All Stockist details are strictly protected.
                  </span>
                </div>
                <span className="text-[8px] font-extrabold uppercase bg-birlaRed-800 text-white px-1.5 py-0.5 rounded">
                  Direct Brand Billing
                </span>
              </div>
            )}

            {/* 3. Parties Box (Billed To vs Shipped From) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 mb-3 text-xs">
              {/* Buyer / Retailer */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  1. Billed & Shipped To (Retailer / Dealer):
                </span>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{order.retailer?.firmName || 'Retailer Firm'}</h4>
                <p className="text-slate-600 mt-0.5 font-medium text-[11px]">
                  {order.deliveryLocation || order.retailer?.locality || 'Locality'}, {order.retailer?.tehsil || 'Mandi'}, Himachal Pradesh
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  GSTIN: <strong>{order.retailer?.gstNumber || '02AAFPS1122B1Z1'}</strong> | Mobile: {order.retailer?.mobileNumber || '98160XXXXX'}
                </p>
              </div>

              {/* Supplier Depot / Stockist */}
              <div className="sm:border-l sm:border-slate-200 sm:pl-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  2. Supplying Depot / Fulfillment Node:
                </span>
                {activeTab === 'retailer' ? (
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-birlaRed-900">
                      UltraTech Cement Ltd. - Central Depot Mandi
                    </h4>
                    <p className="text-slate-600 mt-0.5 text-[11px]">Direct Factory Logistics Hub, Industrial Area, Sundernagar, HP</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Division HQ: Mandi (HP) | GSTIN: <strong>02AAACU1234F1Z0</strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {order.stockist?.firmName || 'Authorized Stockist Depot'}
                    </h4>
                    <p className="text-slate-600 mt-0.5 text-[11px]">
                      {order.stockist?.locality || 'Stockist Locality'}, {order.stockist?.tehsil || 'Mandi'}, HP
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      GSTIN: <strong>{order.stockist?.gstNumber || '02AABCS9988D1Z2'}</strong> | Ph: {order.stockist?.mobileNumber || '9816012345'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Officer & Logistics Details Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1.5 px-3 bg-slate-100 rounded-lg text-[10px] text-slate-600 mb-3">
              <div>
                <span className="text-slate-400 block text-[8px] uppercase font-bold">Territory Officer:</span>
                <strong className="text-slate-900">Suraj (PZ7550)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[8px] uppercase font-bold">Contact:</span>
                <strong className="text-slate-900">8219796922</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[8px] uppercase font-bold">Fulfillment Mode:</span>
                <strong className="text-emerald-700">{order.fulfillmentStatus || 'Full'} Dispatch</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[8px] uppercase font-bold">Payment Status:</span>
                <strong className={order.balanceDueAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                  {order.balanceDueAmount > 0 ? `₹${Number(order.balanceDueAmount).toLocaleString('en-IN')} Due` : 'Fully Paid'}
                </strong>
              </div>
            </div>

            {/* 5. Line Items Table with GST Inclusive Rate Breakdown */}
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-left text-xs border border-slate-200 min-w-[720px] border-collapse">
                <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5 whitespace-nowrap w-8">#</th>
                    <th className="py-2 px-2.5 min-w-[180px]">Product Description</th>
                    <th className="py-2 px-2 text-center whitespace-nowrap min-w-[70px]">HSN</th>
                    <th className="py-2 px-2 text-center whitespace-nowrap min-w-[90px]">Packaging Size</th>
                    <th className="py-2 px-2 text-center whitespace-nowrap min-w-[50px]">Qty</th>
                    {activeTab === 'stockist' && <th className="py-2 px-2 text-center whitespace-nowrap min-w-[50px] text-emerald-300">Disp</th>}
                    {activeTab === 'stockist' && <th className="py-2 px-2 text-center whitespace-nowrap min-w-[50px] text-rose-300">Pend</th>}
                    <th className="py-2 px-2.5 text-right whitespace-nowrap min-w-[100px]">Rate (₹ Inc. GST)</th>
                    <th className="py-2 px-2.5 text-right whitespace-nowrap min-w-[95px]">Taxable (₹)</th>
                    <th className="py-2 px-1 text-center whitespace-nowrap min-w-[55px]">GST %</th>
                    <th className="py-2 px-2.5 text-right whitespace-nowrap min-w-[105px]">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-1.5 px-2.5 text-slate-400 font-mono whitespace-nowrap">{idx + 1}</td>
                      <td className="py-1.5 px-2.5 font-bold text-slate-900 leading-snug">{item.productName}</td>
                      <td className="py-1.5 px-2 text-center text-slate-500 font-mono text-[10px] whitespace-nowrap">32141000</td>
                      <td className="py-1.5 px-2 text-center text-slate-600 font-medium text-[10px] whitespace-nowrap">
                        {item.unitType} ({item.unitWeight} {item.weightUnit})
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-slate-900 font-mono whitespace-nowrap">{item.orderedQty}</td>
                      {activeTab === 'stockist' && (
                        <td className="py-1.5 px-2 text-center text-emerald-700 font-bold font-mono whitespace-nowrap">{item.dispatchedQty}</td>
                      )}
                      {activeTab === 'stockist' && (
                        <td className="py-1.5 px-2 text-center text-rose-700 font-bold font-mono whitespace-nowrap">{item.pendingQty}</td>
                      )}
                      <td className="py-1.5 px-2.5 text-right font-semibold text-slate-800 font-mono whitespace-nowrap">
                        ₹{Number(item.manualUnitRate).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2.5 text-right text-slate-600 font-mono whitespace-nowrap">
                        {formatCurrency(item.lineSubtotal)}
                      </td>
                      <td className="py-1.5 px-1 text-center text-slate-600 font-mono text-[10px] whitespace-nowrap">
                        {item.gstRate}%
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-black text-slate-900 font-mono whitespace-nowrap">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 6. Amount in Words & Tax Totals Box */}
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div className="flex-1 min-w-[260px] p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[9px] block mb-0.5">Invoice Amount in Words:</span>
                <p className="font-extrabold text-slate-900 italic text-[11px] leading-snug">
                  {numberToWordsINR(grandTotal)}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                  <div>
                    <span>CGST (9%): </span>
                    <strong className="text-slate-900">{formatCurrency(cgstAmount)}</strong>
                  </div>
                  <div>
                    <span>SGST (9%): </span>
                    <strong className="text-slate-900">{formatCurrency(sgstAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* Financial Summary Box */}
              <div className="w-full sm:w-64 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Taxable Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Total GST (18%):</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(gstTotal)}</span>
                </div>
                <div className="border-t-2 border-slate-300 my-0.5 pt-1 flex justify-between font-black text-sm text-birlaRed-900">
                  <span>Grand Total (Incl. GST):</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>

                {order.fulfillmentStatus === 'Partial' && (
                  <div className="mt-1 pt-1 border-t border-dashed border-slate-300 text-[10px] space-y-0.5">
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Dispatched Value:</span>
                      <span>{formatCurrency(order.dispatchedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Pending Backorder:</span>
                      <span>{formatCurrency(order.pendingAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 7. MANDATORY STATUTORY PAYMENT NOTICE (PENALTY & LEGAL ACTION CLAUSE) */}
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

            {/* 8. Signatory Blocks & Circular Corporate Seal */}
            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-700 mb-6 text-[11px]">Customer / Retailer Acknowledgment:</p>
                <div className="w-40 border-b border-slate-400"></div>
                <p className="text-[9px] text-slate-400 mt-1">Authorized Stamp & Signature</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="font-bold text-slate-700 mb-1.5 text-[11px]">For UltraTech Cement Ltd. (Unit: Birla White):</p>
                {/* Visual Seal Stamp */}
                <div className="w-32 h-12 border-2 border-dashed border-birlaRed-800 rounded-lg flex flex-col items-center justify-center text-birlaRed-900 bg-red-50/50">
                  <span className="text-[8px] font-black tracking-widest uppercase">OFFICIAL SEAL</span>
                  <span className="text-[9px] font-bold">Suraj (PZ7550)</span>
                  <span className="text-[7px] opacity-75">Territory Sales Officer</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">Authorized Officer Signature Stamp</p>
              </div>
            </div>

            {/* 9. Terms & Conditions Footer */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 text-[8.5px] text-slate-400 leading-tight text-center">
              1. Goods once sold will not be returned without authorized technical inspection. 2. Storage must be in dry moisture-free conditions.
              3. All legal disputes subject to Mandi (H.P.) jurisdiction only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
