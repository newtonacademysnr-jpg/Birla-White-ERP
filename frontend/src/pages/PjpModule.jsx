import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Store,
  Layers,
  Save,
  ShieldCheck
} from 'lucide-react';
import { exportPjpToExcel } from '../utils/excelExporter';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const DB_KEY = 'PJP_SURAJ_DB_V1';
const DEFAULT_NAME = 'SURAJ (PZ7550)';
const DEFAULT_EMP_ID = 'PZ7550';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PjpModule() {
  const { requireAuth } = useAuth();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12

  // Officer Profile
  const [profile, setProfile] = useState({ name: DEFAULT_NAME, employeeId: DEFAULT_EMP_ID });

  // PJP Database State
  const [db, setDb] = useState({
    profile: { name: DEFAULT_NAME, employeeId: DEFAULT_EMP_ID },
    visits: {},
    holidays: {},
    counters: {}
  });

  // Modals
  const [fillModal, setFillModal] = useState({ isOpen: false, date: '', place: '', remarks: '' });
  const [holidayModal, setHolidayModal] = useState({ isOpen: false, date: '', reason: '' });
  const [bulkModal, setBulkModal] = useState({ isOpen: false, place: '', remarks: '', selectedDates: [] });
  const [counterModal, setCounterModal] = useState({ isOpen: false, place: '', counter: 0 });

  // Retailer Directory for quick place suggestions
  const [retailers, setRetailers] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Load Database on Mount
  useEffect(() => {
    loadLocalDb();
    loadRetailers();
  }, []);

  const loadRetailers = async () => {
    try {
      const data = await api.getRetailers({ status: 'Active' });
      setRetailers(data || []);
    } catch (e) {
      console.error('Error loading retailers:', e);
    }
  };

  const isGuest = () => {
    try {
      return (
        sessionStorage.getItem('bw_erp_is_guest') === 'true' ||
        localStorage.getItem('bw_erp_is_guest') === 'true'
      );
    } catch {
      return false;
    }
  };

  const getDbKey = () => (isGuest() ? 'PJP_GUEST_DB_V1' : DB_KEY);

  const loadLocalDb = () => {
    try {
      const activeKey = getDbKey();
      const raw = localStorage.getItem(activeKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDb(parsed);
        if (parsed.profile) setProfile(parsed.profile);
      } else if (isGuest()) {
        // Blank PJP sandbox for guest sessions
        const blankDb = {
          profile: { name: 'GUEST / DEMO', employeeId: 'DEMO' },
          visits: {},
          holidays: {},
          counters: {}
        };
        localStorage.setItem(activeKey, JSON.stringify(blankDb));
        setDb(blankDb);
        setProfile(blankDb.profile);
      } else {
        // Pre-seed Himachal Pradesh November 2026 Journey Plan for Suraj
        const seededDb = {
          profile: { name: 'SURAJ (PZ7550)', employeeId: 'PZ7550' },
          visits: {
            '2026-11-03': { place: 'Sundernagar Urban', remarks: 'Sharma Paint & Sanitary, Cinema Chowk beat' },
            '2026-11-04': { place: 'Sundernagar Bhojpur', remarks: 'Mandi Valley Building Materials Depot stock audit' },
            '2026-11-05': { place: 'Balh / Ner Chowk', remarks: 'Himalayan Hardware & Medical College Road' },
            '2026-11-06': { place: 'Mandi Sadar', remarks: 'Beas Traders & Hardware, Indira Market beat' },
            '2026-11-07': { place: 'Mandi Sadar', remarks: 'Old Bus Stand paint retail counters' },
            '2026-11-10': { place: 'Joginder Nagar', remarks: 'Joginder Nagar Paint House, Railway Station Road' },
            '2026-11-11': { place: 'Joginder Nagar Rural', remarks: 'Chauntra & Highway hardware counters' },
            '2026-11-12': { place: 'Pandoh Dam Belt', remarks: 'Hill View Decor & Hardware, site visit' },
            '2026-11-13': { place: 'Sarkaghat', remarks: 'Sarkaghat Building Solutions & Baldwara beat' },
            '2026-11-14': { place: 'Sundernagar', remarks: 'Key dealer review meeting & secondary orders' },
            '2026-11-17': { place: 'Balh / Ner Chowk', remarks: 'Collection follow-up & new retailer mapping' },
            '2026-11-18': { place: 'Mandi Sadar', remarks: 'White Portland Cement bulk order booking' },
            '2026-11-19': { place: 'Joginder Nagar', remarks: 'Dhauladhar Building Store depot visit' },
            '2026-11-20': { place: 'Sundernagar Model Town', remarks: 'Extocare Primer demo & contractor meet' }
          },
          holidays: {
            '2026-11-01': 'Sunday',
            '2026-11-08': 'Sunday',
            '2026-11-15': 'Sunday',
            '2026-11-22': 'Sunday',
            '2026-11-29': 'Sunday',
            '2026-11-16': 'State Holiday'
          },
          counters: {
            '2026-11': {
              'sundernagar urban': 8,
              'sundernagar bhojpur': 6,
              'balh / ner chowk': 7,
              'mandi sadar': 10,
              'joginder nagar': 8,
              'pandoh dam belt': 4,
              'sarkaghat': 5
            }
          }
        };
        localStorage.setItem(activeKey, JSON.stringify(seededDb));
        setDb(seededDb);
      }
    } catch (e) {
      console.error('Error loading PJP db:', e);
    }
  };

  const saveDbToStorage = (updatedDb) => {
    try {
      localStorage.setItem(getDbKey(), JSON.stringify(updatedDb));
      setDb({ ...updatedDb });
    } catch (e) {
      alert('Could not save PJP data (storage error).');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Helper date methods
  const pad = (n) => String(n).padStart(2, '0');
  const formatDateKey = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

  // Monthly Data Calculation
  const monthData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const rows = [];
    const placeCounts = {};
    let workingDays = 0;
    let holidayDays = 0;
    let visitDays = 0;

    const counterKey = `${selectedYear}-${selectedMonth}`;
    const monthCounters = db.counters[counterKey] || {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(selectedYear, selectedMonth - 1, day);
      const dateKey = formatDateKey(selectedYear, selectedMonth, day);
      const dayOfWeek = dt.getDay(); // 0 is Sunday
      const isSunday = dayOfWeek === 0;
      const manualHoliday = db.holidays[dateKey];
      const isHoliday = isSunday || !!manualHoliday;
      const holidayReason = isSunday ? 'Sunday' : (manualHoliday || 'Holiday');

      const visit = db.visits[dateKey] || {};
      const place = isHoliday ? '' : (visit.place || '');
      const remarks = isHoliday ? '' : (visit.remarks || '');

      rows.push({
        date: dateKey,
        day: DAY_NAMES[dayOfWeek],
        dayNumber: day,
        place,
        remarks,
        isHoliday,
        holidayReason
      });

      if (isHoliday) {
        holidayDays++;
      } else {
        workingDays++;
        if (place) {
          visitDays++;
          const normalized = place.trim();
          placeCounts[normalized] = (placeCounts[normalized] || 0) + 1;
        }
      }
    }

    const places = Object.keys(placeCounts)
      .map((place) => ({
        place,
        days: placeCounts[place],
        counter: Number(monthCounters[place.toLowerCase()] || 0)
      }))
      .sort((a, b) => b.days - a.days || a.place.localeCompare(b.place));

    const summary = {
      name: profile.name,
      employeeId: profile.employeeId,
      year: selectedYear,
      month: selectedMonth,
      totalDays: daysInMonth,
      workingDays,
      holidayDays,
      visitDays,
      places
    };

    return {
      name: profile.name,
      employeeId: profile.employeeId,
      year: selectedYear,
      month: selectedMonth,
      days: rows,
      summary
    };
  }, [db, selectedYear, selectedMonth, profile]);

  // Save Single Visit
  const handleSaveVisit = () => {
    requireAuth(() => {
      if (!fillModal.place.trim()) {
        alert('Please enter or select a place of visit.');
        return;
      }
      const updatedDb = { ...db };
      updatedDb.visits[fillModal.date] = {
        place: fillModal.place.trim(),
        remarks: fillModal.remarks.trim()
      };
      delete updatedDb.holidays[fillModal.date];
      saveDbToStorage(updatedDb);
      setFillModal({ isOpen: false, date: '', place: '', remarks: '' });
      showToast('Visit saved successfully!');
    }, 'Admin login required to schedule or modify visits.');
  };

  // Mark Holiday
  const handleMarkHoliday = () => {
    requireAuth(() => {
      const updatedDb = { ...db };
      updatedDb.holidays[holidayModal.date] = holidayModal.reason.trim() || 'Holiday';
      delete updatedDb.visits[holidayModal.date];
      saveDbToStorage(updatedDb);
      setHolidayModal({ isOpen: false, date: '', reason: '' });
      showToast('Marked as Holiday!');
    }, 'Admin login required to modify holiday status.');
  };

  // Unmark Holiday
  const handleUnmarkHoliday = (dateKey) => {
    requireAuth(() => {
      const updatedDb = { ...db };
      delete updatedDb.holidays[dateKey];
      saveDbToStorage(updatedDb);
      showToast('Holiday removed.');
    }, 'Admin login required to remove holiday.');
  };

  // Clear Visit
  const handleClearVisit = (dateKey) => {
    requireAuth(() => {
      const updatedDb = { ...db };
      delete updatedDb.visits[dateKey];
      saveDbToStorage(updatedDb);
      showToast('Visit cleared.');
    }, 'Admin login required to clear visit.');
  };

  // Multi-Date Bulk Visit
  const handleSaveBulkVisit = () => {
    requireAuth(() => {
      if (!bulkModal.place.trim()) {
        alert('Please specify a place of visit.');
        return;
      }
      if (!bulkModal.selectedDates || bulkModal.selectedDates.length === 0) {
        alert('Please select at least one calendar date.');
        return;
      }

      const updatedDb = { ...db };
      bulkModal.selectedDates.forEach((dateKey) => {
        const dt = new Date(dateKey + 'T00:00:00');
        if (dt.getDay() === 0 || updatedDb.holidays[dateKey]) return; // Skip holidays
        updatedDb.visits[dateKey] = {
          place: bulkModal.place.trim(),
          remarks: bulkModal.remarks.trim()
        };
      });
      saveDbToStorage(updatedDb);
      setBulkModal({ isOpen: false, place: '', remarks: '', selectedDates: [] });
      showToast(`${bulkModal.selectedDates.length} visits scheduled in batch!`);
    }, 'Admin login required to schedule bulk visits.');
  };

  // Save Counter for Place
  const handleSaveCounter = () => {
    requireAuth(() => {
      const updatedDb = { ...db };
      const counterKey = `${selectedYear}-${selectedMonth}`;
      updatedDb.counters[counterKey] = updatedDb.counters[counterKey] || {};
      updatedDb.counters[counterKey][counterModal.place.toLowerCase()] = Math.max(0, Number(counterModal.counter || 0));
      saveDbToStorage(updatedDb);
      setCounterModal({ isOpen: false, place: '', counter: 0 });
      showToast('Counter updated successfully!');
    }, 'Admin login required to update retailer counters.');
  };

  // Export to Styled Excel (.xlsx)
  const handleExportXlsx = () => {
    requireAuth(() => {
      try {
        exportPjpToExcel(monthData, selectedYear, selectedMonth);
        showToast('PJP Excel spreadsheet generated successfully!');
      } catch (e) {
        alert('Excel export error: ' + e.message);
      }
    }, 'Admin login required to export PJP Excel report.');
  };

  // Backup JSON
  const handleExportBackup = () => {
    requireAuth(() => {
      const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', jsonStr);
      dlAnchor.setAttribute('download', `PJP_Backup_Suraj_${selectedYear}_${pad(selectedMonth)}.json`);
      dlAnchor.click();
      showToast('PJP backup downloaded!');
    }, 'Admin login required to export PJP backup.');
  };

  // Restore JSON
  const handleRestoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    requireAuth(() => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.visits) {
            saveDbToStorage(parsed);
            showToast('PJP backup restored successfully!');
          } else {
            alert('Invalid PJP backup file.');
          }
        } catch (err) {
          alert('Error parsing JSON backup file.');
        }
      };
      reader.readAsText(file);
    }, 'Admin login required to restore PJP data.');
    e.target.value = '';
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const summary = monthData.summary;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER / EXECUTIVE TOOLBAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Officer & Unit Badge */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-birla-crimson to-birla-darkRed flex items-center justify-center font-black text-white text-sm shadow-sm ring-1 ring-white/10">
            PJP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-white">
                Permanent Journey Plan (PJP)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-birla-gold/20 text-birla-gold border border-birla-gold/30">
                Himachal Pradesh Division
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Officer: <strong className="text-slate-200">{profile.name}</strong> • Headquarter: Mandi • UltraTech Cement Ltd. (Unit Birla White)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={() => setBulkModal({ isOpen: true, place: '', remarks: '', selectedDates: [] })}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all"
            title="Assign multi-date visit route in bulk"
          >
            <Layers className="w-3.5 h-3.5 text-birla-blue" />
            <span>Multi-Date Visit</span>
          </button>

          <button
            onClick={handleExportXlsx}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all ring-1 ring-white/10"
            title="Download Official Styled Excel Report (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700"
            title="Backup PJP Data JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 cursor-pointer"
            title="Restore PJP Data JSON"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json,application/json" onChange={handleRestoreBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* MONTH SELECTOR & PERIOD SUMMARY CARDS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
        {/* Month & Year Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
          >
            {[2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextMonth}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center w-full lg:w-auto">
          <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Calendar</span>
            <span className="text-sm sm:text-base font-black text-slate-900">{summary.totalDays} Days</span>
          </div>

          <div className="px-3 py-1.5 bg-blue-50/70 rounded-xl border border-blue-200/80">
            <span className="text-[10px] uppercase font-bold text-birla-blue block tracking-wider">Working</span>
            <span className="text-sm sm:text-base font-black text-slate-900">{summary.workingDays} Days</span>
          </div>

          <div className="px-3 py-1.5 bg-rose-50/70 rounded-xl border border-rose-200/80">
            <span className="text-[10px] uppercase font-bold text-rose-600 block tracking-wider">Holidays</span>
            <span className="text-sm sm:text-base font-black text-rose-700">{summary.holidayDays} Days</span>
          </div>

          <div className="px-3 py-1.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Planned Visits</span>
            <span className="text-sm sm:text-base font-black text-emerald-700">{summary.visitDays} Days</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: CALENDAR STREAM (LEFT) & PLACE-WISE SUMMARY (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8/12): Day-by-Day Journey Plan Rows */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-birla-blue" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daily Beat Schedule • {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Click on any date to edit or mark holiday</span>
          </div>

          {/* Calendar List */}
          <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
            {monthData.days.map((row) => {
              const isSunday = row.day === 'Sunday';
              return (
                <div
                  key={row.date}
                  className={`p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                    row.isHoliday
                      ? 'bg-rose-50/60 border-l-4 border-rose-600'
                      : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                  }`}
                >
                  {/* Date & Day Badge */}
                  <div className="flex items-center space-x-3 min-w-[130px]">
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs ${
                        row.isHoliday
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="text-sm font-black leading-none">{pad(row.dayNumber)}</span>
                      <span className="text-[9px] uppercase font-bold opacity-80">{row.day.slice(0, 3)}</span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {pad(row.dayNumber)} {MONTH_NAMES[selectedMonth - 1].slice(0, 3)}
                      </span>
                      <span className="text-[10px] text-slate-400">{row.day}</span>
                    </div>
                  </div>

                  {/* Visit Place & Remarks */}
                  <div className="flex-1 min-w-[200px]">
                    {row.isHoliday ? (
                      <div>
                        <span className="inline-flex items-center space-x-1 text-xs font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                          <Sun className="w-3 h-3" />
                          <span>{row.holidayReason || 'Holiday'}</span>
                        </span>
                        <span className="text-[11px] text-rose-500 block mt-0.5">District headquarter off / holiday</span>
                      </div>
                    ) : row.place ? (
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-birla-blue" />
                          <span className="text-xs font-bold text-slate-900">{row.place}</span>
                        </div>
                        {row.remarks && (
                          <p className="text-[11px] text-slate-500 mt-0.5 pl-5">{row.remarks}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No visit scheduled yet</span>
                    )}
                  </div>

                  {/* Row Action Buttons */}
                  <div className="flex items-center space-x-1.5">
                    {row.isHoliday ? (
                      !isSunday && (
                        <button
                          onClick={() => handleUnmarkHoliday(row.date)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all"
                        >
                          Remove Holiday
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            setFillModal({
                              isOpen: true,
                              date: row.date,
                              place: row.place || '',
                              remarks: row.remarks || ''
                            })
                          }
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition-all shadow-xs flex items-center space-x-1"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>{row.place ? 'Edit' : 'Fill Visit'}</span>
                        </button>

                        <button
                          onClick={() => setHolidayModal({ isOpen: true, date: row.date, reason: '' })}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-200 transition-all"
                          title="Mark date as official holiday"
                        >
                          Holiday
                        </button>

                        {row.place && (
                          <button
                            onClick={() => handleClearVisit(row.date)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Clear visit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (4/12): Place-wise Visit Summary & Counter Tracker */}
        <div className="lg:col-span-4 space-y-5">
          {/* Place-wise Table matching PJP-Suraj */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Place-wise Visit Summary
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {summary.places.length} Places
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-slate-200">District HQ / Place</th>
                    <th className="py-2.5 px-2 text-center border-b border-slate-200">Days</th>
                    <th className="py-2.5 px-2 text-center border-b border-slate-200">No of Counter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.places.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                        No visits recorded for this month.
                      </td>
                    </tr>
                  ) : (
                    summary.places.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {item.place}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                          {item.days}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() =>
                              setCounterModal({
                                isOpen: true,
                                place: item.place,
                                counter: item.counter
                              })
                            }
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-birla-blue font-extrabold rounded-md border border-blue-200 text-xs transition-colors"
                            title="Click to edit counter"
                          >
                            {item.counter || 0} ✎
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Total Row */}
                {summary.places.length > 0 && (
                  <tfoot className="bg-slate-200/80 font-bold text-slate-900">
                    <tr>
                      <td className="py-2.5 px-3">TOTAL</td>
                      <td className="py-2.5 px-2 text-center">
                        {summary.places.reduce((sum, p) => sum + p.days, 0)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {summary.places.reduce((sum, p) => sum + (p.counter || 0), 0)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <p className="text-[10px] text-slate-400 mt-2.5">
              Click on the blue counter number to update retailer counters for that beat.
            </p>
          </div>

          {/* Quick Place Beats in Himachal Pradesh */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Active Himachal Pradesh Beats
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Sundernagar Urban',
                'Sundernagar Bhojpur',
                'Mandi Sadar',
                'Balh / Ner Chowk',
                'Joginder Nagar',
                'Chauntra Highway',
                'Pandoh Dam Belt',
                'Sarkaghat'
              ].map((beat, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {beat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: FILL / EDIT SINGLE DAY VISIT */}
      {fillModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Plan Visit for {fillModal.date}
              </h3>
              <button
                onClick={() => setFillModal({ isOpen: false, date: '', place: '', remarks: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Place / Market Beat *</label>
              <input
                type="text"
                value={fillModal.place}
                onChange={(e) => setFillModal({ ...fillModal, place: e.target.value })}
                placeholder="e.g. Sundernagar Cinema Chowk, Mandi Sadar"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
                list="place-suggestions"
              />
              <datalist id="place-suggestions">
                <option value="Sundernagar Urban" />
                <option value="Sundernagar Bhojpur" />
                <option value="Mandi Sadar" />
                <option value="Balh / Ner Chowk" />
                <option value="Joginder Nagar" />
                <option value="Pandoh Dam Belt" />
                <option value="Sarkaghat" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Retailers to Visit</label>
              <textarea
                value={fillModal.remarks}
                onChange={(e) => setFillModal({ ...fillModal, remarks: e.target.value })}
                placeholder="e.g. Sharma Paint Store, order booking, payment collection"
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setFillModal({ isOpen: false, date: '', place: '', remarks: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVisit}
                className="px-4 py-2 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save Visit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MARK HOLIDAY */}
      {holidayModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Mark Holiday for {holidayModal.date}
              </h3>
              <button
                onClick={() => setHolidayModal({ isOpen: false, date: '', reason: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Reason</label>
              <input
                type="text"
                value={holidayModal.reason}
                onChange={(e) => setHolidayModal({ ...holidayModal, reason: e.target.value })}
                placeholder="e.g. Diwali, State Holiday, Gazetted Off"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setHolidayModal({ isOpen: false, date: '', reason: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkHoliday}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Holiday
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MULTI-DATE BULK ASSIGNMENT */}
      {bulkModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Multi-Date Bulk Beat Assignment
                </h3>
                <p className="text-[11px] text-slate-500">
                  Assign repetitive markets to multiple dates in {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
              <button
                onClick={() => setBulkModal({ isOpen: false, place: '', remarks: '', selectedDates: [] })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Place / Market *</label>
              <input
                type="text"
                value={bulkModal.place}
                onChange={(e) => setBulkModal({ ...bulkModal, place: e.target.value })}
                placeholder="e.g. Sundernagar Cinema Chowk"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
                list="place-suggestions"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Remarks</label>
              <input
                type="text"
                value={bulkModal.remarks}
                onChange={(e) => setBulkModal({ ...bulkModal, remarks: e.target.value })}
                placeholder="e.g. Routine retail beat and payment follow-up"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Calendar Dates ({bulkModal.selectedDates.length} selected)
              </label>
              <div className="grid grid-cols-7 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                {monthData.days.map((d) => {
                  const isSelected = bulkModal.selectedDates.includes(d.date);
                  const isDisabled = d.day === 'Sunday' || d.isHoliday;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isSelected) {
                          setBulkModal({
                            ...bulkModal,
                            selectedDates: bulkModal.selectedDates.filter((x) => x !== d.date)
                          });
                        } else {
                          setBulkModal({
                            ...bulkModal,
                            selectedDates: [...bulkModal.selectedDates, d.date]
                          });
                        }
                      }}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        isDisabled
                          ? 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-birla-blue text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <span className="block text-[11px] leading-tight">{pad(d.dayNumber)}</span>
                      <span className="text-[8px] uppercase opacity-75">{d.day.slice(0, 2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setBulkModal({ isOpen: false, place: '', remarks: '', selectedDates: [] })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBulkVisit}
                className="px-4 py-2 bg-birla-crimson hover:bg-birla-darkRed text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save {bulkModal.selectedDates.length} Dates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT COUNTERS */}
      {counterModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Update Counters for {counterModal.place}
              </h3>
              <button
                onClick={() => setCounterModal({ isOpen: false, place: '', counter: 0 })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Number of Counters Active</label>
              <input
                type="number"
                min="0"
                value={counterModal.counter}
                onChange={(e) => setCounterModal({ ...counterModal, counter: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-birla-blue/20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setCounterModal({ isOpen: false, place: '', counter: 0 })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCounter}
                className="px-4 py-2 bg-birla-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save Counter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
