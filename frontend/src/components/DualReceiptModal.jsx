import React, { useState } from 'react';
import { X, Printer, Download, Eye, ShieldCheck, Truck, CheckCircle2, Building2, MapPin, Phone, Award, AlertTriangle } from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';
import { numberToWordsINR } from '../utils/numberToWords';

export default function DualReceiptModal({ isOpen = true, onClose, order }) {
  const [activeTab, setActiveTab] = useState('retailer'); // 'retailer' or 'stockist'

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const el = document.getElementById('printable-tax-invoice');
    if (!el) {
      window.print();
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Birla White Tax Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 960px; margin: 0 auto; background: #fff; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 11px; }
          th { background: #0f172a; color: #fff; font-weight: bold; }
          .header { border-bottom: 2px solid #9e1b22; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; }
          .alert-penalty { background: #fef2f2; border: 2px solid #dc2626; padding: 12px; margin: 16px 0; border-radius: 8px; font-size: 11px; color: #991b1b; }
          .stamp { border: 2px dashed #9e1b22; padding: 8px; width: 140px; text-align: center; color: #9e1b22; border-radius: 6px; }
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Birla_White_Invoice_${order.orderNumber}_${activeTab}.html`;
    link.click();
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

  // Calculated totals & items
  const items = order.items || (order.orderItems || []).map((it) => ({
    id: it.id,
    productName: it.product?.name || 'Birla White Product',
    unitType: it.product?.unitType || 'Bag',
    unitWeight: it.product?.unitWeight || 40,
    weightUnit: it.product?.weightUnit || 'Kg',
    orderedQty: it.quantity,
    dispatchedQty: it.dispatchedQuantity || it.quantity,
    pendingQty: it.pendingQuantity || 0,
    manualUnitRate: it.unitPrice,
    catalogueReferencePrice: it.cataloguePrice || it.unitPrice,
    gstRate: it.gstRate || 18,
    lineTotal: it.totalAmount
  }));

  const subtotal = order.subtotal || items.reduce((s, it) => s + (it.orderedQty * it.manualUnitRate), 0);
  const gstTotal = order.gstTotal || (order.grandTotal - subtotal);
  const cgstAmount = gstTotal / 2;
  const sgstAmount = gstTotal / 2;
  const grandTotal = order.grandTotal || (subtotal + gstTotal);

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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'retailer'
                  ? 'bg-birlaRed-800 text-white shadow-sm ring-1 ring-amber-400/30'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1. Retailer Tax Invoice</span>
            </button>
            <button
              onClick={() => setActiveTab('stockist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'stockist'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>2. Stockist Dispatch Copy</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
              title="Download Invoice as Offline File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-birlaRed-800 hover:bg-birlaRed-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
              title="Print or Save Official PDF"
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
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-[#FAF6E8] print-container">
          <div id="printable-tax-invoice" className="bg-white p-5 sm:p-8 rounded-xl shadow-xs border border-slate-200 max-w-3xl mx-auto text-slate-800 print:border-none print:shadow-none print:p-0">
            {/* 1. Official Corporate Header */}
            <div className="border-b-2 border-birlaRed-800 pb-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="bg-white p-1 rounded border border-slate-200 shadow-2xs">
                  <img
                    src={brandLogo}
                    alt="Aditya Birla UltraTech Birla White"
                    className="h-12 sm:h-14 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-birlaRed-900 leading-tight">
                    UltraTech Cement Ltd. - Unit: Birla White
                  </h1>
                  <p className="text-[11px] text-slate-700 font-bold">
                    Aditya Birla Group • Building Solutions Division
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Regd. Office: Ahura Centre, B-Wing, Mahakali Caves Road, Andheri (E), Mumbai 400093<br />
                    CIN: L26940MH2000PLC128420 | GSTIN: <strong>02AAACU1234F1Z0</strong> | State: Himachal Pradesh (02)
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right flex-shrink-0">
                <span
                  className={`inline-block px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider mb-1 ${
                    activeTab === 'retailer'
                      ? 'bg-amber-100 text-amber-950 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  }`}
                >
                  {activeTab === 'retailer' ? 'TAX INVOICE & ORDER RECEIPT' : 'STOCKIST DISPATCH ADVISORY'}
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">{order.orderNumber}</p>
                <p className="text-[11px] text-slate-500">Date: {formatDate(order.orderDate)}</p>
                <p className="text-[10px] text-emerald-700 font-bold">Original for Recipient</p>
              </div>
            </div>

            {/* 2. Blind Drop-Shipping Compliance Banner (Retailer Copy Only) */}
            {activeTab === 'retailer' && (
              <div className="mb-4 p-2.5 bg-amber-50/80 border-l-4 border-birlaRed-800 rounded-r-lg text-[11px] text-amber-950 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-birlaRed-800 flex-shrink-0" />
                  <span>
                    <strong>Blind Drop-Shipping Guarantee:</strong> Direct Factory / Brand Order Confirmation for Retailer. All Stockist details are strictly protected.
                  </span>
                </div>
                <span className="text-[9px] font-extrabold uppercase bg-birlaRed-800 text-white px-2 py-0.5 rounded">
                  Direct Brand Billing
                </span>
              </div>
            )}

            {/* 3. Parties Box (Billed To vs Shipped From) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 mb-5 text-xs">
              {/* Buyer / Retailer */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  1. Billed & Shipped To (Retailer / Dealer):
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{order.retailer?.firmName || 'Retailer Firm'}</h4>
                <p className="text-slate-600 mt-0.5 font-medium">
                  {order.deliveryLocation || order.retailer?.locality || 'Locality'}, {order.retailer?.tehsil || 'Mandi'}, Himachal Pradesh
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  GSTIN: <strong>{order.retailer?.gstNumber || '02AAFPS1122B1Z1'}</strong> | Mobile: {order.retailer?.mobileNumber || '98160XXXXX'}
                </p>
              </div>

              {/* Supplier Depot / Stockist */}
              <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  2. Supplying Depot / Fulfillment Node:
                </span>
                {activeTab === 'retailer' ? (
                  <div>
                    <h4 className="font-extrabold text-sm text-birlaRed-900">
                      UltraTech Cement Ltd. - Central Depot Mandi
                    </h4>
                    <p className="text-slate-600 mt-0.5">Direct Factory Logistics Hub, Industrial Area, Sundernagar, HP</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Division HQ: Mandi (HP) | GSTIN: <strong>02AAACU1234F1Z0</strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {order.stockist?.firmName || 'Authorized Stockist Depot'}
                    </h4>
                    <p className="text-slate-600 mt-0.5">
                      {order.stockist?.locality || 'Stockist Locality'}, {order.stockist?.tehsil || 'Mandi'}, HP
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      GSTIN: <strong>{order.stockist?.gstNumber || '02AABCS9988D1Z2'}</strong> | Ph: {order.stockist?.mobileNumber || '9816012345'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Officer & Logistics Details Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 px-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 mb-5">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Territory Officer:</span>
                <strong className="text-slate-900">Suraj (PZ7550)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Contact:</span>
                <strong className="text-slate-900">8219796922</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Fulfillment Mode:</span>
                <strong className="text-emerald-700">{order.fulfillmentStatus || 'Full'} Dispatch</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Payment Status:</span>
                <strong className={order.balanceDueAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                  {order.balanceDueAmount > 0 ? `₹${order.balanceDueAmount.toLocaleString()} Due` : 'Fully Paid'}
                </strong>
              </div>
            </div>

            {/* 5. Line Items Table */}
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#1A0B0E] text-amber-100 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-2 text-center">HSN</th>
                    <th className="py-2.5 px-2 text-center">Packaging Size</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    {activeTab === 'stockist' && <th className="py-2.5 px-2 text-center text-emerald-300">Disp</th>}
                    {activeTab === 'stockist' && <th className="py-2.5 px-2 text-center text-rose-300">Pend</th>}
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-2 text-center">GST</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.productName}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px]">32141000</td>
                      <td className="py-2.5 px-2 text-center text-slate-600 font-medium text-[11px]">
                        {item.unitType} ({item.unitWeight} {item.weightUnit})
                      </td>
                      <td className="py-2.5 px-2 text-center font-black text-slate-900">{item.orderedQty}</td>
                      {activeTab === 'stockist' && (
                        <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">{item.dispatchedQty}</td>
                      )}
                      {activeTab === 'stockist' && (
                        <td className="py-2.5 px-2 text-center text-rose-700 font-bold">{item.pendingQty}</td>
                      )}
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                        ₹{Number(item.manualUnitRate).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{item.gstRate}%</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 6. Amount in Words & Tax Totals Box */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
              <div className="flex-1 min-w-[280px] p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Invoice Amount in Words:</span>
                <p className="font-extrabold text-slate-900 italic text-[11px]">
                  {numberToWordsINR(grandTotal)}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                  <div>
                    <span>CGST: </span>
                    <strong className="text-slate-800">{formatCurrency(cgstAmount)}</strong>
                  </div>
                  <div>
                    <span>SGST: </span>
                    <strong className="text-slate-800">{formatCurrency(sgstAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* Financial Summary Box */}
              <div className="w-full sm:w-64 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total GST:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(gstTotal)}</span>
                </div>
                <div className="border-t-2 border-slate-300 my-1 pt-1.5 flex justify-between font-black text-sm text-birlaRed-900">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>

                {order.fulfillmentStatus === 'Partial' && (
                  <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 text-[10px] space-y-0.5">
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
            <div className="my-4 p-3.5 bg-red-50 border-2 border-red-500 rounded-xl text-left shadow-2xs">
              <div className="flex items-center space-x-2 text-red-950 font-black text-xs uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>महत्वपूर्ण वैधानिक सूचना / STATUTORY PAYMENT TERMS & PENALTY NOTICE</span>
              </div>
              <p className="text-[11px] font-black text-red-900 leading-snug">
                माल डिलीवरी (Delivery) प्राप्ति के 7 दिनों (1 सप्ताह) के भीतर पूर्ण भुगतान अनिवार्य है। यदि डिलीवरी के 7 दिनों में भुगतान प्राप्त नहीं होता है तो 24% वार्षिक दर से विलंब दंड (Penalty Interest) देय होगा एवं बिना किसी पूर्व सूचना के विधिक कार्यवाही (Legal Action under Commercial & Negotiable Instruments Act) प्रारंभ की जाएगी।
              </p>
              <p className="text-[10px] text-red-700 mt-1 font-semibold">
                (Full payment is strictly mandatory within 7 calendar days of delivery receipt. Default beyond 7 days will attract 24% p.a. penal interest and initiate strict statutory legal recovery proceedings).
              </p>
            </div>

            {/* 8. Signatory Blocks & Circular Corporate Seal */}
            <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-slate-700 mb-8">Customer / Retailer Acknowledgment:</p>
                <div className="w-44 border-b border-slate-400"></div>
                <p className="text-[10px] text-slate-400 mt-1">Authorized Stamp & Signature</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="font-bold text-slate-700 mb-2">For UltraTech Cement Ltd. (Unit: Birla White):</p>
                {/* Visual Seal Stamp */}
                <div className="w-36 h-14 border-2 border-dashed border-birlaRed-800 rounded-lg flex flex-col items-center justify-center text-birlaRed-900 bg-red-50/50">
                  <span className="text-[9px] font-black tracking-widest uppercase">OFFICIAL SEAL</span>
                  <span className="text-[10px] font-bold">Suraj (PZ7550)</span>
                  <span className="text-[8px] opacity-75">Territory Sales Officer</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Authorized Officer Signature Stamp</p>
              </div>
            </div>

            {/* 9. Terms & Conditions Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-[9px] text-slate-400 leading-relaxed text-center">
              1. Goods once sold will not be returned without authorized technical inspection. 2. Storage must be in dry moisture-free conditions.
              3. All legal disputes subject to Mandi (H.P.) jurisdiction only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
