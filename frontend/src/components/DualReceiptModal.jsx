import React, { useState } from 'react';
import { X, Printer, Download, Eye, ShieldCheck, Truck, CheckCircle2, Building2, MapPin, Phone, Award } from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';
import { numberToWordsINR } from '../utils/numberToWords';

export default function DualReceiptModal({ isOpen, onClose, order }) {
  const [activeTab, setActiveTab] = useState('retailer'); // 'retailer' or 'stockist'

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
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

  const retailerReceiptUrl = `/api/orders/${order.id}/receipt/retailer`;
  const stockistReceiptUrl = `/api/orders/${order.id}/receipt/stockist`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Top Header / Mode Switcher (Hidden in Print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-lg">
              <img src={brandLogo} alt="Birla White" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-xs tracking-wide text-white uppercase">DUAL-RECEIPT TAX ENGINE</h3>
              <p className="text-[11px] text-slate-400">Order #{order.orderNumber} • Blind Drop-Shipping Logic</p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('retailer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'retailer'
                  ? 'bg-birla-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1. Retailer Invoice (Hides Stockist)</span>
            </button>
            <button
              onClick={() => setActiveTab('stockist')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'stockist'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>2. Stockist Fulfillment Advisory</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
              title="Print or Save Official PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50 print-container">
          <div className="bg-white p-7 rounded-xl shadow-xs border border-slate-200 max-w-3xl mx-auto text-slate-800 print:border-none print:shadow-none print:p-0">
            {/* 1. Official Corporate Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="bg-white p-1 rounded border border-slate-200 shadow-2xs">
                  <img
                    src={brandLogo}
                    alt="Aditya Birla UltraTech Birla White"
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-base md:text-lg font-black tracking-tight text-slate-900 leading-tight">
                    UltraTech Cement Ltd. - Unit: Birla White
                  </h1>
                  <p className="text-[11px] text-slate-600 font-bold">
                    Aditya Birla Group • Building Solutions Division
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Regd. Office: Ahura Centre, B-Wing, Mahakali Caves Road, Andheri (E), Mumbai 400093<br />
                    CIN: L26940MH2000PLC128420 | GSTIN: <strong>02AAACU1234F1Z0</strong> | State: Himachal Pradesh (02)
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span
                  className={`inline-block px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider mb-1 ${
                    activeTab === 'retailer'
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {activeTab === 'retailer' ? 'TAX INVOICE & ORDER RECEIPT' : 'STOCKIST DISPATCH ADVISORY'}
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">{order.orderNumber}</p>
                <p className="text-[11px] text-slate-500">Date: {formatDate(order.orderDate)}</p>
                <p className="text-[10px] text-emerald-700 font-semibold">Original for Recipient</p>
              </div>
            </div>

            {/* 2. Blind Drop-Shipping Compliance Banner (Retailer Copy Only) */}
            {activeTab === 'retailer' && (
              <div className="mb-4 p-2.5 bg-blue-50/80 border-l-4 border-birla-blue rounded-r-lg text-[11px] text-blue-950 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-birla-blue flex-shrink-0" />
                  <span>
                    <strong>Blind Drop-Shipping Guarantee:</strong> Direct Factory / Brand Order Confirmation for Retailer. All Stockist details are strictly protected and omitted.
                  </span>
                </div>
                <span className="text-[9px] font-extrabold uppercase bg-birla-blue text-white px-2 py-0.5 rounded">
                  Direct Brand Billing
                </span>
              </div>
            )}

            {/* 3. Information Grid (Retailer Billed To vs Authorized Territory Officer / Stockist) */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              {/* Box 1: Billed To Retailer (Shown on BOTH) */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-birla-blue"></span>
                    <span>Billed To (Retailer)</span>
                  </span>
                  <span className="text-[9px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded">
                    Buyer
                  </span>
                </div>
                <p className="font-black text-sm text-slate-900">{order.retailer?.firmName}</p>
                <p className="text-slate-600 mt-0.5"><strong>Proprietor:</strong> {order.retailer?.ownerName || 'Authorized Signatory'}</p>
                <p className="text-slate-600"><strong>GSTIN:</strong> {order.retailer?.gstNumber || 'Unregistered'}</p>
                <p className="text-slate-600"><strong>Mobile:</strong> {order.retailer?.mobileNumber || 'N/A'}</p>
                <p className="text-slate-600 mt-1 leading-tight text-[11px]">
                  <strong>Address:</strong> {order.retailer?.locality}, {order.retailer?.tehsil}, Distt. {order.retailer?.district} - {order.retailer?.pincode} (H.P.)
                </p>
              </div>

              {/* Box 2: Conditional (Retailer Copy: Suraj PZ7550 / Stockist Copy: Fulfilling Stockist) */}
              {activeTab === 'retailer' ? (
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                    <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-birla-crimson"></span>
                      <span>Authorized Territory Officer</span>
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Official
                    </span>
                  </div>
                  <p className="font-black text-sm text-birla-crimson">{order.createdBy || 'Suraj (PZ7550)'}</p>
                  <p className="text-slate-600 mt-0.5"><strong>Designation:</strong> Territory Sales Officer (SO)</p>
                  <p className="text-slate-600"><strong>Mobile:</strong> {order.createdMobile || '8219796922'}</p>
                  <p className="text-slate-600"><strong>Official Email:</strong> {order.createdEmail || 'suraj-v@adityabirla.com'}</p>
                  <p className="text-slate-600 mt-1 leading-tight text-[11px]">
                    <strong>Territory Unit:</strong> {order.createdCompany || 'UltraTech Cement Ltd. - Unit Birla White, Mandi HQ'}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-amber-200">
                    <span className="font-extrabold text-amber-950 uppercase text-[10px] tracking-wider flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      <span>Fulfilling Stockist (Supply Depot)</span>
                    </span>
                    <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                      Distributor
                    </span>
                  </div>
                  <p className="font-black text-sm text-amber-950">{order.stockist?.firmName}</p>
                  <p className="text-slate-700 mt-0.5"><strong>Contact Person:</strong> {order.stockist?.ownerName}</p>
                  <p className="text-slate-700"><strong>GSTIN:</strong> {order.stockist?.gstNumber}</p>
                  <p className="text-slate-700"><strong>Mobile:</strong> {order.stockist?.mobileNumber}</p>
                  <p className="text-slate-700 mt-1 leading-tight text-[11px]">
                    <strong>Depot Address:</strong> {order.stockist?.locality}, {order.stockist?.tehsil}, {order.stockist?.district} - {order.stockist?.pincode}
                  </p>
                </div>
              )}
            </div>

            {/* 4. Delivery Site & Transport Bar */}
            <div className="mb-4 p-3 bg-slate-50 rounded-xl text-[11px] border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-700">Delivery Site / Destination: </span>
                <span className="text-slate-900 font-semibold">{order.deliveryLocation || 'Retailer Main Commercial Outlet'}</span>
                <div className="text-slate-500 mt-0.5">
                  Contact: <strong>{order.deliveryContactPerson || 'Store In-charge'}</strong> • Ph: {order.deliveryContactMobile || order.retailer?.mobileNumber || 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700">Place of Supply: </span>
                <span className="text-slate-900 font-semibold">Himachal Pradesh (02)</span>
                <div className="text-slate-500 mt-0.5">
                  Delivery Due: <strong>{formatDate(order.deliveryDate)}</strong> • Transport: <strong>Road Dedicated</strong>
                </div>
              </div>
            </div>

            {/* 5. Line Items Tax Table */}
            <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Product Description & Packaging</th>
                    <th className="py-2 px-2 text-center">Unit Type</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    {activeTab === 'stockist' && <th className="py-2 px-2 text-center">Dispatched</th>}
                    {activeTab === 'stockist' && <th className="py-2 px-2 text-center">Pending</th>}
                    <th className="py-2 px-3 text-right">Agreed Rate</th>
                    <th className="py-2 px-2 text-center">GST %</th>
                    <th className="py-2 px-3 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {item.productName}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Cat. Baseline Rate: ₹{Number(item.catalogueReferencePrice || 0).toFixed(2)}
                        </div>
                      </td>
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
                    <span>CGST (9%/14%): </span>
                    <strong className="text-slate-800">{formatCurrency(cgstAmount)}</strong>
                  </div>
                  <div>
                    <span>SGST (9%/14%): </span>
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
                  <span>Total GST (CGST+SGST):</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(gstTotal)}</span>
                </div>
                <div className="border-t-2 border-slate-300 my-1 pt-1.5 flex justify-between font-black text-sm text-birla-crimson">
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

            {/* 7. Signatory Blocks & Circular Corporate Seal */}
            <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-slate-700 mb-8">Customer / Retailer Acknowledgment:</p>
                <div className="w-44 border-b border-slate-400"></div>
                <p className="text-[10px] text-slate-400 mt-1">Authorized Stamp & Signature</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="font-bold text-slate-700 mb-2">For UltraTech Cement Ltd. (Unit: Birla White):</p>
                {/* Visual Seal Stamp */}
                <div className="w-36 h-14 border-2 border-dashed border-birla-crimson/50 rounded-lg flex flex-col items-center justify-center text-birla-crimson bg-birla-crimson/5">
                  <span className="text-[9px] font-black tracking-widest uppercase">OFFICIAL SEAL</span>
                  <span className="text-[10px] font-bold">Suraj (PZ7550)</span>
                  <span className="text-[8px] opacity-75">Territory Sales Officer</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Authorized Officer Signature Stamp</p>
              </div>
            </div>

            {/* 8. Terms & Conditions Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-[9px] text-slate-400 leading-relaxed text-center">
              1. Goods once sold will not be returned without authorized technical inspection. 2. Storage must be in dry moisture-free conditions.
              3. Interest @ 18% p.a. applicable on overdue balance past credit period. 4. All legal disputes subject to Mandi (H.P.) jurisdiction only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
