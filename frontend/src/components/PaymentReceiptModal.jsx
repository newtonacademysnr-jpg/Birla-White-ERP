import React, { useState } from 'react';
import { X, Printer, Download, Receipt, CheckCircle2, Building2, MapPin, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import brandLogo from '../assets/birla-ultratech-white.jpg';
import { numberToWordsINR } from '../utils/numberToWords';
import { downloadElementAsPdf, printElementIsolated } from '../utils/printHelper';

export default function PaymentReceiptModal({ isOpen = true, onClose, payment }) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    printElementIsolated('printable-payment-receipt');
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const fileName = `Birla_White_Payment_Receipt_${payment.receiptNumber || 'Receipt'}.pdf`;
      await downloadElementAsPdf('printable-payment-receipt', fileName);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not download PDF directly. Opening print dialog as fallback.');
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
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

  const retailer = payment.retailer || {};
  const amountWords = numberToWordsINR(payment.amountPaid || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF6E8] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#EEDFB8] overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Top Action Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#1A0B0E] text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm tracking-wide text-amber-100 flex items-center gap-1.5">
                <span>OFFICIAL PAYMENT RECEIPT</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  {payment.receiptNumber}
                </span>
              </h3>
              <p className="text-[10px] text-stone-400">
                UltraTech Cement Ltd. • Birla White Finance & Collections
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-75 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Download Genuine PDF Payment Receipt"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-birlaRed-800 hover:bg-birlaRed-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Print Clean 1-Page Official Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#FAF6E8] print-container">
          <div id="printable-payment-receipt" className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-slate-200 max-w-3xl mx-auto text-slate-800 print:border-none print:shadow-none print:p-0">
            {/* 1. Official Corporate Header */}
            <div className="border-b-2 border-birlaRed-800 pb-3 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="bg-white p-1 rounded border border-slate-200 shadow-2xs">
                  <img
                    src={brandLogo}
                    alt="Aditya Birla UltraTech Birla White"
                    className="h-11 sm:h-13 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-birlaRed-900 leading-tight">
                    UltraTech Cement Ltd. - Unit: Birla White
                  </h1>
                  <p className="text-[10px] text-slate-700 font-bold">
                    Aditya Birla Group • Building Solutions Division
                  </p>
                  <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                    Central Logistics Depot, Sundernagar & Mandi Hub, Himachal Pradesh<br />
                    CIN: L26940MH2000PLC128420 | GSTIN: <strong>02AAACU1234F1Z0</strong> | Officer: <strong>Suraj (PZ7550) • 8219796922</strong>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right flex-shrink-0">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mb-1 bg-emerald-100 text-emerald-950 border border-emerald-300">
                  OFFICIAL PAYMENT RECEIPT
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">{payment.receiptNumber}</p>
                <p className="text-[10px] text-slate-500">Date: {formatDate(payment.transactionDate)}</p>
                <p className="text-[9px] text-emerald-700 font-bold">Official E-Acknowledgement</p>
              </div>
            </div>

            {/* 2. Receipt Particulars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 mb-3 text-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Receipt Particulars:
                </span>
                <div className="space-y-1 text-[11px]">
                  <p className="text-slate-700">
                    Receipt No: <strong className="font-mono text-birlaRed-900">{payment.receiptNumber}</strong>
                  </p>
                  <p className="text-slate-700">
                    Payment Date: <strong>{formatDate(payment.transactionDate)}</strong>
                  </p>
                  <p className="text-slate-700">
                    Payment Mode:{' '}
                    <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 text-blue-900 border border-blue-200">
                      {payment.paymentMode}
                    </span>
                  </p>
                  {payment.paymentMode === 'Cheque' && payment.chequeDate ? (
                    <p className="text-amber-800 font-semibold">
                      Cheque Clearing Date: <strong>{formatDate(payment.chequeDate)}</strong>
                    </p>
                  ) : null}
                  <p className="text-slate-600 font-mono text-[10px]">
                    Reference / UTR: <strong>{payment.referenceNo || 'Direct Entry / Auto Verified'}</strong>
                  </p>
                </div>
              </div>

              <div className="sm:border-l sm:border-slate-200 sm:pl-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Order & Officer Account:
                </span>
                <div className="space-y-1 text-[11px]">
                  <p className="text-slate-700">
                    Linked Order: <strong className="font-mono text-slate-900">{payment.order ? payment.order.orderNumber : 'Running Account Ledger'}</strong>
                  </p>
                  <p className="text-slate-700">
                    Collected By: <strong>{payment.recordedBy || 'Suraj (PZ7550)'}</strong>
                  </p>
                  <p className="text-slate-600 text-[10px]">
                    Officer Mobile: <strong>+91 8219796922</strong>
                  </p>
                  <p className="text-slate-600 text-[10px]">
                    Email: <strong>suraj-v@adityabirla.com</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Payer / Retailer Details Box */}
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40 mb-3 text-xs">
              <span className="text-[9px] font-bold text-blue-800 uppercase tracking-wider block mb-0.5">
                Received With Thanks From (Payer):
              </span>
              <h4 className="font-extrabold text-sm text-slate-900">{retailer.firmName || 'Retailer Firm'}</h4>
              <p className="text-slate-700 text-[11px] mt-0.5">
                Proprietor: <strong>{retailer.ownerName || 'N/A'}</strong> | Mobile: <strong>{retailer.mobileNumber || 'N/A'}</strong> | GSTIN: <strong>{retailer.gstNumber || '02AAFPS1122B1Z1'}</strong>
              </p>
              <p className="text-slate-600 text-[10px] mt-0.5">
                Location: {retailer.locality ? `${retailer.locality}, ` : ''}{retailer.tehsil || 'Mandi'}, {retailer.district || 'Mandi'} - {retailer.pincode || '175001'}, Himachal Pradesh
              </p>
            </div>

            {/* 4. Highlighted Amount Received Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-white mb-3 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/20 pb-2 mb-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-300 block">
                    Total Amount Received & Cleared
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-0.5">
                    {formatCurrency(payment.amountPaid)}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-200 block">
                    Outstanding Ledger Balance
                  </span>
                  <div className="text-sm font-bold font-mono text-emerald-100">
                    {payment.balanceRemaining !== undefined && payment.balanceRemaining !== null
                      ? formatCurrency(payment.balanceRemaining)
                      : (payment.order ? formatCurrency(payment.order.balanceDueAmount || 0) : 'Current Settled')}
                  </div>
                </div>
              </div>

              <p className="text-xs font-medium text-emerald-100 italic leading-snug">
                In Words: <span className="font-bold underline decoration-emerald-400">{amountWords}</span>
              </p>
            </div>

            {/* 5. Notes / Remarks if any */}
            {payment.notes && (
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 mb-3 text-xs text-slate-700">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Remarks / Transaction Notes:
                </span>
                <p className="mt-0.5">{payment.notes}</p>
              </div>
            )}

            {/* 6. Legal Terms & Verification */}
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 mb-4 text-[9px] text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 mb-0.5">Statutory E-Receipt Terms:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>This is an official computerized receipt generated by UltraTech Cement Ltd. - Unit Birla White.</li>
                <li>Subject to realization of payment in company bank account in case of Cheque / DD instruments.</li>
                <li>For any account reconciliation or statement balance queries, contact Suraj (PZ7550) at 8219796922.</li>
              </ul>
            </div>

            {/* 7. Signatures */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-xs">
              <div>
                <div className="h-10 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center pb-1 text-[10px] text-slate-400 font-mono">
                  [Verified Payer Stamp / Sign]
                </div>
                <p className="font-bold text-[10px] text-slate-800">{retailer.firmName || 'Retailer Representative'}</p>
                <p className="text-[9px] text-slate-400">Payer Signature / Stamp</p>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center pb-1 text-[10px] text-emerald-700 font-mono font-bold">
                  ✓ Digitally Authorized: Suraj (PZ7550)
                </div>
                <p className="font-bold text-[10px] text-birlaRed-950">UltraTech Cement Ltd. - Unit Birla White</p>
                <p className="text-[9px] text-slate-400">Authorized Officer / Commercial Depot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
