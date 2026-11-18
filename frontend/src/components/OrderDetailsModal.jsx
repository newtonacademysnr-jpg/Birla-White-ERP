import React from 'react';
import { X, Receipt, Truck, CreditCard, ChevronRight, MapPin, Building2, Phone, Calendar, Clock, CheckCircle2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrderDetailsModal({ isOpen = true, onClose, order, onOpenReceipt, onOpenChallan, onOpenPayment, onEditOrder }) {
  const navigate = useNavigate();

  if (!isOpen || !order) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amt) => {
    if (amt === undefined || amt === null) return '₹ 0.00';
    return '₹ ' + Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const items = order.items || (order.orderItems || []).map((it) => ({
    id: it.id,
    productName: it.product?.name || 'Birla White Product',
    unitType: it.product?.unitType || 'Bag',
    unitWeight: it.product?.unitWeight || 40,
    weightUnit: it.product?.weightUnit || 'Kg',
    orderedQty: it.quantity,
    dispatchedQty: it.dispatchedQuantity || it.quantity,
    pendingQty: it.pendingQuantity || 0,
    unitPrice: it.unitPrice,
    gstRate: it.gstRate || 18,
    totalAmount: it.totalAmount
  }));

  const handleNavigateOrders = () => {
    onClose();
    navigate('/orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#EEDFB8] overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-5 py-4 bg-[#1A0B0E] text-white flex items-center justify-between border-b border-amber-950/60">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-[#1A0B0E] px-2 py-0.5 rounded-md font-mono">
                Order Details
              </span>
              <h3 className="font-display font-black text-base text-white">{order.orderNumber}</h3>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Booked on {formatDate(order.orderDate)} • Territory: {order.retailer?.tehsil || 'Mandi Sadar'}, HP
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status Badges Strip */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#EEDFB8]">
            <span className="px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Fulfillment: {order.fulfillmentStatus}
            </span>
            <span className={`px-3 py-1 rounded-full font-bold border ${
              order.deliveryStatus === 'Delivered'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 text-stone-700 border-stone-300'
            }`}>
              Delivery: {order.deliveryStatus || 'Pending'}
            </span>
            <span className={`px-3 py-1 rounded-full font-bold border ${
              order.balanceDueAmount > 0
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              {order.balanceDueAmount > 0 ? `Payment Due: ${formatCurrency(order.balanceDueAmount)}` : 'Payment Settled'}
            </span>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#FAF6E8] rounded-xl border border-[#EEDFB8]">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Retailer / Dealer:</span>
              <p className="font-extrabold text-sm text-stone-900">{order.retailer?.firmName}</p>
              <p className="text-stone-600 mt-0.5">{order.deliveryLocation || order.retailer?.locality}, {order.retailer?.tehsil}</p>
              <p className="text-stone-500 font-mono text-[11px] mt-0.5">GST: {order.retailer?.gstNumber || '02AAFPS1122B1Z1'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Supplying Stockist:</span>
              <p className="font-extrabold text-sm text-stone-900">{order.stockist?.firmName || 'Central Mandi Depot'}</p>
              <p className="text-stone-600 mt-0.5">{order.stockist?.locality || 'Industrial Area'}, Sundernagar</p>
              <p className="text-stone-500 font-mono text-[11px] mt-0.5">GST: {order.stockist?.gstNumber || '02AABCS9988D1Z2'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-[#EEDFB8] overflow-hidden">
            <div className="px-3.5 py-2 bg-[#FAF6E8] border-b border-[#EEDFB8] font-bold text-birlaRed-950">
              Ordered Products & Quantities
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[620px] border-collapse">
                <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 min-w-[200px]">Product Description</th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap min-w-[80px]">Unit</th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap min-w-[70px]">Ordered</th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap min-w-[80px]">Dispatched</th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap min-w-[70px]">Pending</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[90px]">Rate</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[110px]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEDFB8]/70 bg-white">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF6E8]/60">
                      <td className="py-2.5 px-3 font-bold text-stone-900 leading-snug">{it.productName}</td>
                      <td className="py-2.5 px-2 text-center text-stone-600 text-[11px] font-mono whitespace-nowrap">
                        {it.unitWeight} {it.weightUnit}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-stone-900 font-mono whitespace-nowrap">{it.orderedQty}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-700 font-mono whitespace-nowrap">{it.dispatchedQty}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-rose-700 font-mono whitespace-nowrap">{it.pendingQty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-700 whitespace-nowrap">₹{it.unitPrice}</td>
                      <td className="py-2.5 px-3 text-right font-black font-mono text-stone-900 whitespace-nowrap">{formatCurrency(it.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals Strip */}
          <div className="p-3.5 bg-[#FAF6E8] rounded-xl border border-[#EEDFB8] space-y-1">
            <div className="flex justify-between text-stone-600">
              <span>Taxable Subtotal:</span>
              <span className="font-mono font-bold text-stone-900">{formatCurrency(order.subtotal || order.grandTotal * 0.82)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Total GST:</span>
              <span className="font-mono font-bold text-stone-900">{formatCurrency(order.gstTotal || order.grandTotal * 0.18)}</span>
            </div>
            <div className="border-t border-[#EEDFB8] pt-1.5 flex justify-between font-black text-sm text-birlaRed-950">
              <span>Grand Total:</span>
              <span className="font-mono">{formatCurrency(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 py-3.5 bg-[#FAF6E8] border-t border-[#EEDFB8] flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleNavigateOrders}
            className="text-xs font-bold text-birlaRed-800 hover:text-birlaRed-900 hover:underline flex items-center space-x-1"
          >
            <span>Open in Full Orders Console &rarr;</span>
          </button>

          <div className="flex items-center space-x-2">
            {onEditOrder && (
              <button
                onClick={() => {
                  onClose();
                  onEditOrder(order);
                }}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Order</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                if (onOpenReceipt) onOpenReceipt(order);
              }}
              className="px-3 py-1.5 bg-birlaRed-800 hover:bg-birlaRed-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Tax Receipt</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenChallan) onOpenChallan(order, 'dispatched');
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Dispatch Challan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
