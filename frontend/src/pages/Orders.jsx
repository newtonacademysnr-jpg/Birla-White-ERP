import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  Store,
  DollarSign,
  Printer,
  Download,
  X,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { api } from '../api';
import DualReceiptModal from '../components/DualReceiptModal';
import PartialDispatchModal from '../components/PartialDispatchModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function Orders({ openCreateModalProp, onCloseCreateModalProp }) {
  const [orders, setOrders] = useState([]);
  const [stockists, setStockists] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('All');
  const [retailerFilter, setRetailerFilter] = useState('All');
  const [stockistFilter, setStockistFilter] = useState('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, order: null });
  const [dispatchModal, setDispatchModal] = useState({ isOpen: false, order: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, order: null });
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Order Creation Form State
  const [orderForm, setOrderForm] = useState({
    stockistId: '',
    retailerId: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryLocation: '',
    deliveryContactPerson: '',
    deliveryContactMobile: '',
    deliveryDate: '',
    remarks: '',
    createdBy: 'Suraj (PZ7550)',
    createdMobile: '8219796922',
    createdEmail: 'suraj-v@adityabirla.com',
    createdCompany: 'UltraTech Cement Ltd. - Unit Birla White',
    items: [
      { productId: '', manualUnitRate: '', orderedQty: '50' }
    ]
  });

  useEffect(() => {
    loadOrders();
    loadDropdowns();
  }, [search, stateFilter, fulfillmentFilter, retailerFilter, stockistFilter]);

  // Handle external trigger (e.g. from Navbar)
  useEffect(() => {
    if (openCreateModalProp) {
      handleOpenCreate();
    }
  }, [openCreateModalProp]);

  const loadDropdowns = async () => {
    try {
      const [stk, ret, prd] = await Promise.all([
        api.getStockists({ status: 'Active' }),
        api.getRetailers({ status: 'Active' }),
        api.getProducts({ status: 'Active' })
      ]);
      setStockists(stk);
      setRetailers(ret);
      setProducts(prd);
    } catch (e) {
      console.error('Error loading dropdowns:', e);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (stateFilter !== 'All') params.state = stateFilter;
      if (fulfillmentFilter !== 'All') params.fulfillmentStatus = fulfillmentFilter;
      if (retailerFilter !== 'All') params.retailerId = retailerFilter;
      if (stockistFilter !== 'All') params.stockistId = stockistFilter;

      const data = await api.getOrders(params);
      setOrders(data);
    } catch (e) {
      console.error('Error loading orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setOrderError('');
    const firstStockist = stockists[0]?.id || '';
    const firstRetailer = retailers[0]?.id || '';
    const firstProduct = products[0]?.id || '';
    const defaultRefPrice = products[0]?.referencePrice || '';

    setOrderForm({
      stockistId: firstStockist,
      retailerId: firstRetailer,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryLocation: retailers[0] ? `${retailers[0].locality}, ${retailers[0].tehsil}, Distt. ${retailers[0].district}` : '',
      deliveryContactPerson: retailers[0]?.ownerName || '',
      deliveryContactMobile: retailers[0]?.mobileNumber || '',
      deliveryDate: '',
      remarks: '',
      createdBy: 'Suraj (PZ7550)',
      createdMobile: '8219796922',
      createdEmail: 'suraj-v@adityabirla.com',
      createdCompany: 'UltraTech Cement Ltd. - Unit Birla White',
      items: [
        { productId: firstProduct, manualUnitRate: defaultRefPrice, orderedQty: '50' }
      ]
    });
    setIsCreateModalOpen(true);
  };

  // When retailer changes, auto-suggest their primary stockist & delivery address
  const handleRetailerSelect = (retId) => {
    const selectedRet = retailers.find((r) => r.id === parseInt(retId));
    setOrderForm((prev) => ({
      ...prev,
      retailerId: retId,
      stockistId: selectedRet?.primaryStockistId || prev.stockistId || stockists[0]?.id || '',
      deliveryLocation: selectedRet ? `${selectedRet.locality}, ${selectedRet.tehsil}, Distt. ${selectedRet.district} - ${selectedRet.pincode}` : prev.deliveryLocation,
      deliveryContactPerson: selectedRet?.ownerName || prev.deliveryContactPerson,
      deliveryContactMobile: selectedRet?.mobileNumber || prev.deliveryContactMobile
    }));
  };

  // Line item manipulation
  const handleItemChange = (index, field, value) => {
    const updated = [...orderForm.items];
    updated[index][field] = value;

    if (field === 'productId') {
      const prd = products.find((p) => p.id === parseInt(value));
      if (prd) {
        updated[index].manualUnitRate = prd.referencePrice; // Pre-fill with catalogue price
      }
    }
    setOrderForm({ ...orderForm, items: updated });
  };

  const handleAddItem = () => {
    const firstPrd = products[0];
    setOrderForm({
      ...orderForm,
      items: [
        ...orderForm.items,
        { productId: firstPrd?.id || '', manualUnitRate: firstPrd?.referencePrice || '', orderedQty: '25' }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (orderForm.items.length <= 1) return;
    const updated = orderForm.items.filter((_, i) => i !== index);
    setOrderForm({ ...orderForm, items: updated });
  };

  // Live Calculations for Create Modal
  let liveSubtotal = 0;
  let liveGstTotal = 0;
  orderForm.items.forEach((item) => {
    const prd = products.find((p) => p.id === parseInt(item.productId));
    const rate = parseFloat(item.manualUnitRate) || 0;
    const qty = parseInt(item.orderedQty) || 0;
    const gstRate = prd?.gstRate || 18.0;

    const lineSub = rate * qty;
    const lineGst = (lineSub * gstRate) / 100;
    liveSubtotal += lineSub;
    liveGstTotal += lineGst;
  });
  const liveGrandTotal = liveSubtotal + liveGstTotal;

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setOrderError('');
    setSubmitting(true);

    try {
      if (!orderForm.stockistId || !orderForm.retailerId) {
        setOrderError('Please select both Stockist and Retailer.');
        setSubmitting(false);
        return;
      }

      const invalidItem = orderForm.items.find((i) => !i.productId || !i.manualUnitRate || !i.orderedQty);
      if (invalidItem) {
        setOrderError('Please ensure all product line items have valid product, agreed unit rate, and quantity.');
        setSubmitting(false);
        return;
      }

      const newOrder = await api.createOrder(orderForm);
      setIsCreateModalOpen(false);
      if (onCloseCreateModalProp) onCloseCreateModalProp();
      await loadOrders();

      // Automatically open Dual-Receipt Modal upon clicking "Confirm Order" as requested!
      setReceiptModal({ isOpen: true, order: newOrder });
    } catch (err) {
      setOrderError(err.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await api.markOrderDelivered(orderId);
      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to mark delivered');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.order) return;
    setSubmitting(true);
    try {
      await api.deleteOrder(deleteModal.order.id);
      setDeleteModal({ isOpen: false, order: null });
      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to delete order');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-birla-crimson" />
            <span>Order Booking & Dual-Receipt Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign any stockist to fulfill for any retailer, customize agreed unit rates per retailer, and generate blind drop-shipping receipts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Sales Order</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order #, Retailer, Stockist, Site location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* State Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All States</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Fulfillment Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Fulfillment:</span>
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All Fulfillment</option>
              <option value="Pending">Pending</option>
              <option value="Full">Full Dispatch</option>
              <option value="Partial">Partial Dispatch</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Retailer Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Retailer:</span>
            <select
              value={retailerFilter}
              onChange={(e) => setRetailerFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none max-w-[150px]"
            >
              <option value="All">All Retailers</option>
              {retailers.map((r) => (
                <option key={r.id} value={r.id}>{r.firmName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Order No & Date</th>
                <th className="py-3 px-4">Stockist & Retailer Mapping</th>
                <th className="py-3 px-4">Delivery Site & Contact</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-center">State</th>
                <th className="py-3 px-4 text-center">Fulfillment</th>
                <th className="py-3 px-4 text-center">Delivery Date</th>
                <th className="py-3 px-4 text-center">Dual Receipts</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order No & Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 text-sm block">{order.orderNumber}</span>
                      <span className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(order.orderDate)}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        By: {order.createdBy || 'Suraj (PZ7550)'}
                      </span>
                    </td>

                    {/* Stockist & Retailer Mapping */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-slate-900">
                          <Store className="w-3.5 h-3.5 text-birla-blue flex-shrink-0" />
                          <span className="font-bold">{order.retailer?.firmName}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>Fulfill via: {order.stockist?.firmName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Delivery Site */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <p className="font-medium text-slate-900 truncate" title={order.deliveryLocation}>
                        {order.deliveryLocation}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {order.deliveryContactPerson} • {order.deliveryContactMobile}
                      </p>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-black text-sm text-slate-900 block">
                        {formatCurrency(order.grandTotal)}
                      </span>
                      {order.fulfillmentStatus === 'Partial' && (
                        <div className="text-[10px] space-y-0.5 mt-0.5">
                          <span className="text-emerald-700 block">Disp: {formatCurrency(order.dispatchedAmount)}</span>
                          <span className="text-rose-600 block">Pend: {formatCurrency(order.pendingAmount)}</span>
                        </div>
                      )}
                    </td>

                    {/* State: Active / Inactive */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.state === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.state}
                      </span>
                    </td>

                    {/* Fulfillment Status: Full / Partial / Out of Stock */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.fulfillmentStatus === 'Full'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : order.fulfillmentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : order.fulfillmentStatus === 'Out of Stock'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>

                    {/* Delivery Date & Mark Delivered */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-[11px] font-medium text-slate-700">
                          {formatDate(order.deliveryDate)}
                        </span>
                        {order.deliveryStatus !== 'Delivered' ? (
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-birla-blue text-[10px] font-bold rounded border border-blue-200 transition-all"
                            title="Click to Mark Delivered"
                          >
                            Mark Delivered
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Delivered</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dual-Receipt Triggers */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setReceiptModal({ isOpen: true, order })}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-birla-crimson text-white text-[11px] font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 mx-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Dual Receipts</span>
                      </button>
                    </td>

                    {/* Actions: Dispatch, Edit, Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setDispatchModal({ isOpen: true, order })}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Fulfill / Partial Dispatch Engine"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, order })}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE SALES ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-birla-crimson/20 text-birla-gold flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">BOOK SALES ORDER & MAP PARTIES</h3>
                  <p className="text-xs text-slate-400">Stockist-to-Retailer Mapping • Manual Rate Entry • Live GST</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  if (onCloseCreateModalProp) onCloseCreateModalProp();
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 overflow-y-auto flex-1 space-y-5">
              {orderError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* 1. Parties Mapping */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                {/* Select Stockist */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>1. Select Stockist (Fulfillment Hub) *</span>
                  </label>
                  <select
                    required
                    value={orderForm.stockistId}
                    onChange={(e) => setOrderForm({ ...orderForm, stockistId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="">-- Choose Stockist --</option>
                    {stockists.map((stk) => (
                      <option key={stk.id} value={stk.id}>
                        {stk.firmName} ({stk.locality}, {stk.tehsil})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assign Retailer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Store className="w-3.5 h-3.5 text-birla-blue" />
                    <span>2. Assign Retailer (Billed To) *</span>
                  </label>
                  <select
                    required
                    value={orderForm.retailerId}
                    onChange={(e) => handleRetailerSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="">-- Choose Retailer --</option>
                    {retailers.map((ret) => (
                      <option key={ret.id} value={ret.id}>
                        {ret.firmName} ({ret.locality}, {ret.tehsil})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Order Metadata & Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Order Date * (Manual/Custom selectable)
                  </label>
                  <input
                    type="date"
                    required
                    value={orderForm.orderDate}
                    onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Expected Delivery Date:
                  </label>
                  <input
                    type="date"
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmed By (Pre-filled):
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.createdBy}
                    onChange={(e) => setOrderForm({ ...orderForm, createdBy: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none font-semibold text-birla-crimson"
                  />
                </div>
              </div>

              {/* 3. Delivery Location & Site Contact Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                  Site Delivery Details:
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={orderForm.deliveryContactPerson}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryContactPerson: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9816055501"
                      value={orderForm.deliveryContactMobile}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryContactMobile: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location of Delivery (Site Address) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cinema Chowk, Model Town, Sundernagar Site"
                      value={orderForm.deliveryLocation}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryLocation: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Product Line Items with Manual Rate Entry */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Product Line Items & Manual Negotiated Rates:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1 bg-birla-blue text-white text-xs font-bold rounded-lg flex items-center space-x-1 hover:bg-blue-600 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 text-center">Catalogue Base (Ref)</th>
                        <th className="py-2.5 px-3 text-center w-36">Manual Unit Rate (₹) *</th>
                        <th className="py-2.5 px-3 text-center w-28">Quantity *</th>
                        <th className="py-2.5 px-3 text-center">GST %</th>
                        <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {orderForm.items.map((item, index) => {
                        const selectedPrd = products.find((p) => p.id === parseInt(item.productId));
                        const rate = parseFloat(item.manualUnitRate) || 0;
                        const qty = parseInt(item.orderedQty) || 0;
                        const gstRate = selectedPrd?.gstRate || 18.0;
                        const lineSub = rate * qty;
                        const lineGst = (lineSub * gstRate) / 100;
                        const lineTotal = lineSub + lineGst;

                        return (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <select
                                required
                                value={item.productId}
                                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-birla-blue focus:outline-none font-medium"
                              >
                                <option value="">-- Select Product --</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.unitType} - {p.unitWeight}{p.weightUnit})
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                              {selectedPrd ? `₹${selectedPrd.referencePrice?.toFixed(2)}` : '-'}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                required
                                placeholder="Entered rate"
                                value={item.manualUnitRate}
                                onChange={(e) => handleItemChange(index, 'manualUnitRate', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-birla-blue focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                required
                                placeholder="Qty"
                                value={item.orderedQty}
                                onChange={(e) => handleItemChange(index, 'orderedQty', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-birla-blue focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                              {gstRate}%
                            </td>

                            <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                              {formatCurrency(lineTotal)}
                            </td>

                            <td className="py-2.5 px-2 text-center">
                              {orderForm.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                  title="Remove Item"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total Bar */}
              <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span>Subtotal: <strong>{formatCurrency(liveSubtotal)}</strong></span> •{' '}
                  <span>GST: <strong>{formatCurrency(liveGstTotal)}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Grand Total (Incl. GST):</span>
                  <span className="text-xl font-extrabold text-birla-crimson">{formatCurrency(liveGrandTotal)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-black text-white bg-birla-crimson hover:bg-birla-darkRed rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 uppercase tracking-wider"
                >
                  {submitting ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Confirming Order...</span>
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Order & Generate Dual Receipts</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DUAL-RECEIPT MODAL (Retailer vs Stockist) */}
      <DualReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, order: null })}
        order={receiptModal.order}
      />

      {/* PARTIAL DISPATCH FULFILLMENT MODAL */}
      <PartialDispatchModal
        isOpen={dispatchModal.isOpen}
        onClose={() => setDispatchModal({ isOpen: false, order: null })}
        order={dispatchModal.order}
        onDispatchSuccess={() => {
          loadOrders();
        }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Sales Order?"
        message={`Are you sure you want to permanently delete order "${deleteModal.order?.orderNumber}" for ${deleteModal.order?.retailer?.firmName}? All associated dispatch challans and line items will be removed.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, order: null })}
        isDeleting={submitting}
      />
    </div>
  );
}
