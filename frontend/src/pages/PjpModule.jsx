import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  User,
  FileText,
  DollarSign,
  AlertCircle,
  Trash2,
  Edit2,
  X,
  Store
} from 'lucide-react';
import { api } from '../api';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function PjpModule() {
  const [visits, setVisits] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [tehsilFilter, setTehsilFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, visit: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    retailerId: '',
    salesOfficer: 'Suraj (PZ7550)',
    visitDate: new Date().toISOString().split('T')[0],
    district: 'Mandi',
    tehsil: 'Sundernagar',
    locality: '',
    status: 'Scheduled', // 'Scheduled', 'Completed', 'Rescheduled', 'Order Booked', 'Payment Collected'
    notes: '',
    orderBookedAmount: '0',
    paymentCollectedAmount: '0'
  });

  useEffect(() => {
    loadVisits();
    loadRetailers();
  }, [statusFilter, tehsilFilter, dateFilter]);

  const loadRetailers = async () => {
    try {
      const data = await api.getRetailers({ status: 'Active' });
      setRetailers(data);
    } catch (e) {
      console.error('Error loading retailers:', e);
    }
  };

  const loadVisits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (tehsilFilter !== 'All') params.tehsil = tehsilFilter;
      if (dateFilter) params.date = dateFilter;

      const data = await api.getPjpVisits(params);
      setVisits(data);
    } catch (e) {
      console.error('Error loading PJP visits:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVisit(null);
    setError('');
    const firstRet = retailers[0];
    setFormData({
      retailerId: firstRet?.id || '',
      salesOfficer: 'Suraj (PZ7550)',
      visitDate: new Date().toISOString().split('T')[0],
      district: firstRet?.district || 'Mandi',
      tehsil: firstRet?.tehsil || 'Sundernagar',
      locality: firstRet?.locality || '',
      status: 'Scheduled',
      notes: '',
      orderBookedAmount: '0',
      paymentCollectedAmount: '0'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVisit(v);
    setError('');
    setFormData({
      retailerId: v.retailerId,
      salesOfficer: v.salesOfficer || 'Suraj (PZ7550)',
      visitDate: new Date(v.visitDate).toISOString().split('T')[0],
      district: v.district,
      tehsil: v.tehsil,
      locality: v.locality,
      status: v.status,
      notes: v.notes || '',
      orderBookedAmount: String(v.orderBookedAmount || 0),
      paymentCollectedAmount: String(v.paymentCollectedAmount || 0)
    });
    setIsModalOpen(true);
  };

  const handleRetailerChange = (retId) => {
    const selectedRet = retailers.find((r) => r.id === parseInt(retId));
    setFormData((prev) => ({
      ...prev,
      retailerId: retId,
      district: selectedRet?.district || prev.district,
      tehsil: selectedRet?.tehsil || prev.tehsil,
      locality: selectedRet?.locality || prev.locality
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!formData.retailerId) {
        setError('Please select a Retailer.');
        setSubmitting(false);
        return;
      }

      if (editingVisit) {
        await api.updatePjpVisit(editingVisit.id, formData);
      } else {
        await api.createPjpVisit(formData);
      }
      setIsModalOpen(false);
      loadVisits();
    } catch (err) {
      setError(err.message || 'Failed to save PJP visit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.visit) return;
    setSubmitting(true);
    try {
      await api.deletePjpVisit(deleteModal.visit.id);
      setDeleteModal({ isOpen: false, visit: null });
      loadVisits();
    } catch (err) {
      alert(err.message || 'Failed to delete PJP visit');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amt) => {
    return '₹ ' + Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarCheck2 className="w-6 h-6 text-birla-crimson" />
            <span>Permanent Journey Plan (PJP) & Beat Module</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Territory field routing for Suraj (PZ7550): Schedule dealer visits by location (Tehsil/Locality), log discussions, orders booked and payments collected.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Dealer Visit</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All Visit Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Order Booked">Order Booked</option>
              <option value="Payment Collected">Payment Collected</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Tehsil:</span>
            <select
              value={tehsilFilter}
              onChange={(e) => setTehsilFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
            >
              <option value="All">All Tehsils</option>
              <option value="Sundernagar">Sundernagar</option>
              <option value="Balh">Balh / Ner Chowk</option>
              <option value="Joginder Nagar">Joginder Nagar</option>
              <option value="Mandi Sadar">Mandi Sadar</option>
              <option value="Sarkaghat">Sarkaghat</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-semibold">Filter by Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* PJP Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Visit Date & Day</th>
                <th className="py-3 px-4">Retailer (Firm & Owner)</th>
                <th className="py-3 px-4">Beat Location (Tehsil/Locality)</th>
                <th className="py-3 px-4">Sales Officer</th>
                <th className="py-3 px-4 text-center">Visit Status</th>
                <th className="py-3 px-4">Discussion Notes / Outcome</th>
                <th className="py-3 px-4 text-right">Order Booked</th>
                <th className="py-3 px-4 text-right">Payment Collected</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading PJP visits...
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No PJP visits scheduled matching criteria.
                  </td>
                </tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{formatDate(v.visitDate)}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(v.visitDate).toDateString() === new Date().toDateString()
                          ? 'Today (Active)'
                          : ''}
                      </span>
                    </td>

                    {/* Retailer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{v.retailer?.firmName}</span>
                      <span className="text-[11px] text-slate-500">
                        {v.retailer?.ownerName} • Mob: {v.retailer?.mobileNumber}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-start space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-birla-crimson flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-900 block">{v.locality}</span>
                          <span className="text-[10px] text-slate-500">Tehsil: {v.tehsil}, {v.district}</span>
                        </div>
                      </div>
                    </td>

                    {/* Officer */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {v.salesOfficer || 'Suraj (PZ7550)'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'Order Booked'
                            ? 'bg-blue-100 text-blue-800'
                            : v.status === 'Payment Collected'
                            ? 'bg-purple-100 text-purple-800'
                            : v.status === 'Scheduled'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs text-slate-700">
                      <p className="line-clamp-2" title={v.notes || ''}>
                        {v.notes || <span className="text-slate-400 italic">No notes logged yet.</span>}
                      </p>
                    </td>

                    {/* Order Booked */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {v.orderBookedAmount > 0 ? (
                        <span className="text-blue-700">{formatCurrency(v.orderBookedAmount)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Payment Collected */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {v.paymentCollectedAmount > 0 ? (
                        <span className="text-emerald-700">{formatCurrency(v.paymentCollectedAmount)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 text-slate-600 hover:text-birla-blue hover:bg-blue-50 rounded-lg transition-colors"
                          title="Update Visit / Mark Done"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, visit: v })}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Visit"
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

      {/* Add / Edit PJP Visit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-birla-crimson"></span>
                <h3 className="font-bold text-sm tracking-wide">
                  {editingVisit ? 'Update / Complete' : 'Schedule New'} PJP Beat Visit
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

              {/* Retailer Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Retailer to Visit *
                </label>
                <select
                  required
                  value={formData.retailerId}
                  onChange={(e) => handleRetailerChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                >
                  <option value="">-- Choose Retailer --</option>
                  {retailers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.firmName} ({r.locality}, {r.tehsil})
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit Date & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Planned / Actual Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Visit Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Order Booked">Order Booked</option>
                    <option value="Payment Collected">Payment Collected</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>
              </div>

              {/* Location details */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tehsil</label>
                  <input
                    type="text"
                    value={formData.tehsil}
                    onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* Discussion Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Visit Discussion Notes / Outcome:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Discussed WallCare Putty secondary sales, checked store display, booked 50 bags..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                />
              </div>

              {/* Order Booked & Payment Collected during visit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order Booked Amount (₹):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.orderBookedAmount}
                    onChange={(e) => setFormData({ ...formData, orderBookedAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Collected (₹):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.paymentCollectedAmount}
                    onChange={(e) => setFormData({ ...formData, paymentCollectedAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-birla-blue focus:outline-none"
                  />
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
                      <span>Saving PJP...</span>
                    </span>
                  ) : (
                    <span>Save Visit Details</span>
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
        title="Delete PJP Visit?"
        message={`Are you sure you want to permanently delete the visit for "${deleteModal.visit?.retailer?.firmName}" scheduled on ${formatDate(deleteModal.visit?.visitDate)}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, visit: null })}
        isDeleting={submitting}
      />
    </div>
  );
}
