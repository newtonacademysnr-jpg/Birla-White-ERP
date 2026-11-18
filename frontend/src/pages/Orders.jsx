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
  MinusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api';
import { exportOrdersToExcel } from '../utils/excelExporter';
import DualReceiptModal from '../components/DualReceiptModal';
import PartialDispatchModal from '../components/PartialDispatchModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import DispatchChallanModal from '../components/DispatchChallanModal';

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
  const [orderDetailsModal, setOrderDetailsModal] = useState({ isOpen: false, order: null });
  const [challanModal, setChallanModal] = useState({ isOpen: false, order: null, mode: 'dispatched' });
  const [editModal, setEditModal] = useState({ isOpen: false, order: null });
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');
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

  // Live Calculations for Create Modal - 18% GST Inclusive Rule (e.g. 980 * 10 = 9800)
  let liveSubtotal = 0;
  let liveGstTotal = 0;
  let liveGrandTotal = 0;
  orderForm.items.forEach((item) => {
    const prd = products.find((p) => p.id === parseInt(item.productId));
    const rate = parseFloat(item.manualUnitRate) || 0;
    const qty = parseInt(item.orderedQty) || 0;
    const gstRate = prd?.gstRate || 18.0;

    const lineTotal = rate * qty; // Total inclusive of GST
    const lineSub = lineTotal / (1 + gstRate / 100); // Taxable subtotal
    const lineGst = lineTotal - lineSub; // GST component

    liveGrandTotal += lineTotal;
    liveSubtotal += lineSub;
    liveGstTotal += lineGst;
  });

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

  // Edit / Modify Order Handlers
  const handleOpenEdit = (order) => {
    const rawItems = order.items || order.orderItems || [];
    setEditForm({
      stockistId: order.stockistId ? String(order.stockistId) : (order.stockist?.id ? String(order.stockist.id) : ''),
      retailerId: order.retailerId ? String(order.retailerId) : (order.retailer?.id ? String(order.retailer.id) : ''),
      orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
      deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
      deliveryLocation: order.deliveryLocation || '',
      deliveryContactPerson: order.deliveryContactPerson || '',
      deliveryContactMobile: order.deliveryContactMobile || '',
      remarks: order.remarks || '',
      items: rawItems.length > 0 ? rawItems.map((it) => ({
        id: it.id,
        productId: String(it.productId || it.product?.id || ''),
        manualUnitRate: String(it.manualUnitRate !== undefined ? it.manualUnitRate : (it.unitPrice || '')),
        orderedQty: String(it.orderedQty !== undefined ? it.orderedQty : (it.quantity || '')),
        dispatchedQty: it.dispatchedQty !== undefined ? it.dispatchedQty : (it.dispatchedQuantity !== undefined ? it.dispatchedQuantity : 0)
      })) : [
        { productId: products[0]?.id || '', manualUnitRate: products[0]?.referencePrice || '', orderedQty: '25' }
      ]
    });
    setEditError('');
    setEditModal({ isOpen: true, order });
  };

  const handleEditItemChange = (index, field, value) => {
    if (!editForm) return;
    const updated = [...editForm.items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'productId') {
      const selectedPrd = products.find((p) => p.id === parseInt(value));
      if (selectedPrd && (!updated[index].manualUnitRate || updated[index].manualUnitRate === '')) {
        updated[index].manualUnitRate = String(selectedPrd.referencePrice || '');
      }
    }
    setEditForm({ ...editForm, items: updated });
  };

  const handleAddEditItem = () => {
    if (!editForm) return;
    const firstPrd = products[0];
    setEditForm({
      ...editForm,
      items: [
        ...editForm.items,
        { productId: firstPrd?.id || '', manualUnitRate: firstPrd?.referencePrice || '', orderedQty: '25' }
      ]
    });
  };

  const handleRemoveEditItem = (index) => {
    if (!editForm || editForm.items.length <= 1) return;
    const updated = editForm.items.filter((_, i) => i !== index);
    setEditForm({ ...editForm, items: updated });
  };

  // Live Calculations for Edit Modal - 18% GST Inclusive Rule
  let editSubtotal = 0;
  let editGstTotal = 0;
  let editGrandTotal = 0;
  if (editForm && editForm.items) {
    editForm.items.forEach((item) => {
      const prd = products.find((p) => p.id === parseInt(item.productId));
      const rate = parseFloat(item.manualUnitRate) || 0;
      const qty = parseInt(item.orderedQty) || 0;
      const gstRate = prd?.gstRate || 18.0;

      const lineTotal = rate * qty;
      const lineSub = lineTotal / (1 + gstRate / 100);
      const lineGst = lineTotal - lineSub;

      editGrandTotal += lineTotal;
      editSubtotal += lineSub;
      editGstTotal += lineGst;
    });
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSubmitting(true);
    try {
      if (!editForm.stockistId || !editForm.retailerId) {
        setEditError('Please select both Stockist and Retailer.');
        setSubmitting(false);
        return;
      }
      const invalidItem = editForm.items.find((i) => !i.productId || !i.manualUnitRate || !i.orderedQty);
      if (invalidItem) {
        setEditError('Please ensure all product line items have valid product, agreed unit rate, and quantity.');
        setSubmitting(false);
        return;
      }
      await api.updateOrder(editModal.order.id, editForm);
      setEditModal({ isOpen: false, order: null });
      setEditForm(null);
      await loadOrders();
    } catch (err) {
      setEditError(err.message || 'Failed to update order.');
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

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => exportOrdersToExcel(orders)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            title="Download full Orders & Line Items breakdown in styled Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Orders (.xlsx)</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Sales Order</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#EEDFB8] shadow-card flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by Order #, Retailer, Stockist, Site location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#EEDFB8] rounded-xl focus:ring-2 focus:ring-birlaRed-800/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* State Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-stone-500 font-semibold">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EEDFB8] rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All States</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Fulfillment Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-stone-500 font-semibold">Fulfillment:</span>
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EEDFB8] rounded-xl font-medium focus:outline-none"
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
            <span className="text-stone-500 font-semibold">Retailer:</span>
            <select
              value={retailerFilter}
              onChange={(e) => setRetailerFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EEDFB8] rounded-xl font-medium focus:outline-none max-w-[150px]"
            >
              <option value="All">All Retailers</option>
              {retailers.map((r) => (
                <option key={r.id} value={r.id}>{r.firmName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Container */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EEDFB8] shadow-card overflow-hidden">
        {/* Card Header Banner */}
        <div className="px-4 sm:px-6 py-4 bg-[#FAF6E8] border-b border-[#EEDFB8] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-black text-sm text-birlaRed-950 flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-birlaRed-800" />
              <span>Live Sales Orders & Fulfillment Register</span>
            </h3>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
              Real-time booking status, stockist-retailer mapping, dual drop-shipping invoices, and delivery fulfillment.
            </p>
          </div>
          <span className="text-xs font-bold font-mono text-birlaRed-900 bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-xl">
            {orders.length} Orders Listed
          </span>
        </div>

        {/* Mobile View: High-Touch Order Cards (Visible on screens < md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No orders found matching filters.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setOrderDetailsModal({ isOpen: true, order })}
                      className="font-mono font-black text-sm text-birlaRed-900 hover:underline text-left cursor-pointer"
                    >
                      {order.orderNumber}
                    </button>
                    <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">{order.retailer?.firmName}</div>
                    <div className="text-[10px] text-slate-500 truncate">Via: {order.stockist?.firmName || 'Direct'}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-black text-sm text-slate-900">{formatCurrency(order.grandTotal)}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{formatDate(order.orderDate)}</div>
                  </div>
                </div>

                {order.fulfillmentStatus === 'Partial' && (
                  <div className="flex justify-between items-center bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 text-[10px]">
                    <span className="text-emerald-700 font-bold">Dispatched: {formatCurrency(order.dispatchedAmount)}</span>
                    <span className="text-rose-700 font-bold">Pending: {formatCurrency(order.pendingAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.fulfillmentStatus === 'Full'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : order.fulfillmentStatus === 'Partial'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.deliveryStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {order.deliveryStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(order)}
                      className="px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                      title="Edit & Modify Order"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptModal({ isOpen: true, order })}
                      className="px-2.5 py-1 bg-birlaRed-800 hover:bg-birlaRed-900 text-white text-[10px] font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChallanModal({ isOpen: true, order, mode: 'dispatched' })}
                      className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Challan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchModal({ isOpen: true, order })}
                      className="p-1 text-slate-600 hover:text-amber-600 bg-slate-100 rounded-lg"
                      title="Dispatch"
                    >
                      <Truck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ isOpen: true, order })}
                      className="p-1 text-slate-500 hover:text-rose-600 bg-slate-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet View: Full Table (Hidden on screens < md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1250px] border-collapse">
            <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Order # & Date</th>
                <th className="py-3.5 px-4 min-w-[240px]">Stockist & Retailer Mapping</th>
                <th className="py-3.5 px-4 min-w-[230px]">Delivery Site & Contact</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[130px]">Grand Total (₹)</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[90px]">State</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[110px]">Fulfillment</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[120px]">Delivery Date</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[170px]">Dual Receipts</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[110px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEDFB8]/70 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400 font-medium">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400 font-medium">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF6E8]/70 transition-colors">
                    {/* Order No & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onClick={() => setOrderDetailsModal({ isOpen: true, order })}
                        className="font-mono font-black text-sm text-birlaRed-950 block hover:text-amber-700 hover:underline text-left cursor-pointer transition-colors whitespace-nowrap"
                        title="Click to view full Order Details"
                      >
                        {order.orderNumber}
                      </button>
                      <div className="text-[11px] text-stone-500 flex items-center space-x-1 mt-0.5 whitespace-nowrap font-mono">
                        <Calendar className="w-3 h-3 text-stone-400 flex-shrink-0" />
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 block mt-0.5 whitespace-nowrap">
                        By: {order.createdBy || 'Suraj (PZ7550)'}
                      </div>
                    </td>

                    {/* Stockist & Retailer Mapping */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => setOrderDetailsModal({ isOpen: true, order })}
                          className="flex items-start space-x-1.5 text-stone-900 hover:text-birlaRed-800 text-left cursor-pointer group"
                          title="Click to view full Order Details"
                        >
                          <Store className="w-3.5 h-3.5 text-birla-blue flex-shrink-0 mt-0.5" />
                          <span className="font-bold text-xs group-hover:underline leading-snug">{order.retailer?.firmName}</span>
                        </button>
                        <div className="flex items-center space-x-1 text-stone-500 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                          <span className="truncate">Via: {order.stockist?.firmName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Delivery Site */}
                    <td className="py-3.5 px-4 text-stone-600 align-middle max-w-[240px]">
                      <p className="font-medium text-stone-900 text-xs leading-snug truncate" title={order.deliveryLocation}>
                        {order.deliveryLocation}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 whitespace-nowrap">
                        {order.deliveryContactPerson} • {order.deliveryContactMobile}
                      </p>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle font-mono">
                      <span className="font-mono font-black text-sm text-stone-900 block whitespace-nowrap">
                        {formatCurrency(order.grandTotal)}
                      </span>
                      {order.fulfillmentStatus === 'Partial' && (
                        <div className="text-[10px] space-y-0.5 mt-0.5 whitespace-nowrap font-mono">
                          <span className="text-emerald-700 block font-semibold">Disp: {formatCurrency(order.dispatchedAmount)}</span>
                          <span className="text-rose-600 block font-semibold">Pend: {formatCurrency(order.pendingAmount)}</span>
                        </div>
                      )}
                    </td>

                    {/* State: Active / Inactive */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                          order.state === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {order.state}
                      </span>
                    </td>

                    {/* Fulfillment Status: Full / Partial / Out of Stock */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                          order.fulfillmentStatus === 'Full'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.fulfillmentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : order.fulfillmentStatus === 'Out of Stock'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>

                    {/* Delivery Date & Mark Delivered */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-[11px] font-medium text-stone-700 whitespace-nowrap font-mono">
                          {formatDate(order.deliveryDate)}
                        </span>
                        {order.deliveryStatus !== 'Delivered' ? (
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-birla-blue text-[10px] font-bold rounded border border-blue-200 transition-all whitespace-nowrap cursor-pointer"
                            title="Click to Mark Delivered"
                          >
                            Mark Delivered
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-0.5 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Delivered</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dual-Receipt & Challan Triggers */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <div className="flex items-center justify-center space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setReceiptModal({ isOpen: true, order })}
                          className="px-2.5 py-1.5 bg-birlaRed-800 hover:bg-birlaRed-900 text-white text-[11px] font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap active:scale-95"
                          title="View Tax Invoice & Official Receipt"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setChallanModal({ isOpen: true, order, mode: 'dispatched' })}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap active:scale-95"
                          title="View Delivery Challan / Pending Slip"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-300" />
                          <span>Challan</span>
                        </button>
                      </div>
                    </td>

                    {/* Actions: Dispatch, Edit, Delete */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <div className="flex items-center justify-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(order)}
                          className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit & Modify Order"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDispatchModal({ isOpen: true, order })}
                          className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Fulfill / Partial Dispatch Engine"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, order })}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

            <form onSubmit={handleCreateOrder} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
              {orderError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* 1. Parties Mapping */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Order Date * (Manual/Custom)
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
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                  Site Delivery Details:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location of Delivery *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cinema Chowk, Sundernagar"
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
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Product Line Items & Rates:
                    </label>
                    <span className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      {orderForm.items.length} Product{orderForm.items.length > 1 ? 's' : ''} Added
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Product Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs min-w-[720px] border-collapse">
                    <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 min-w-[220px]">Product Description</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[90px]">Catalogue Base</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[130px]">Rate (Inc. 18% GST ₹) *</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[85px]">Quantity *</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[65px]">GST %</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[130px]">Line Total (₹)</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {orderForm.items.map((item, index) => {
                        const selectedPrd = products.find((p) => p.id === parseInt(item.productId));
                        const rate = parseFloat(item.manualUnitRate) || 0;
                        const qty = parseInt(item.orderedQty) || 0;
                        const gstRate = selectedPrd?.gstRate || 18.0;
                        // Rate is INCLUSIVE of GST (e.g. 980 * 10 = 9800)
                        const lineTotal = rate * qty;
                        const lineSub = lineTotal / (1 + gstRate / 100);
                        const lineGst = lineTotal - lineSub;

                        return (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <select
                                required
                                value={item.productId}
                                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                              >
                                <option value="">-- Select Product --</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.unitType} - {p.unitWeight}{p.weightUnit})
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono whitespace-nowrap">
                              {selectedPrd ? `₹${selectedPrd.referencePrice?.toFixed(2)}` : '-'}
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                required
                                placeholder="Inc. GST Rate"
                                value={item.manualUnitRate}
                                onChange={(e) => handleItemChange(index, 'manualUnitRate', e.target.value)}
                                className="w-full max-w-[120px] px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <input
                                type="number"
                                min="1"
                                required
                                placeholder="Qty"
                                value={item.orderedQty}
                                onChange={(e) => handleItemChange(index, 'orderedQty', e.target.value)}
                                className="w-full max-w-[80px] px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-center font-medium text-slate-600 whitespace-nowrap">
                              {gstRate}%
                            </td>

                            <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono whitespace-nowrap">
                              {formatCurrency(lineTotal)}
                            </td>

                            <td className="py-2.5 px-2 text-center">
                              {orderForm.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
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

                {/* Second Prominent Button for Multiple Products */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>+ Add Another Product Item (Multiple Products)</span>
                  </button>
                  <span className="text-[11px] text-slate-500 font-medium italic">
                    Click to add multiple Birla White products to this single order booking.
                  </span>
                </div>
              </div>

              {/* Order Total Bar */}
              <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span>Taxable Subtotal: <strong className="text-slate-900">{formatCurrency(liveSubtotal)}</strong></span> •{' '}
                  <span>GST (18%): <strong className="text-slate-900">{formatCurrency(liveGstTotal)}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Total (Incl. 18% GST):</span>
                  <span className="text-xl font-extrabold text-birlaRed-800 font-mono">{formatCurrency(liveGrandTotal)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-black text-white bg-birlaRed-800 hover:bg-birlaRed-900 border border-amber-400/40 rounded-xl shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 uppercase tracking-wider cursor-pointer active:scale-95"
                >
                  {submitting ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Confirming Order...</span>
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>Confirm Order & Generate Dual Receipts</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / MODIFY ORDER MODAL */}
      {editModal.isOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FFFDF7] rounded-2xl max-w-4xl w-full shadow-2xl border border-[#EEDFB8] overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 bg-[#1A0B0E] text-white flex items-center justify-between border-b border-amber-950/60">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Edit2 className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-display font-black text-sm uppercase tracking-wide text-white">
                      EDIT & MODIFY SALES ORDER
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded text-[11px] font-mono font-bold">
                      {editModal.order?.orderNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    Modify mapped parties, delivery site, products, agreed rates, and quantities.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModal({ isOpen: false, order: null })}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error notification */}
            {editError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* 1. Mapped Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supplying Stockist *
                  </label>
                  <select
                    required
                    value={editForm.stockistId}
                    onChange={(e) => setEditForm({ ...editForm, stockistId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">-- Select Supplying Stockist --</option>
                    {stockists.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firmName} ({s.locality}, {s.tehsil})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Billed Retailer / Dealer *
                  </label>
                  <select
                    required
                    value={editForm.retailerId}
                    onChange={(e) => setEditForm({ ...editForm, retailerId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">-- Select Retailer / Dealer --</option>
                    {retailers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.firmName} ({r.locality}, {r.tehsil})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Order Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Order Date *</label>
                  <input
                    type="date"
                    required
                    value={editForm.orderDate}
                    onChange={(e) => setEditForm({ ...editForm, orderDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={editForm.deliveryDate}
                    onChange={(e) => setEditForm({ ...editForm, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmed Officer</label>
                  <input
                    type="text"
                    disabled
                    value="Suraj (PZ7550) • 8219796922"
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* 3. Site Delivery Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Site Delivery Details:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={editForm.deliveryContactPerson}
                      onChange={(e) => setEditForm({ ...editForm, deliveryContactPerson: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Mobile *</label>
                    <input
                      type="tel"
                      required
                      value={editForm.deliveryContactMobile}
                      onChange={(e) => setEditForm({ ...editForm, deliveryContactMobile: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location of Delivery *</label>
                    <input
                      type="text"
                      required
                      value={editForm.deliveryLocation}
                      onChange={(e) => setEditForm({ ...editForm, deliveryLocation: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Product Line Items with Multiple Products & Manual Rates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Product Line Items & Rates:
                    </label>
                    <span className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      {editForm.items.length} Product{editForm.items.length > 1 ? 's' : ''} in Order
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEditItem}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Product Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs min-w-[720px] border-collapse">
                    <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 min-w-[220px]">Product Description</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[90px]">Catalogue Base</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[130px]">Rate (Inc. 18% GST ₹) *</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[85px]">Quantity *</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[65px]">GST %</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[130px]">Line Total (₹)</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {editForm.items.map((item, index) => {
                        const selectedPrd = products.find((p) => p.id === parseInt(item.productId));
                        const rate = parseFloat(item.manualUnitRate) || 0;
                        const qty = parseInt(item.orderedQty) || 0;
                        const gstRate = selectedPrd?.gstRate || 18.0;
                        const lineTotal = rate * qty;

                        return (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <select
                                required
                                value={item.productId}
                                onChange={(e) => handleEditItemChange(index, 'productId', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                              >
                                <option value="">-- Select Product --</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.unitType} - {p.unitWeight}{p.weightUnit})
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono whitespace-nowrap">
                              {selectedPrd ? `₹${selectedPrd.referencePrice?.toFixed(2)}` : '-'}
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                required
                                placeholder="Inc. GST Rate"
                                value={item.manualUnitRate}
                                onChange={(e) => handleEditItemChange(index, 'manualUnitRate', e.target.value)}
                                className="w-full max-w-[120px] px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <input
                                type="number"
                                min="1"
                                required
                                placeholder="Qty"
                                value={item.orderedQty}
                                onChange={(e) => handleEditItemChange(index, 'orderedQty', e.target.value)}
                                className="w-full max-w-[80px] px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-center font-medium text-slate-600 whitespace-nowrap">
                              {gstRate}%
                            </td>

                            <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono whitespace-nowrap">
                              {formatCurrency(lineTotal)}
                            </td>

                            <td className="py-2.5 px-2 text-center">
                              {editForm.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditItem(index)}
                                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
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

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleAddEditItem}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>+ Add Another Product Item (Multiple Products)</span>
                  </button>
                  <span className="text-[11px] text-slate-500 font-medium italic">
                    You can add, edit, or remove multiple products in this order.
                  </span>
                </div>
              </div>

              {/* Order Total Bar */}
              <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span>Taxable Subtotal: <strong className="text-slate-900">{formatCurrency(editSubtotal)}</strong></span> •{' '}
                  <span>GST (18%): <strong className="text-slate-900">{formatCurrency(editGstTotal)}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Total (Incl. 18% GST):</span>
                  <span className="text-xl font-extrabold text-birlaRed-800 font-mono">{formatCurrency(editGrandTotal)}</span>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Order Modification Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Rate updated per stockist approval or extra items added"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, order: null })}
                  disabled={submitting}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-black text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 uppercase tracking-wider cursor-pointer active:scale-95"
                >
                  {submitting ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Save & Update Order Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {orderDetailsModal.isOpen && orderDetailsModal.order && (
        <OrderDetailsModal
          isOpen={orderDetailsModal.isOpen}
          order={orderDetailsModal.order}
          onClose={() => setOrderDetailsModal({ isOpen: false, order: null })}
          onOpenReceipt={(ord) => setReceiptModal({ isOpen: true, order: ord })}
          onOpenChallan={(ord, mode) => setChallanModal({ isOpen: true, order: ord, mode: mode || 'dispatched' })}
          onEditOrder={(ord) => handleOpenEdit(ord)}
        />
      )}

      {/* DISPATCH CHALLAN & PENDING SLIP MODAL */}
      {challanModal.isOpen && challanModal.order && (
        <DispatchChallanModal
          isOpen={challanModal.isOpen}
          order={challanModal.order}
          initialMode={challanModal.mode}
          onClose={() => setChallanModal({ isOpen: false, order: null, mode: 'dispatched' })}
        />
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
