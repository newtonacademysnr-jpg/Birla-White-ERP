import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Scale,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api';
import { exportProductsToExcel } from '../utils/excelExporter';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function ProductCatalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [unitTypeFilter, setUnitTypeFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Wall Putty',
    unitType: 'Bag', // 'Bag', 'Bucket', 'Box', 'PCS', 'Manual'
    manualUnitName: '',
    unitWeight: '40',
    weightUnit: 'Kg', // 'Kg' or 'Ltr'
    referencePrice: '980',
    hsnCode: '32141000',
    gstRate: '18',
    inStockQty: '500',
    status: 'Active'
  });

  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter, unitTypeFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (unitTypeFilter !== 'All') params.unitType = unitTypeFilter;

      const data = await api.getProducts(params);
      setProducts(data);
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setError('');
    setFormData({
      name: '',
      category: 'Wall Putty',
      unitType: 'Bag',
      manualUnitName: '',
      unitWeight: '40',
      weightUnit: 'Kg',
      referencePrice: '980',
      hsnCode: '32141000',
      gstRate: '18',
      inStockQty: '500',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setError('');
    setFormData({
      name: product.name,
      category: product.category,
      unitType: product.unitType,
      manualUnitName: product.manualUnitName || '',
      unitWeight: String(product.unitWeight),
      weightUnit: product.weightUnit || 'Kg',
      referencePrice: String(product.referencePrice),
      hsnCode: product.hsnCode || '32141000',
      gstRate: String(product.gstRate || '18'),
      inStockQty: String(product.inStockQty || '500'),
      status: product.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (formData.unitType === 'Manual' && (!formData.manualUnitName || !formData.manualUnitName.trim())) {
        setError('Please specify custom/manual unit name (e.g., Metric Ton, Drum, Bulk Pouch).');
        setSubmitting(false);
        return;
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return;
    setSubmitting(true);
    try {
      await api.deleteProduct(deleteModal.product.id);
      setDeleteModal({ isOpen: false, product: null });
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amt) => {
    return '₹ ' + Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Package className="w-6 h-6 text-birla-crimson" />
            <span>Product Catalogue & Dynamic Rate Master</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aditya Birla - Unit Birla White product portfolio with Unit Types (Bag, Bucket, Box, PCS, Manual) and baseline pricing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportProductsToExcel(products)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            title="Download product catalogue in styled Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export SKUs (.xlsx)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search product by name, HSN, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Wall Putty">Wall Putty</option>
              <option value="White Cement">White Cement</option>
              <option value="Primers & Paints">Primers & Paints</option>
              <option value="Waterproofing Putty">Waterproofing Putty</option>
              <option value="Waterproofing">Waterproofing</option>
              <option value="Textures">Textures</option>
              <option value="Adhesives & Grouts">Adhesives & Grouts</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="flex-1 sm:flex-initial">
            <select
              value={unitTypeFilter}
              onChange={(e) => setUnitTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All Unit Types</option>
              <option value="Bag">Bag</option>
              <option value="Bucket">Bucket</option>
              <option value="Box">Box</option>
              <option value="PCS">PCS</option>
              <option value="Manual">Manual / Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile View: High-Touch Product Cards (Visible on screens < md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No products found matching criteria.</div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{product.name}</h4>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[10px] bg-blue-50 text-birla-blue font-bold px-1.5 py-0.2 rounded border border-blue-200/50">
                        {product.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">HSN: {product.hsnCode}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      product.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {product.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Packaging:</span>
                    <span className="font-semibold text-slate-800">
                      {product.unitType === 'Manual' ? product.manualUnitName : product.unitType} ({product.unitWeight} {product.weightUnit})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Ref Rate:</span>
                    <span className="font-mono font-bold text-slate-900">₹{Number(product.referencePrice).toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">+ {product.gstRate}% GST</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-600 font-medium">
                    In-Stock: <strong className="text-emerald-700">{product.inStockQty} units</strong>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, product })}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-all flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet View: Full Table (Hidden on screens < md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1050px] border-collapse">
            <thead className="bg-[#1A0B0E] text-amber-100 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 min-w-[220px]">Product Name & Category</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Unit Type & Packaging</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[100px]">Unit Weight</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[130px]">Reference Price</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[80px]">GST Rate</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[90px]">In-Stock</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[85px]">Status</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[95px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEDFB8]/70 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400 font-medium">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400 font-medium">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF6E8]/70 transition-colors">
                    {/* Name & Category */}
                    <td className="py-3.5 px-4 align-middle">
                      <span className="font-bold text-stone-900 block text-xs leading-snug">{product.name}</span>
                      <div className="flex items-center space-x-2 mt-0.5 whitespace-nowrap">
                        <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                          {product.category}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">HSN: {product.hsnCode}</span>
                      </div>
                    </td>

                    {/* Unit Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                      <div className="flex items-center space-x-1.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${
                            product.unitType === 'Bag'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : product.unitType === 'Bucket'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : product.unitType === 'Box'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : product.unitType === 'PCS'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          {product.unitType === 'Manual'
                            ? `Manual (${product.manualUnitName || 'Custom'})`
                            : product.unitType}
                        </span>
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-4 text-center text-stone-700 font-medium whitespace-nowrap align-middle font-mono">
                      {product.unitWeight} {product.weightUnit}
                    </td>

                    {/* Reference Base Price */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle font-mono">
                      <span className="font-black text-xs text-stone-900 block whitespace-nowrap">
                        {formatCurrency(product.referencePrice)}
                      </span>
                      <span className="text-[10px] text-stone-400 block whitespace-nowrap">Base Catalogue Rate</span>
                    </td>

                    {/* GST */}
                    <td className="py-3.5 px-4 text-center font-bold text-stone-700 whitespace-nowrap align-middle">
                      {product.gstRate}%
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 text-center font-bold text-stone-900 whitespace-nowrap align-middle font-mono">
                      {product.inStockQty} units
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                          product.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <div className="flex items-center justify-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-slate-600 hover:text-birla-blue hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, product })}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-birla-crimson"></span>
                <h3 className="font-bold text-sm tracking-wide">
                  {editingProduct ? 'Edit' : 'Add New'} Catalogue Product
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birla White WallCare Putty (40 Kg Bag)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                />
              </div>

              {/* Category & Unit Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="Wall Putty">Wall Putty</option>
                    <option value="White Cement">White Cement</option>
                    <option value="Primers & Paints">Primers & Paints</option>
                    <option value="Waterproofing Putty">Waterproofing Putty</option>
                    <option value="Waterproofing">Waterproofing</option>
                    <option value="Textures">Textures</option>
                    <option value="Adhesives & Grouts">Adhesives & Grouts</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit Type * (Dropdown / Manual)
                  </label>
                  <select
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="Bag">Bag</option>
                    <option value="Bucket">Bucket</option>
                    <option value="Box">Box</option>
                    <option value="PCS">PCS</option>
                    <option value="Manual">Manual / Custom Text Input</option>
                  </select>
                </div>
              </div>

              {/* Manual Custom Unit Name input if Manual is selected */}
              {formData.unitType === 'Manual' && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Specify Custom / Manual Unit Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metric Ton (MT), Road Tanker, Drum, Custom Pack"
                    value={formData.manualUnitName}
                    onChange={(e) => setFormData({ ...formData, manualUnitName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                  <p className="text-[10px] text-blue-700">Enter whatever custom packaging unit is agreed with the customer.</p>
                </div>
              )}

              {/* Unit Weight & Weight Unit (Kg/Ltr) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit Weight / Volume *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 40 or 20"
                    value={formData.unitWeight}
                    onChange={(e) => setFormData({ ...formData, unitWeight: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Measurement Unit * (Kg / Ltr)
                  </label>
                  <select
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Ltr">Litre (Ltr)</option>
                  </select>
                </div>
              </div>

              {/* Reference Unit Price & GST */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Reference Unit Price (₹ Catalogue Base) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 980.00"
                    value={formData.referencePrice}
                    onChange={(e) => setFormData({ ...formData, referencePrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Displayed on order screen as reference before manual rate entry</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    GST Rate (%)
                  </label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="18">18% (Putty/Primers)</option>
                    <option value="28">28% (White Cement)</option>
                    <option value="12">12%</option>
                    <option value="5">5%</option>
                  </select>
                </div>
              </div>

              {/* HSN & Stock & Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    value={formData.inStockQty}
                    onChange={(e) => setFormData({ ...formData, inStockQty: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-birla-crimson hover:bg-birla-darkRed rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Product...</span>
                    </span>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Product from Catalogue?"
        message={`Are you sure you want to permanently delete "${deleteModal.product?.name}"? If past orders have booked this product, please set its status to Inactive instead.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, product: null })}
        isDeleting={submitting}
      />
    </div>
  );
}
