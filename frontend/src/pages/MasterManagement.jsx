import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { exportMastersToExcel } from '../utils/excelExporter';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function MasterManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'retailers' ? 'retailers' : 'stockists';

  const [stockists, setStockists] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, type: null });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    firmName: '',
    gstNumber: '',
    ownerName: '',
    mobileNumber: '',
    district: 'Mandi',
    tehsil: 'Sundernagar',
    subTehsil: '',
    locality: '',
    pincode: '175002',
    primaryStockistId: '',
    creditLimit: '1500000',
    creditDays: '45',
    status: 'Active'
  });

  useEffect(() => {
    loadData();
  }, [activeTab, search, districtFilter, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (districtFilter !== 'All') params.district = districtFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      if (activeTab === 'stockists') {
        const data = await api.getStockists(params);
        setStockists(data);
      } else {
        const [retData, stkData] = await Promise.all([
          api.getRetailers(params),
          api.getStockists({ status: 'Active' })
        ]);
        setRetailers(retData);
        setStockists(stkData);
      }
    } catch (e) {
      console.error('Error loading master data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError('');
    setFormData({
      firmName: '',
      gstNumber: '',
      ownerName: '',
      mobileNumber: '',
      district: 'Mandi',
      tehsil: activeTab === 'stockists' ? 'Sundernagar' : 'Balh',
      subTehsil: '',
      locality: '',
      pincode: activeTab === 'stockists' ? '175002' : '175008',
      primaryStockistId: stockists[0]?.id || '',
      creditLimit: activeTab === 'stockists' ? '2500000' : '500000',
      creditDays: activeTab === 'stockists' ? '45' : '30',
      status: 'Active'
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormError('');
    setFormData({
      firmName: item.firmName || '',
      gstNumber: item.gstNumber || '',
      ownerName: item.ownerName || '',
      mobileNumber: item.mobileNumber || '',
      district: item.district || 'Mandi',
      tehsil: item.tehsil || '',
      subTehsil: item.subTehsil || '',
      locality: item.locality || '',
      pincode: item.pincode || '',
      primaryStockistId: item.primaryStockistId || '',
      creditLimit: String(item.creditLimit || ''),
      creditDays: String(item.creditDays || ''),
      status: item.status || 'Active'
    });
    setIsFormModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (activeTab === 'stockists') {
        if (editingItem) {
          await api.updateStockist(editingItem.id, formData);
        } else {
          await api.createStockist(formData);
        }
      } else {
        if (editingItem) {
          await api.updateRetailer(editingItem.id, formData);
        } else {
          await api.createRetailer(formData);
        }
      }
      setIsFormModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save master record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    setSubmitting(true);
    try {
      if (deleteModal.type === 'stockist') {
        await api.deleteStockist(deleteModal.item.id);
      } else {
        await api.deleteRetailer(deleteModal.item.id);
      }
      setDeleteModal({ isOpen: false, item: null, type: null });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-birla-crimson" />
            <span>Master Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain independent registries for Stockists (Depots) and Retailers with structured addresses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Separate Tabs for Stockists & Retailers */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setSearchParams({ tab: 'stockists' })}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                activeTab === 'stockists'
                  ? 'bg-white text-birla-crimson shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. Stockists Master</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                {stockists.length}
              </span>
            </button>

            <button
              onClick={() => setSearchParams({ tab: 'retailers' })}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                activeTab === 'retailers'
                  ? 'bg-white text-birla-blue shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>2. Retailers Master</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                {retailers.length}
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportMastersToExcel(stockists, retailers)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              title="Download Stockists & Retailers directory in styled Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Masters (.xlsx)</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New {activeTab === 'stockists' ? 'Stockist' : 'Retailer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'stockists' ? 'Stockist' : 'Retailer'} by Firm, GST, Owner, Tehsil, Locality...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All Districts</option>
              <option value="Mandi">Mandi</option>
              <option value="Kangra">Kangra</option>
              <option value="Shimla">Shimla</option>
              <option value="Solan">Solan</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Firm Name & GSTIN</th>
                <th className="py-3 px-4">Proprietor / Owner</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Structured Address</th>
                {activeTab === 'retailers' && <th className="py-3 px-4">Mapped Stockist</th>}
                <th className="py-3 px-4">Credit Terms</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : (activeTab === 'stockists' ? stockists : retailers).length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No {activeTab === 'stockists' ? 'Stockists' : 'Retailers'} found matching criteria.
                  </td>
                </tr>
              ) : (
                (activeTab === 'stockists' ? stockists : retailers).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Firm Name & GST */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-sm">{item.firmName}</span>
                      <span className="font-mono text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <FileText className="w-3 h-3 text-birla-blue" />
                        <span>GST: {item.gstNumber}</span>
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {item.ownerName}
                    </td>

                    {/* Mobile */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center space-x-1 text-slate-700 font-semibold">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{item.mobileNumber}</span>
                      </span>
                    </td>

                    {/* Structured Address */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <div className="flex items-start space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-birla-crimson flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-slate-900 block">{item.locality}</span>
                          <span className="text-[11px] text-slate-500">
                            Tehsil: {item.tehsil} {item.subTehsil ? `(${item.subTehsil})` : ''}, Distt: {item.district} - {item.pincode}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Mapped Stockist (for Retailer) */}
                    {activeTab === 'retailers' && (
                      <td className="py-3.5 px-4">
                        {item.primaryStockist ? (
                          <div>
                            <span className="font-semibold text-birla-blue block">
                              {item.primaryStockist.firmName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {item.primaryStockist.locality}, {item.primaryStockist.tehsil}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}

                    {/* Credit Terms */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-900">₹{Number(item.creditLimit || 0).toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-500 block">{item.creditDays || 30} Days Limit</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-birla-blue hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              item,
                              type: activeTab === 'stockists' ? 'stockist' : 'retailer'
                            })
                          }
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
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

      {/* Add / Edit Master Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-birla-crimson"></span>
                <h3 className="font-bold text-sm tracking-wide">
                  {editingItem ? 'Edit' : 'Add New'} {activeTab === 'stockists' ? 'Stockist' : 'Retailer'} Record
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Firm & Proprietor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Firm Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mandi Valley Building Materials"
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    GST Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02AAACM4455H1Z3"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Proprietor / Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Sen"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9816012345"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* Structured Address */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 block mb-2 uppercase tracking-wider">
                  Structured Address Details:
                </span>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mandi"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tehsil *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sundernagar / Mandi Sadar"
                      value={formData.tehsil}
                      onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-Tehsil</label>
                    <input
                      type="text"
                      placeholder="e.g. Nihri / Kotli / Baldwara"
                      value={formData.subTehsil}
                      onChange={(e) => setFormData({ ...formData, subTehsil: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Locality / Market Area *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhojpur Bazaar, Near NH-21"
                      value={formData.locality}
                      onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 175002"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Retailer Specific: Primary Stockist Mapping */}
              {activeTab === 'retailers' && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Mapped Stockist (Fulfillment Partner):
                  </label>
                  <select
                    value={formData.primaryStockistId}
                    onChange={(e) => setFormData({ ...formData, primaryStockistId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="">-- No Stockist Assigned --</option>
                    {stockists.map((stk) => (
                      <option key={stk.id} value={stk.id}>
                        {stk.firmName} ({stk.locality}, {stk.tehsil})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Credit Terms & Status */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Days</label>
                  <input
                    type="number"
                    value={formData.creditDays}
                    onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })}
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
                  onClick={() => setIsFormModalOpen(false)}
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
                      <span>Saving Record...</span>
                    </span>
                  ) : (
                    <span>Save {activeTab === 'stockists' ? 'Stockist' : 'Retailer'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title={`Delete ${deleteModal.type === 'stockist' ? 'Stockist' : 'Retailer'}?`}
        message={`Are you sure you want to permanently delete "${deleteModal.item?.firmName}"? If active orders exist for this party, please deactivate it instead.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, type: null })}
        isDeleting={submitting}
      />
    </div>
  );
}
