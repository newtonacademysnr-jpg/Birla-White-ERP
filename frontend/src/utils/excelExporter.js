import XLSX from 'xlsx-js-style';

/**
 * Common color palette matching Aditya Birla & Birla White corporate branding
 */
const COLORS = {
  NAVY: '17365D',
  BLUE: '0087CF',
  CRIMSON: 'A02225',
  DARK_RED: '7F1D1D',
  LIGHT_BLUE: 'E0F2FE',
  LIGHT_GRAY: 'F8FAFC',
  BORDER_GRAY: 'CBD5E1',
  TEXT_DARK: '0F172A',
  WHITE: 'FFFFFF',
  HOLIDAY_RED: 'D93025',
  SUMMARY_BG: 'EEF2F6',
  TOTAL_BG: 'DCE6F1'
};

const baseCellStyle = (extra = {}) => ({
  font: { name: 'Arial', sz: 9.5, color: { rgb: COLORS.TEXT_DARK } },
  alignment: { vertical: 'center', wrapText: true },
  ...extra
});

const borderStyle = {
  top: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
  bottom: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
  left: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
  right: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } }
};

/**
 * 1. EXPORT SALES ORDERS & ITEM DETAILS TO EXCEL
 */
export function exportOrdersToExcel(orders, filename = 'Birla_White_Sales_Orders') {
  const wb = XLSX.utils.book_new();

  // SHEET 1: All Orders Master Summary
  const wsOrders = {};
  const mergesOrders = [];
  const rowsH = [];

  const setCell = (ws, r, c, v, style, fmt) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    const cell = {
      v: v === undefined || v === null ? '' : v,
      t: typeof v === 'number' ? 'n' : v instanceof Date ? 'd' : 's',
      s: style
    };
    if (fmt) cell.z = fmt;
    ws[ref] = cell;
  };

  // Row 0: Company Header
  const titleStyle = baseCellStyle({
    fill: { fgColor: { rgb: COLORS.NAVY } },
    font: { name: 'Arial', sz: 14, bold: true, color: { rgb: COLORS.WHITE } },
    alignment: { horizontal: 'center', vertical: 'center' }
  });
  for (let c = 0; c < 12; c++) setCell(wsOrders, 0, c, c === 0 ? 'ULTRATECH CEMENT LTD. - UNIT BIRLA WHITE | SALES ORDERS REGISTER' : '', titleStyle);
  mergesOrders.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } });

  // Row 1: Subtitle / Territory
  const subStyle = baseCellStyle({
    fill: { fgColor: { rgb: COLORS.LIGHT_BLUE } },
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: COLORS.NAVY } },
    alignment: { horizontal: 'left', vertical: 'center' }
  });
  for (let c = 0; c < 12; c++) setCell(wsOrders, 1, c, '', subStyle);
  setCell(wsOrders, 1, 0, 'Officer: Suraj (PZ7550) | Territory: Himachal Pradesh (Mandi Division) | Generated: ' + new Date().toLocaleDateString('en-IN'), subStyle);
  mergesOrders.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 11 } });

  // Row 3: Headers
  const headStyle = baseCellStyle({
    fill: { fgColor: { rgb: COLORS.BLUE } },
    font: { name: 'Arial', sz: 9.5, bold: true, color: { rgb: COLORS.WHITE } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: borderStyle
  });

  const headers = [
    'Order No',
    'Order Date',
    'Retailer (Buyer)',
    'Tehsil / Locality',
    'Stockist (Fulfiller)',
    'Grand Total (₹)',
    'Dispatched (₹)',
    'Pending (₹)',
    'Balance Due (₹)',
    'Fulfillment',
    'Delivery Status',
    'Site Delivery Address'
  ];
  headers.forEach((h, c) => setCell(wsOrders, 3, c, h, headStyle));

  // Data rows
  let rIdx = 4;
  orders.forEach((o, i) => {
    const isEven = i % 2 === 0;
    const bg = isEven ? COLORS.LIGHT_GRAY : COLORS.WHITE;
    const cellNormal = baseCellStyle({ fill: { fgColor: { rgb: bg } }, border: borderStyle, alignment: { horizontal: 'left' } });
    const cellCenter = baseCellStyle({ fill: { fgColor: { rgb: bg } }, border: borderStyle, alignment: { horizontal: 'center' } });
    const cellRight = baseCellStyle({ fill: { fgColor: { rgb: bg } }, border: borderStyle, alignment: { horizontal: 'right' } });

    setCell(wsOrders, rIdx, 0, o.orderNumber, cellCenter);
    setCell(wsOrders, rIdx, 1, new Date(o.orderDate).toLocaleDateString('en-IN'), cellCenter);
    setCell(wsOrders, rIdx, 2, o.retailer?.firmName || '', cellNormal);
    setCell(wsOrders, rIdx, 3, `${o.retailer?.tehsil || ''} - ${o.retailer?.locality || ''}`, cellNormal);
    setCell(wsOrders, rIdx, 4, o.stockist?.firmName || '', cellNormal);
    setCell(wsOrders, rIdx, 5, Number(o.grandTotal || 0), cellRight, '₹#,##0.00');
    setCell(wsOrders, rIdx, 6, Number(o.dispatchedAmount || 0), cellRight, '₹#,##0.00');
    setCell(wsOrders, rIdx, 7, Number(o.pendingAmount || 0), cellRight, '₹#,##0.00');
    setCell(wsOrders, rIdx, 8, Number(o.balanceDueAmount || 0), cellRight, '₹#,##0.00');
    setCell(wsOrders, rIdx, 9, o.fulfillmentStatus, cellCenter);
    setCell(wsOrders, rIdx, 10, o.deliveryStatus, cellCenter);
    setCell(wsOrders, rIdx, 11, o.deliveryLocation || 'Same as billing', cellNormal);
    rIdx++;
  });

  // Totals Row
  const totalStyle = baseCellStyle({
    fill: { fgColor: { rgb: COLORS.TOTAL_BG } },
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: COLORS.TEXT_DARK } },
    border: borderStyle,
    alignment: { horizontal: 'right' }
  });
  setCell(wsOrders, rIdx, 4, 'TOTAL:', totalStyle);
  setCell(wsOrders, rIdx, 5, orders.reduce((s, o) => s + (o.grandTotal || 0), 0), totalStyle, '₹#,##0.00');
  setCell(wsOrders, rIdx, 6, orders.reduce((s, o) => s + (o.dispatchedAmount || 0), 0), totalStyle, '₹#,##0.00');
  setCell(wsOrders, rIdx, 7, orders.reduce((s, o) => s + (o.pendingAmount || 0), 0), totalStyle, '₹#,##0.00');
  setCell(wsOrders, rIdx, 8, orders.reduce((s, o) => s + (o.balanceDueAmount || 0), 0), totalStyle, '₹#,##0.00');

  wsOrders['!merges'] = mergesOrders;
  wsOrders['!cols'] = [
    { wch: 15 }, { wch: 13 }, { wch: 32 }, { wch: 26 }, { wch: 32 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
    { wch: 14 }, { wch: 35 }
  ];
  wsOrders['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx, c: 11 } });

  XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders Master');

  // SHEET 2: Line Items Detail Breakdown
  const wsItems = {};
  const mergesItems = [];
  headers.slice(0, 8); // clear

  for (let c = 0; c < 10; c++) setCell(wsItems, 0, c, c === 0 ? 'SALES ORDERS LINE ITEMS BREAKDOWN & AGREED RATES' : '', titleStyle);
  mergesItems.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } });

  const itemHeaders = ['Order No', 'Retailer', 'Stockist', 'Product SKU', 'Unit Type', 'Qty', 'Catalogue Price (₹)', 'Agreed Rate (₹)', 'GST Rate', 'Item Total (₹)'];
  itemHeaders.forEach((h, c) => setCell(wsItems, 2, c, h, headStyle));

  let itemRIdx = 3;
  orders.forEach((o) => {
    (o.orderItems || []).forEach((it) => {
      const cellNormal = baseCellStyle({ border: borderStyle, alignment: { horizontal: 'left' } });
      const cellCenter = baseCellStyle({ border: borderStyle, alignment: { horizontal: 'center' } });
      const cellRight = baseCellStyle({ border: borderStyle, alignment: { horizontal: 'right' } });

      setCell(wsItems, itemRIdx, 0, o.orderNumber, cellCenter);
      setCell(wsItems, itemRIdx, 1, o.retailer?.firmName || '', cellNormal);
      setCell(wsItems, itemRIdx, 2, o.stockist?.firmName || '', cellNormal);
      setCell(wsItems, itemRIdx, 3, it.product?.name || 'Custom SKU', cellNormal);
      setCell(wsItems, itemRIdx, 4, it.product?.unitType || 'Bag', cellCenter);
      setCell(wsItems, itemRIdx, 5, it.quantity, cellCenter);
      setCell(wsItems, itemRIdx, 6, it.cataloguePrice || 0, cellRight, '₹#,##0.00');
      setCell(wsItems, itemRIdx, 7, it.unitPrice, cellRight, '₹#,##0.00');
      setCell(wsItems, itemRIdx, 8, `${it.gstRate || 18}%`, cellCenter);
      setCell(wsItems, itemRIdx, 9, it.totalAmount, cellRight, '₹#,##0.00');
      itemRIdx++;
    });
  });

  wsItems['!merges'] = mergesItems;
  wsItems['!cols'] = [{ wch: 15 }, { wch: 28 }, { wch: 28 }, { wch: 38 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 18 }];
  wsItems['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: itemRIdx - 1, c: 9 } });

  XLSX.utils.book_append_sheet(wb, wsItems, 'Order Line Items');

  // Trigger download
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * 2. EXPORT LEDGER, DUE DAYS & AGEING TO EXCEL
 */
export function exportLedgerToExcel(ledgerData, payments, filename = 'Birla_White_Ledger_Ageing') {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Retailer Ageing & Overdue
  const ws = {};
  const merges = [];
  const setCell = (r, c, v, style, fmt) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    ws[ref] = { v: v ?? '', t: typeof v === 'number' ? 'n' : 's', s: style, ...(fmt ? { z: fmt } : {}) };
  };

  const titleStyle = baseCellStyle({
    fill: { fgColor: { rgb: COLORS.CRIMSON } },
    font: { name: 'Arial', sz: 13, bold: true, color: { rgb: COLORS.WHITE } },
    alignment: { horizontal: 'center', vertical: 'center' }
  });
  for (let c = 0; c < 8; c++) setCell(0, c, c === 0 ? 'ULTRATECH CEMENT LTD. | RETAILERS LEDGER & LIVE DUE DAYS AGEING' : '', titleStyle);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });

  const headStyle = baseCellStyle({
    fill: { fgColor: { rgb: COLORS.NAVY } },
    font: { name: 'Arial', sz: 9.5, bold: true, color: { rgb: COLORS.WHITE } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderStyle
  });

  const headers = ['Retailer Name', 'Tehsil & Locality', 'GSTIN', 'Credit Limit (₹)', 'Credit Terms', 'Total Billed (₹)', 'Total Collected (₹)', 'Current Outstanding (₹)'];
  headers.forEach((h, c) => setCell(2, c, h, headStyle));

  let rIdx = 3;
  (ledgerData || []).forEach((ret, i) => {
    const bg = i % 2 === 0 ? COLORS.LIGHT_GRAY : COLORS.WHITE;
    const cellNormal = baseCellStyle({ fill: { fgColor: { rgb: bg } }, border: borderStyle, alignment: { horizontal: 'left' } });
    const cellCenter = baseCellStyle({ fill: { fgColor: { rgb: bg } }, border: borderStyle, alignment: { horizontal: 'center' } });
    const cellRight = baseCellStyle({ fill: { fgColor: { rgb: bg } }, border: borderStyle, alignment: { horizontal: 'right' } });

    setCell(rIdx, 0, ret.firmName, cellNormal);
    setCell(rIdx, 1, `${ret.tehsil} - ${ret.locality}`, cellNormal);
    setCell(rIdx, 2, ret.gstNumber || 'N/A', cellCenter);
    setCell(rIdx, 3, ret.creditLimit || 0, cellRight, '₹#,##0.00');
    setCell(rIdx, 4, `${ret.creditDays || 30} Days`, cellCenter);
    setCell(rIdx, 5, ret.totalBilled || 0, cellRight, '₹#,##0.00');
    setCell(rIdx, 6, ret.totalCollected || 0, cellRight, '₹#,##0.00');
    setCell(rIdx, 7, ret.outstandingBalance || 0, cellRight, '₹#,##0.00');
    rIdx++;
  });

  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 32 }, { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 22 }];
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rIdx - 1, c: 7 } });
  XLSX.utils.book_append_sheet(wb, ws, 'Retailer Ageing Ledger');

  // Sheet 2: Payments History
  const wsPay = {};
  const mergesPay = [];
  for (let c = 0; c < 7; c++) wsPay[XLSX.utils.encode_cell({ r: 0, c })] = { v: c === 0 ? 'MONEY RECEIPTS & PAYMENT COLLECTIONS REGISTER' : '', s: titleStyle };
  mergesPay.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });

  const payHeaders = ['Receipt No', 'Payment Date', 'Retailer Firm', 'Amount Paid (₹)', 'Payment Mode', 'Cheque / Ref Date', 'Recorded By'];
  payHeaders.forEach((h, c) => {
    wsPay[XLSX.utils.encode_cell({ r: 2, c })] = { v: h, s: headStyle };
  });

  let pRIdx = 3;
  (payments || []).forEach((p) => {
    const cN = baseCellStyle({ border: borderStyle, alignment: { horizontal: 'left' } });
    const cC = baseCellStyle({ border: borderStyle, alignment: { horizontal: 'center' } });
    const cR = baseCellStyle({ border: borderStyle, alignment: { horizontal: 'right' } });

    wsPay[XLSX.utils.encode_cell({ r: pRIdx, c: 0 })] = { v: p.receiptNumber, s: cC };
    wsPay[XLSX.utils.encode_cell({ r: pRIdx, c: 1 })] = { v: new Date(p.paymentDate).toLocaleDateString('en-IN'), s: cC };
    wsPay[XLSX.utils.encode_cell({ r: pRIdx, c: 2 })] = { v: p.retailer?.firmName || '', s: cN };
    wsPay[XLSX.utils.encode_cell({ r: pRIdx, c: 3 })] = { v: p.amountPaid, s: cR, t: 'n', z: '₹#,##0.00' };
    wsPay[XLSX.utils.encode_cell({ r: pRIdx, c: 4 })] = { v: p.paymentMode, s: cC };
    wsPay[XLSX.utils.encode_cell({ r: pRIdx, c: 5 })] = { v: p.chequeDate ? new Date(p.chequeDate).toLocaleDateString('en-IN') : (p.referenceNo || 'Direct Entry'), s: cC };
    wsPay[XLSX.utils.encode_cell({ r: pRIdx, c: 6 })] = { v: p.recordedBy || 'Suraj (PZ7550)', s: cN };
    pRIdx++;
  });

  wsPay['!merges'] = mergesPay;
  wsPay['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 32 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 22 }];
  wsPay['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: pRIdx - 1, c: 6 } });
  XLSX.utils.book_append_sheet(wb, wsPay, 'Payments Received');

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * 3. EXPORT MASTER DIRECTORY (STOCKISTS & RETAILERS) TO EXCEL
 */
export function exportMastersToExcel(stockists, retailers, filename = 'Birla_White_Master_Directory') {
  const wb = XLSX.utils.book_new();

  // Stockists Sheet
  const wsStockists = XLSX.utils.json_to_sheet(
    stockists.map((s) => ({
      'Firm Name': s.firmName,
      'GST Number': s.gstNumber,
      'Contact Person': s.ownerName,
      'Mobile Number': s.mobileNumber,
      District: s.district,
      Tehsil: s.tehsil,
      'Sub-Tehsil': s.subTehsil || '',
      Locality: s.locality,
      'PIN Code': s.pincode,
      'Credit Limit (INR)': s.creditLimit,
      'Credit Days': s.creditDays,
      Status: s.status
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsStockists, 'Stockists Master');

  // Retailers Sheet
  const wsRetailers = XLSX.utils.json_to_sheet(
    retailers.map((r) => ({
      'Retailer Firm Name': r.firmName,
      'GST Number': r.gstNumber,
      'Proprietor Name': r.ownerName,
      'Mobile Number': r.mobileNumber,
      District: r.district,
      Tehsil: r.tehsil,
      'Sub-Tehsil': r.subTehsil || '',
      Locality: r.locality,
      'PIN Code': r.pincode,
      'Credit Limit (INR)': r.creditLimit,
      'Credit Days': r.creditDays,
      'Primary Stockist': r.primaryStockist?.firmName || 'Direct',
      Status: r.status
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsRetailers, 'Retailers Master');

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * 4. EXPORT PRODUCT CATALOGUE TO EXCEL
 */
export function exportProductsToExcel(products, filename = 'Birla_White_Product_Catalogue') {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(
    products.map((p) => ({
      'Product Name': p.name,
      Category: p.category,
      'Unit Type': p.unitType,
      'Unit Weight': p.unitWeight || '',
      'Weight Unit': p.weightUnit || '',
      'Catalogue Price (INR)': p.cataloguePrice,
      'GST Rate (%)': p.gstRate,
      'Current Stock': p.stock || 0
    }))
  );
  XLSX.utils.book_append_sheet(wb, ws, 'Product Catalogue');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * 5. PJP STYLED MONTHLY EXCEL EXPORT (EXACT PJP-SURAJ MATCHING)
 */
export function exportPjpToExcel(pjpData, year, month) {
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = MONTH_NAMES[month - 1];
  const name = pjpData.name || 'SURAJ (PZ7550)';
  const employeeId = pjpData.employeeId || 'PZ7550';
  const summary = pjpData.summary || {};

  const NAVY = '17365D';
  const BLUE = '2F75B5';
  const LIGHT = 'DCE6F1';
  const VERY_LIGHT = 'F7F9FC';
  const RED = 'D93025';
  const WHITE = 'FFFFFF';
  const BORDER = '7F8C9A';
  const GREY = 'EDEDED';
  const TEXT = '1F2937';

  const side = { style: 'thin', color: { rgb: BORDER } };
  const border = { top: side, bottom: side, left: side, right: side };
  const base = (extra) => ({
    font: { name: 'Arial', sz: 10, color: { rgb: TEXT } },
    alignment: { vertical: 'center', wrapText: true },
    ...(extra || {})
  });

  const ws = {};
  const merges = [];
  const rowsH = [];

  const set = (r, c, v, style, fmt) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    const cell = { v, t: typeof v === 'number' ? 'n' : v instanceof Date ? 'd' : 's', s: style };
    if (fmt) cell.z = fmt;
    ws[ref] = cell;
  };

  const fill = (rgb) => ({ patternType: 'solid', fgColor: { rgb } });

  // Row 1: Title (A1:I1)
  const titleStyle = base({
    fill: fill(NAVY),
    font: { name: 'Arial', sz: 15, bold: true, color: { rgb: WHITE } },
    alignment: { horizontal: 'center', vertical: 'center' }
  });
  for (let c = 0; c < 9; c++) set(0, c, c === 0 ? 'PJP — MONTHLY VISIT & DISTRICT HEADQUARTER REPORT (ULTRATECH - BIRLA WHITE)' : '', titleStyle);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });

  // Row 2: Info (A2:I2)
  const infoL = base({ fill: fill(LIGHT), font: { name: 'Arial', sz: 10, bold: true, color: { rgb: TEXT } }, alignment: { horizontal: 'left', vertical: 'center' } });
  const infoR = base({ fill: fill(LIGHT), font: { name: 'Arial', sz: 10, bold: true, color: { rgb: TEXT } }, alignment: { horizontal: 'right', vertical: 'center' } });
  for (let c = 0; c < 9; c++) set(1, c, '', c < 4 ? infoL : infoR);
  set(1, 0, 'OFFICER: ' + name, infoL);
  set(1, 2, 'EMP ID: ' + employeeId, infoL);
  set(1, 4, 'PERIOD: ' + monthName.toUpperCase() + ' ' + year, infoR);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, { s: { r: 1, c: 2 }, e: { r: 1, c: 3 } }, { s: { r: 1, c: 4 }, e: { r: 1, c: 8 } });

  // Row 4: Column Headers
  const head = base({ fill: fill(BLUE), font: { name: 'Arial', sz: 10, bold: true, color: { rgb: WHITE } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border });
  ['Date', 'DAY', 'Place of Visit', 'Remarks / Market Beats', 'Combined Working'].forEach((h, c) => set(3, c, h, head));
  ['No of days spend in District Headquarter', 'Days', 'No of Counter'].forEach((h, c) => set(3, 6 + c, h, head));

  // Daily rows
  const startRow = 4;
  (pjpData.days || []).forEach((r, i) => {
    const rr = startRow + i;
    const bg = r.isHoliday ? RED : i % 2 === 0 ? VERY_LIGHT : WHITE;
    const font = { name: 'Arial', sz: 10, bold: r.isHoliday, color: { rgb: r.isHoliday ? WHITE : TEXT } };
    const mk = (h) => base({ fill: fill(bg), font, border, alignment: { horizontal: h, vertical: 'center', wrapText: true } });

    set(rr, 0, `${String(r.dayNumber).padStart(2, '0')}-${monthName.slice(0, 3)}-${year}`, mk('center'));
    set(rr, 1, r.day, mk('center'));
    set(rr, 2, r.isHoliday ? 'Holiday / Sunday' : r.place || '', mk('left'));
    set(rr, 3, r.isHoliday ? r.holidayReason || 'Weekly Off' : r.remarks || '', mk('left'));
    set(rr, 4, r.isHoliday ? 'Holiday' : '', mk('center'));
  });

  // Place-wise Summary
  const places = summary.places || [];
  places.forEach((x, i) => {
    const rr = startRow + i;
    const bg = i % 2 === 0 ? GREY : WHITE;
    set(rr, 6, x.place, base({ fill: fill(bg), border, alignment: { horizontal: 'left', vertical: 'center', wrapText: true } }));
    set(rr, 7, x.days, base({ fill: fill(bg), border, alignment: { horizontal: 'center', vertical: 'center' } }));
    set(rr, 8, Number(x.counter || 0), base({ fill: fill(bg), border, alignment: { horizontal: 'center', vertical: 'center' } }));
  });

  const sumTotalRow = startRow + places.length;
  const totStyle = base({ fill: fill(LIGHT), font: { name: 'Arial', sz: 10, bold: true, color: { rgb: TEXT } }, border, alignment: { horizontal: 'center', vertical: 'center' } });
  set(sumTotalRow, 6, 'TOTAL', totStyle);
  set(sumTotalRow, 7, places.reduce((s, x) => s + Number(x.days || 0), 0), totStyle);
  set(sumTotalRow, 8, places.reduce((s, x) => s + Number(x.counter || 0), 0), totStyle);

  // Monthly totals
  const totalsRow = startRow + (pjpData.days?.length || 30) + 2;
  [
    ['Total Calendar Days', summary.totalDays || 30],
    ['Working Days', summary.workingDays || 26],
    ['Holiday Days', summary.holidayDays || 4],
    ['Total Visit Days', summary.visitDays || 22]
  ].forEach(([label, val], i) => {
    set(totalsRow + i, 0, label, base({ fill: fill(LIGHT), font: { name: 'Arial', sz: 10, bold: true, color: { rgb: TEXT } }, border }));
    set(totalsRow + i, 1, val, base({ fill: fill(VERY_LIGHT), font: { name: 'Arial', sz: 10, bold: true, color: { rgb: TEXT } }, border, alignment: { horizontal: 'center', vertical: 'center' } }));
  });

  // Footer Signatory
  const footerRow = Math.max(totalsRow + 5, sumTotalRow + 2);
  const footStyle = base({ font: { name: 'Arial', sz: 9, bold: true, color: { rgb: '475569' } }, alignment: { horizontal: 'center', vertical: 'center' } });
  for (let c = 0; c < 9; c++) set(footerRow, c, c === 0 ? `Official PJP Report • Suraj (PZ7550) • UltraTech Cement Ltd. - Unit Birla White • ${monthName} ${year}` : '', footStyle);
  merges.push({ s: { r: footerRow, c: 0 }, e: { r: footerRow, c: 8 } });

  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 28 }, { wch: 32 }, { wch: 18 }, { wch: 4 }, { wch: 36 }, { wch: 10 }, { wch: 14 }];
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: footerRow, c: 8 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `PJP ${monthName} ${year}`);
  XLSX.writeFile(wb, `PJP_Suraj_${monthName}_${year}.xlsx`);
}

/**
 * 6. EXPORT ADVANCED BI & ANALYTICS REPORT TO EXCEL
 */
export function exportBiAnalyticsToExcel(biData, timeframe = 'quarterly', filename = 'Birla_White_BI_Executive_Report') {
  const wb = XLSX.utils.book_new();
  const ws = {};
  const merges = [];

  const set = (r, c, v, s) => {
    ws[XLSX.utils.encode_cell({ r, c })] = {
      v: v === undefined || v === null ? '' : v,
      t: typeof v === 'number' ? 'n' : 's',
      s
    };
  };

  const fill = (rgb) => ({ patternType: 'solid', fgColor: { rgb } });
  const base = (extra = {}) => ({
    font: { name: 'Arial', sz: 9.5, color: { rgb: COLORS.TEXT_DARK } },
    alignment: { vertical: 'center' },
    ...extra
  });

  // Title Banner
  const titleStyle = base({
    font: { name: 'Arial', sz: 14, bold: true, color: { rgb: COLORS.WHITE } },
    fill: fill(COLORS.BLUE),
    alignment: { horizontal: 'center', vertical: 'center' }
  });
  for (let c = 0; c < 8; c++) set(0, c, c === 0 ? 'ADITYA BIRLA ULTRATECH • BIRLA WHITE EXECUTIVE BI REPORT' : '', titleStyle);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });

  const subStyle = base({
    font: { name: 'Arial', sz: 9.5, color: { rgb: COLORS.WHITE } },
    fill: fill(COLORS.NAVY),
    alignment: { horizontal: 'center', vertical: 'center' }
  });
  const subText = `Officer: Suraj (PZ7550) • Mandi Division, HP • Timeframe: ${timeframe.toUpperCase()} • Generated: ${new Date().toLocaleDateString('en-IN')}`;
  for (let c = 0; c < 8; c++) set(1, c, c === 0 ? subText : '', subStyle);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } });

  // Period Scorecard
  const p = biData?.periodMetrics || {};
  set(3, 0, 'KEY PERFORMANCE INDICATORS (KPIs)', base({ font: { name: 'Arial', sz: 11, bold: true, color: { rgb: COLORS.BLUE } } }));

  const kpis = [
    ['Total Invoiced Sales (INR)', p.totalInvoiced || 0],
    ['Total Realized Collections (INR)', p.totalCollected || 0],
    ['Outstanding Market Receivables (INR)', p.totalDue || 0],
    ['Collection Efficiency Rate (%)', p.totalInvoiced ? `${Math.round((p.totalCollected / p.totalInvoiced) * 100)}%` : '100%'],
    ['Total Sales Orders Processed', p.orderCount || 0],
    ['Total Payment Receipts Cleared', p.paymentCount || 0]
  ];

  kpis.forEach(([label, val], idx) => {
    const r = 4 + idx;
    set(r, 0, label, base({ fill: fill(idx % 2 === 0 ? COLORS.LIGHT_GRAY : COLORS.WHITE), border: borderStyle, font: { name: 'Arial', sz: 9.5, bold: true } }));
    set(r, 1, val, base({ fill: fill(idx % 2 === 0 ? COLORS.LIGHT_GRAY : COLORS.WHITE), border: borderStyle, alignment: { horizontal: 'right' }, font: { name: 'Arial', sz: 9.5, bold: true } }));
    merges.push({ s: { r, c: 1 }, e: { r, c: 2 } });
  });

  // Top Selling Products Table
  const prodRow = 12;
  set(prodRow, 0, 'PRODUCT VOLUME & REVENUE BREAKDOWN', base({ font: { name: 'Arial', sz: 11, bold: true, color: { rgb: COLORS.BLUE } } }));

  const headers = ['#', 'Product Description', 'Unit Type', 'Packaging Size', 'Units Sold', 'Total Volume (MT / Ltr)', 'Invoiced Revenue (INR)', 'Revenue Share (%)'];
  const thStyle = base({
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: COLORS.WHITE } },
    fill: fill(COLORS.NAVY),
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderStyle
  });

  headers.forEach((h, c) => set(prodRow + 1, c, h, thStyle));

  const prods = biData?.topSellingProducts || [];
  const totRev = prods.reduce((s, x) => s + Number(x.totalRevenue || 0), 0) || 1;

  prods.forEach((item, i) => {
    const r = prodRow + 2 + i;
    const bg = i % 2 === 0 ? COLORS.LIGHT_GRAY : COLORS.WHITE;
    const bStyle = base({ fill: fill(bg), border: borderStyle });

    set(r, 0, i + 1, { ...bStyle, alignment: { horizontal: 'center' } });
    set(r, 1, item.productName, { ...bStyle, font: { name: 'Arial', sz: 9.5, bold: true } });
    set(r, 2, item.unitType, { ...bStyle, alignment: { horizontal: 'center' } });
    set(r, 3, `${item.unitWeight} ${item.weightUnit}`, { ...bStyle, alignment: { horizontal: 'center' } });
    set(r, 4, item.totalQuantity, { ...bStyle, alignment: { horizontal: 'center' } });
    const volStr = item.totalWeightVolume >= 1000 && item.weightUnit === 'Kg'
      ? `${(item.totalWeightVolume / 1000).toFixed(2)} MT`
      : `${item.totalWeightVolume} ${item.weightUnit}`;
    set(r, 5, volStr, { ...bStyle, alignment: { horizontal: 'right' } });
    set(r, 6, item.totalRevenue, { ...bStyle, alignment: { horizontal: 'right' }, font: { name: 'Arial', sz: 9.5, bold: true } });
    const share = Math.round((Number(item.totalRevenue || 0) / totRev) * 100);
    set(r, 7, `${share}%`, { ...bStyle, alignment: { horizontal: 'center' } });
  });

  // Footer
  const lastR = prodRow + prods.length + 4;
  for (let c = 0; c < 8; c++) set(lastR, c, c === 0 ? 'Official Executive Report • UltraTech Cement Ltd. Unit Birla White • Confidential' : '', base({ font: { name: 'Arial', sz: 8.5, italic: true, color: { rgb: '64748B' } }, alignment: { horizontal: 'center' } }));
  merges.push({ s: { r: lastR, c: 0 }, e: { r: lastR, c: 7 } });

  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 6 }, { wch: 46 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 24 }, { wch: 18 }];
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastR, c: 7 } });

  XLSX.utils.book_append_sheet(wb, ws, 'Executive BI Analytics');
  XLSX.writeFile(wb, `${filename}_${timeframe}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
