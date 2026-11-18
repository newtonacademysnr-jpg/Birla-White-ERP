import React, { useState } from 'react';
import { X, Printer, Download, Eye, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Header / Mode Switcher (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 no-print">
          <div className="flex items-center space-x-3">
            <img src={brandLogo} alt="Birla White" className="h-9 bg-white p-1 rounded-lg object-contain" />
            <div>
              <h3 className="font-bold text-sm tracking-wide text-white">DUAL-RECEIPT GENERATION ENGINE</h3>
              <p className="text-xs text-slate-400">Blind Drop-Shipping Architecture | Order #{order.orderNumber}</p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('retailer')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'retailer'
                  ? 'bg-birla-blue text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1. Retailer Receipt (Hides Stockist)</span>
            </button>
            <button
              onClick={() => setActiveTab('stockist')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'stockist'
                  ? 'bg-amber-600 text-white shadow-md'
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
              onClick={() => {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  window.open(activeTab === 'retailer' ? retailerReceiptUrl : stockistReceiptUrl, '_blank');
                } else {
                  handlePrint();
                }
              }}
              className="px-3 py-1.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
              title="Download or Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
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
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50 print-container">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto text-slate-800">
            {/* Header with Logo */}
            <div className="border-b-2 border-birla-crimson pb-5 mb-6 flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <img src={brandLogo} alt="Aditya Birla UltraTech - Birla White" className="h-14 object-contain bg-white rounded p-1 border border-slate-200" />
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight text-birla-crimson">
                    UltraTech Cement Ltd. - Unit Birla White
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    White Cement Division | Aditya Birla Group
                  </p>
                  <p className="text-[11px] text-slate-400">
                    CIN: L26940MH2000PLC128420 | GSTIN: 02AAACU1234F1Z0
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-1 ${
                    activeTab === 'retailer'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeTab === 'retailer' ? 'RETAILER ORDER RECEIPT' : 'STOCKIST DISPATCH ADVISORY'}
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">{order.orderNumber}</p>
                <p className="text-xs text-slate-500">Date: {formatDate(order.orderDate)}</p>
              </div>
            </div>

            {/* Blind Drop-Shipping Alert on Retailer Copy */}
            {activeTab === 'retailer' && (
              <div className="mb-6 p-3 bg-blue-50 border-l-4 border-birla-blue rounded-r-lg text-xs text-blue-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-birla-blue flex-shrink-0" />
                  <span className="font-medium">
                    <strong>Blind Drop-Shipping Active:</strong> Direct Factory / Brand Order Confirmation for Retailer. All Stockist details are strictly omitted.
                  </span>
                </div>
                <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">DIRECT BRAND INVOICE</span>
              </div>
            )}

            {/* Information Grids */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
              {/* Box 1: Retailer Info (Shown on BOTH) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-birla-blue"></span>
                    <span>Billed To (Retailer)</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                    Buyer
                  </span>
                </div>
                <p className="font-bold text-sm text-slate-950 mb-1">{order.retailer?.firmName}</p>
                <p className="text-slate-600"><strong>Owner:</strong> {order.retailer?.ownerName || 'N/A'}</p>
                <p className="text-slate-600"><strong>GSTIN:</strong> {order.retailer?.gstNumber || 'N/A'}</p>
                <p className="text-slate-600"><strong>Mobile:</strong> {order.retailer?.mobileNumber || 'N/A'}</p>
                <p className="text-slate-600 mt-1">
                  <strong>Address:</strong> {order.retailer?.locality}, {order.retailer?.tehsil}, {order.retailer?.district} - {order.retailer?.pincode}
                </p>
              </div>

              {/* Box 2: Conditional - Either Created By (for Retailer) OR Stockist Fulfiller (for Stockist) */}
              {activeTab === 'retailer' ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-birla-crimson"></span>
                      <span>Confirmed & Booked By</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Authorized
                    </span>
                  </div>
                  <p className="font-bold text-sm text-birla-crimson mb-1">{order.createdBy || 'Suraj (PZ7550)'}</p>
                  <p className="text-slate-600"><strong>Designation:</strong> Territory Sales Officer</p>
                  <p className="text-slate-600"><strong>Mobile:</strong> {order.createdMobile || '8219796922'}</p>
                  <p className="text-slate-600"><strong>Email:</strong> {order.createdEmail || 'suraj-v@adityabirla.com'}</p>
                  <p className="text-slate-600 mt-1">
                    <strong>Division:</strong> {order.createdCompany || 'UltraTech Cement Ltd. - Unit Birla White'}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-950 uppercase text-[11px] tracking-wider flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      <span>Stockist (Fulfillment Hub)</span>
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                      Distributor
                    </span>
                  </div>
                  <p className="font-bold text-sm text-amber-950 mb-1">{order.stockist?.firmName}</p>
                  <p className="text-slate-700"><strong>Owner:</strong> {order.stockist?.ownerName}</p>
                  <p className="text-slate-700"><strong>GSTIN:</strong> {order.stockist?.gstNumber}</p>
                  <p className="text-slate-700"><strong>Mobile:</strong> {order.stockist?.mobileNumber}</p>
                  <p className="text-slate-700 mt-1">
                    <strong>Hub:</strong> {order.stockist?.locality}, {order.stockist?.tehsil}, {order.stockist?.district} - {order.stockist?.pincode}
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Location Bar */}
            <div className="mb-6 p-3 bg-slate-100 rounded-lg text-xs border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-700">Delivery Site / Location: </span>
                <span className="text-slate-900 font-medium">{order.deliveryLocation || 'Customer Warehouse'}</span>
              </div>
              <div className="flex items-center space-x-4 text-slate-600">
                <span><strong>Site Contact:</strong> {order.deliveryContactPerson || 'N/A'}</span>
                <span><strong>Mobile:</strong> {order.deliveryContactMobile || 'N/A'}</span>
                <span><strong>Delivery Status:</strong> {order.deliveryStatus}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3">Unit Type</th>
                    <th className="py-2.5 px-3 text-center">Ordered</th>
                    {activeTab === 'stockist' && <th className="py-2.5 px-3 text-center">Dispatched</th>}
                    {activeTab === 'stockist' && <th className="py-2.5 px-3 text-center">Pending</th>}
                    <th className="py-2.5 px-3 text-right">Agreed Unit Rate</th>
                    <th className="py-2.5 px-3 text-center">GST</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {order.items?.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="py-2.5 px-3 text-slate-500">{index + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.productName}
                        <div className="text-[10px] text-slate-500 font-normal">
                          Cat. Ref Rate: ₹{item.catalogueReferencePrice?.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.unitType} ({item.unitWeight} {item.weightUnit})
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.orderedQty}</td>
                      {activeTab === 'stockist' && (
                        <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold">{item.dispatchedQty || 0}</td>
                      )}
                      {activeTab === 'stockist' && (
                        <td className="py-2.5 px-3 text-center text-rose-700 font-semibold">
                          {item.pendingQty || (item.orderedQty - (item.dispatchedQty || 0))}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">₹{item.manualUnitRate?.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{item.gstRate}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.lineTotal?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-1/2 pr-4 text-[11px] text-slate-500">
                <p className="font-bold text-slate-700 mb-1">Authenticity & Quality Guarantee:</p>
                <p>All products are manufactured under ISO 9001/14001 standards at Birla White UltraTech plants. For support contact helpline: 1800-11-1717 or visit www.birlawhite.com.</p>
              </div>

              <div className="w-1/2 max-w-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Total GST:</span>
                  <span className="font-medium text-slate-900">{formatCurrency(order.gstTotal)}</span>
                </div>
                <div className="border-t border-slate-200 my-1 pt-1.5 flex justify-between font-extrabold text-sm text-birla-crimson">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(order.grandTotal)}</span>
                </div>

                {order.fulfillmentStatus === 'Partial' && (
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-300 text-[11px]">
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Dispatched Value:</span>
                      <span>{formatCurrency(order.dispatchedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-semibold">
                      <span>Pending Balance:</span>
                      <span>{formatCurrency(order.pendingAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Signatures */}
            <div className="border-t border-slate-200 pt-6 mt-6 grid grid-cols-2 text-xs text-slate-600">
              <div>
                <p className="mb-8 font-medium">Customer / Retailer Signature:</p>
                <div className="w-48 border-b border-slate-400"></div>
                <p className="text-[10px] text-slate-400 mt-1">Stamp & Received Signature</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="mb-8 font-medium">For UltraTech Cement Ltd. (Unit: Birla White):</p>
                <div className="w-48 border-b border-slate-400"></div>
                <p className="text-[10px] text-slate-400 mt-1">Authorized Sales Executive: Suraj (PZ7550)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
