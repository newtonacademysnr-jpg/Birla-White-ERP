const PDFDocument = require('pdfkit');

/**
 * Utility function to format currency in INR (₹)
 */
function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹ 0.00';
  return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Renders Standard Official Corporate Header
 */
function drawCorporateHeader(doc, title, subtitle = '') {
  // Top brand banner accent
  doc.rect(0, 0, doc.page.width, 10).fill('#A02225'); // Aditya Birla Crimson

  // Logo / Brand text
  doc.fillColor('#0087CF').fontSize(18).font('Helvetica-Bold').text('BIRLA WHITE', 50, 25);
  doc.fillColor('#666666').fontSize(8).font('Helvetica').text('Unit: Birla White | UltraTech Cement Ltd.', 50, 47);
  doc.fillColor('#888888').fontSize(7.5).text('Aditya Birla Group | Corporate Identity: L26940MH2000PLC128420', 50, 57);

  // Right side document banner
  doc.fillColor('#A02225').fontSize(14).font('Helvetica-Bold').text(title, 250, 25, { align: 'right', width: 300 });
  if (subtitle) {
    doc.fillColor('#444444').fontSize(8).font('Helvetica-Oblique').text(subtitle, 250, 42, { align: 'right', width: 300 });
  }

  // Divider line
  doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, 72).lineTo(550, 72).stroke();
}

/**
 * 1. Retailer Order Confirmation Receipt (Blind Drop-Shipping Logic)
 * STRICTLY HIDES all Stockist information!
 */
function generateRetailerReceipt(order) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  drawCorporateHeader(doc, 'ORDER CONFIRMATION RECEIPT', 'Retailer Copy (Direct Brand Billing)');

  let y = 82;

  // Metadata Grid (Order Info & Created By)
  doc.rect(50, y, 240, 95).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');
  doc.rect(300, y, 250, 95).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');

  // Left: Order Details
  doc.fillColor('#A02225').font('Helvetica-Bold').fontSize(9).text('ORDER DETAILS', 60, y + 8);
  doc.fillColor('#333333').font('Helvetica').fontSize(8.5);
  doc.text(`Order Number: ${order.orderNumber}`, 60, y + 23);
  doc.text(`Order Date: ${formatDate(order.orderDate)}`, 60, y + 37);
  doc.text(`Fulfillment: ${order.fulfillmentStatus}`, 60, y + 51);
  doc.text(`State: ${order.state}`, 60, y + 65);
  doc.text(`Delivery Status: ${order.deliveryStatus}`, 60, y + 79);

  // Right: Created & Confirmed By (Suraj PZ7550)
  doc.fillColor('#A02225').font('Helvetica-Bold').fontSize(9).text('CONFIRMED & CREATED BY', 310, y + 8);
  doc.fillColor('#333333').font('Helvetica').fontSize(8.5);
  doc.text(`Name & ID: ${order.createdBy || 'Suraj (PZ7550)'}`, 310, y + 23);
  doc.text(`Mobile: ${order.createdMobile || '8219796922'}`, 310, y + 37);
  doc.text(`Email: ${order.createdEmail || 'suraj-v@adityabirla.com'}`, 310, y + 51);
  doc.text(`Company: ${order.createdCompany || 'UltraTech Cement Ltd. - Unit Birla White'}`, 310, y + 65, { width: 230 });

  y += 105;

  // Retailer Info & Delivery Location Grid
  doc.rect(50, y, 240, 90).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');
  doc.rect(300, y, 250, 90).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');

  // Retailer Details
  doc.fillColor('#0087CF').font('Helvetica-Bold').fontSize(9).text('RETAILER (BILLED TO)', 60, y + 8);
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.5).text(order.retailer?.firmName || 'Retailer Firm', 60, y + 23);
  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text(`Proprietor: ${order.retailer?.ownerName || 'N/A'}`, 60, y + 36);
  doc.text(`GSTIN: ${order.retailer?.gstNumber || 'N/A'}`, 60, y + 48);
  doc.text(`Mobile: ${order.retailer?.mobileNumber || 'N/A'}`, 60, y + 60);
  doc.text(`Address: ${order.retailer?.locality}, ${order.retailer?.tehsil}, ${order.retailer?.district} - ${order.retailer?.pincode}`, 60, y + 72, { width: 220 });

  // Delivery Location Details
  doc.fillColor('#0087CF').font('Helvetica-Bold').fontSize(9).text('DELIVERY SITE & CONTACT', 310, y + 8);
  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text(`Site Address: ${order.deliveryLocation || 'Same as Billing Address'}`, 310, y + 23, { width: 230 });
  doc.text(`Contact Person: ${order.deliveryContactPerson || 'N/A'}`, 310, y + 48);
  doc.text(`Contact Mobile: ${order.deliveryContactMobile || 'N/A'}`, 310, y + 60);
  doc.text(`Delivery Date: ${formatDate(order.deliveryDate)}`, 310, y + 72);

  y += 102;

  // Notice Bar: Blind Drop Shipping (No Stockist)
  doc.rect(50, y, 500, 18).fill('#EFF6FF');
  doc.fillColor('#1D4ED8').font('Helvetica-Bold').fontSize(7.5).text('✓ Direct Brand Sales Order Confirmation. Supplied from UltraTech Regional Supply Chain Depot.', 58, y + 5);

  y += 26;

  // Line Items Table Header
  doc.rect(50, y, 500, 20).fill('#A02225');
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
  doc.text('#', 55, y + 6);
  doc.text('Product Description', 75, y + 6);
  doc.text('Unit Type', 250, y + 6);
  doc.text('Qty', 310, y + 6);
  doc.text('Unit Rate', 350, y + 6);
  doc.text('GST %', 420, y + 6);
  doc.text('Total (₹)', 470, y + 6, { align: 'right', width: 75 });

  y += 20;

  // Line Items
  doc.font('Helvetica').fontSize(8);
  order.items?.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.rect(50, y, 500, 19).fill('#F9FAFB');
    }
    doc.fillColor('#111827');
    doc.text((index + 1).toString(), 55, y + 5);
    doc.text(item.productName, 75, y + 5, { width: 170 });
    doc.text(`${item.unitType} (${item.unitWeight} ${item.weightUnit})`, 250, y + 5);
    doc.text(item.orderedQty.toString(), 310, y + 5);
    doc.text(`₹ ${item.manualUnitRate.toFixed(2)}`, 350, y + 5);
    doc.text(`${item.gstRate}%`, 420, y + 5);
    doc.text(`₹ ${item.lineTotal.toFixed(2)}`, 470, y + 5, { align: 'right', width: 75 });

    y += 20;
  });

  // Table bottom line
  doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  y += 8;

  // Financial Summary Box
  doc.rect(340, y, 210, 75).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');
  doc.fillColor('#4B5563').font('Helvetica').fontSize(8.5);
  doc.text('Subtotal (Excl. Tax):', 350, y + 10);
  doc.text(formatCurrency(order.subtotal), 440, y + 10, { align: 'right', width: 100 });

  doc.text('Total GST Tax:', 350, y + 26);
  doc.text(formatCurrency(order.gstTotal), 440, y + 26, { align: 'right', width: 100 });

  doc.strokeColor('#D1D5DB').lineWidth(0.5).moveTo(350, y + 42).lineTo(540, y + 42).stroke();

  doc.fillColor('#A02225').font('Helvetica-Bold').fontSize(10);
  doc.text('Grand Total:', 350, y + 50);
  doc.text(formatCurrency(order.grandTotal), 440, y + 50, { align: 'right', width: 100 });

  // Terms & Conditions (Left side)
  doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8).text('Terms & Delivery Conditions:', 50, y + 10);
  doc.fillColor('#6B7280').font('Helvetica').fontSize(7);
  doc.text('1. All Birla White products are polymer modified and strictly quality tested.', 50, y + 22, { width: 275 });
  doc.text('2. Goods once sold will not be accepted back unless manufacturing defect reported within 48 hrs.', 50, y + 32, { width: 275 });
  doc.text('3. Payment due as per agreed credit days. Live ageing interest applies after due date.', 50, y + 42, { width: 275 });
  doc.text('4. This is a computer-generated confirmation. Does not require physical signature.', 50, y + 52, { width: 275 });

  // Signatures footer
  y += 90;
  doc.strokeColor('#9CA3AF').lineWidth(0.5).dash(3, { space: 3 });
  doc.moveTo(50, y + 35).lineTo(180, y + 35).stroke();
  doc.moveTo(400, y + 35).lineTo(540, y + 35).stroke();
  doc.undash();

  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text('Customer / Retailer Acknowledgment', 50, y + 40);
  doc.text('Authorized Signatory (Birla White)', 400, y + 40);

  doc.end();
  return doc;
}

/**
 * 2. Stockist Order Confirmation Receipt
 * MUST SHOW BOTH Stockist details AND complete Retailer details!
 */
function generateStockistReceipt(order) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  drawCorporateHeader(doc, 'STOCKIST DISPATCH ADVISORY', 'Fulfillment Copy with Retailer Details');

  let y = 82;

  // Metadata Grid
  doc.rect(50, y, 240, 85).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');
  doc.rect(300, y, 250, 85).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');

  // Left: Order Info
  doc.fillColor('#A02225').font('Helvetica-Bold').fontSize(9).text('DISPATCH ORDER DETAILS', 60, y + 8);
  doc.fillColor('#333333').font('Helvetica').fontSize(8.5);
  doc.text(`Order Number: ${order.orderNumber}`, 60, y + 23);
  doc.text(`Booking Date: ${formatDate(order.orderDate)}`, 60, y + 37);
  doc.text(`Fulfillment: ${order.fulfillmentStatus}`, 60, y + 51);
  doc.text(`Delivery Date: ${formatDate(order.deliveryDate)}`, 60, y + 65);

  // Right: Territory Officer (Suraj PZ7550)
  doc.fillColor('#A02225').font('Helvetica-Bold').fontSize(9).text('TERRITORY SALES OFFICER', 310, y + 8);
  doc.fillColor('#333333').font('Helvetica').fontSize(8.5);
  doc.text(`Officer: ${order.createdBy || 'Suraj (PZ7550)'}`, 310, y + 23);
  doc.text(`Mobile: ${order.createdMobile || '8219796922'}`, 310, y + 37);
  doc.text(`Email: ${order.createdEmail || 'suraj-v@adityabirla.com'}`, 310, y + 51);
  doc.text(`Unit: UltraTech Cement Ltd. - Unit Birla White`, 310, y + 65);

  y += 95;

  // Parties Grid: STOCKIST & RETAILER
  doc.rect(50, y, 240, 105).strokeColor('#E5E7EB').fillAndStroke('#FEF3C7', '#F59E0B'); // Warm amber for stockist
  doc.rect(300, y, 250, 105).strokeColor('#E5E7EB').fillAndStroke('#EFF6FF', '#3B82F6'); // Cool blue for retailer

  // Stockist (Fulfiller)
  doc.fillColor('#92400E').font('Helvetica-Bold').fontSize(9).text('STOCKIST (DISPATCHING FROM)', 60, y + 8);
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.5).text(order.stockist?.firmName || 'Stockist Firm', 60, y + 23);
  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text(`Proprietor: ${order.stockist?.ownerName || 'N/A'}`, 60, y + 36);
  doc.text(`GSTIN: ${order.stockist?.gstNumber || 'N/A'}`, 60, y + 48);
  doc.text(`Mobile: ${order.stockist?.mobileNumber || 'N/A'}`, 60, y + 60);
  doc.text(`Address: ${order.stockist?.locality}, ${order.stockist?.tehsil}, ${order.stockist?.district} - ${order.stockist?.pincode}`, 60, y + 72, { width: 220 });

  // Retailer (Consignee)
  doc.fillColor('#1E40AF').font('Helvetica-Bold').fontSize(9).text('RETAILER (DELIVERY TO)', 310, y + 8);
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.5).text(order.retailer?.firmName || 'Retailer Firm', 310, y + 23);
  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text(`Owner: ${order.retailer?.ownerName || 'N/A'} | Mob: ${order.retailer?.mobileNumber || 'N/A'}`, 310, y + 36);
  doc.text(`GSTIN: ${order.retailer?.gstNumber || 'N/A'}`, 310, y + 48);
  doc.text(`Address: ${order.retailer?.locality}, ${order.retailer?.tehsil}, ${order.retailer?.district} - ${order.retailer?.pincode}`, 310, y + 60, { width: 230 });
  doc.text(`Site Contact: ${order.deliveryContactPerson} (${order.deliveryContactMobile})`, 310, y + 80, { width: 230 });

  y += 115;

  // Line Items Table Header
  doc.rect(50, y, 500, 20).fill('#1F2937');
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
  doc.text('#', 55, y + 6);
  doc.text('Product Description', 75, y + 6);
  doc.text('Packaging', 230, y + 6);
  doc.text('Ordered', 300, y + 6);
  doc.text('Dispatched', 355, y + 6);
  doc.text('Pending', 420, y + 6);
  doc.text('Dispatch Check', 475, y + 6);

  y += 20;

  // Line Items
  doc.font('Helvetica').fontSize(8);
  order.items?.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.rect(50, y, 500, 20).fill('#F9FAFB');
    }
    doc.fillColor('#111827');
    doc.text((index + 1).toString(), 55, y + 5);
    doc.text(item.productName, 75, y + 5, { width: 150 });
    doc.text(`${item.unitType} (${item.unitWeight}${item.weightUnit})`, 230, y + 5);
    doc.text(item.orderedQty.toString(), 300, y + 5);
    doc.text((item.dispatchedQty || 0).toString(), 355, y + 5);
    doc.text((item.pendingQty || (item.orderedQty - (item.dispatchedQty || 0))).toString(), 420, y + 5);

    // Checkbox box
    doc.rect(490, y + 4, 11, 11).strokeColor('#6B7280').stroke();

    y += 20;
  });

  doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  y += 10;

  // Dispatch Valuation Box
  doc.rect(50, y, 500, 55).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');
  doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8.5);
  doc.text('ORDER VALUE SUMMARY', 60, y + 8);

  doc.font('Helvetica').fontSize(8).fillColor('#4B5563');
  doc.text(`Total Order Value: ${formatCurrency(order.grandTotal)}`, 60, y + 23);
  doc.text(`Dispatched Bill Value: ${formatCurrency(order.dispatchedAmount)}`, 230, y + 23);
  doc.text(`Pending Balance Value: ${formatCurrency(order.pendingAmount)}`, 400, y + 23);

  if (order.partialReason) {
    doc.fillColor('#B45309').font('Helvetica-Bold').fontSize(7.5);
    doc.text(`Partial Dispatch Reason: ${order.partialReason}`, 60, y + 38, { width: 480 });
  }

  y += 75;

  // Stockist Sign-off & Gate Pass
  doc.strokeColor('#9CA3AF').lineWidth(0.5).dash(3, { space: 3 });
  doc.moveTo(50, y + 35).lineTo(180, y + 35).stroke();
  doc.moveTo(230, y + 35).lineTo(360, y + 35).stroke();
  doc.moveTo(400, y + 35).lineTo(540, y + 35).stroke();
  doc.undash();

  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text('Stockist Godown In-Charge', 50, y + 40);
  doc.text('Driver / Vehicle Transporter', 230, y + 40);
  doc.text('Retailer Receiving Stamp', 400, y + 40);

  doc.end();
  return doc;
}

/**
 * 3. Dispatched Delivery Challan (Stage-Specific Split Receipt)
 */
function generateDispatchedChallan(dispatch) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  drawCorporateHeader(doc, 'DISPATCH DELIVERY CHALLAN', 'Stage 1: Dispatched Goods Delivery Note');

  let y = 82;

  // Metadata Box
  doc.rect(50, y, 500, 75).strokeColor('#E5E7EB').fillAndStroke('#F0FDF4', '#86EFAC'); // Light green
  doc.fillColor('#166534').font('Helvetica-Bold').fontSize(9).text('DISPATCH IDENTIFICATION', 60, y + 8);

  doc.fillColor('#333333').font('Helvetica').fontSize(8.5);
  doc.text(`Challan Number: ${dispatch.dispatchNumber}`, 60, y + 23);
  doc.text(`Original Order No: ${dispatch.order?.orderNumber}`, 60, y + 37);
  doc.text(`Dispatch Date & Time: ${formatDate(dispatch.dispatchedAt)}`, 60, y + 51);

  doc.text(`Vehicle Number: ${dispatch.vehicleNo || 'N/A'}`, 300, y + 23);
  doc.text(`Driver Contact: ${dispatch.driverContact || 'N/A'}`, 300, y + 37);
  doc.text(`Dispatch Mode: ${dispatch.dispatchType}`, 300, y + 51);

  y += 85;

  // Consignee Box
  doc.rect(50, y, 500, 50).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');
  doc.fillColor('#0087CF').font('Helvetica-Bold').fontSize(8.5).text('CONSIGNEE (RETAILER)', 60, y + 8);
  doc.fillColor('#111827').font('Helvetica').fontSize(8);
  doc.text(`${dispatch.order?.retailer?.firmName} | Prop: ${dispatch.order?.retailer?.ownerName} | Mobile: ${dispatch.order?.retailer?.mobileNumber}`, 60, y + 21);
  doc.text(`Destination Site: ${dispatch.order?.deliveryLocation}`, 60, y + 33, { width: 480 });

  y += 60;

  // Dispatched Items Table
  doc.rect(50, y, 500, 20).fill('#15803D');
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
  doc.text('#', 55, y + 6);
  doc.text('Product Description', 75, y + 6);
  doc.text('Ordered', 280, y + 6);
  doc.text('Dispatched Now', 340, y + 6);
  doc.text('Unit Rate', 430, y + 6);
  doc.text('Dispatched Value (₹)', 480, y + 6, { align: 'right', width: 65 });

  y += 20;

  let items = [];
  try {
    items = JSON.parse(dispatch.dispatchedItemsJson || '[]');
  } catch (e) {
    items = [];
  }

  doc.font('Helvetica').fontSize(8);
  items.forEach((item, index) => {
    doc.fillColor('#111827');
    doc.text((index + 1).toString(), 55, y + 5);
    doc.text(item.productName, 75, y + 5, { width: 195 });
    doc.text((item.ordered || 0).toString(), 280, y + 5);
    doc.fillColor('#15803D').font('Helvetica-Bold').text((item.dispatched || 0).toString(), 340, y + 5);
    doc.font('Helvetica').fillColor('#111827');
    doc.text(`₹ ${Number(item.rate || 0).toFixed(2)}`, 430, y + 5);
    doc.text(`₹ ${Number(item.amount || 0).toFixed(2)}`, 480, y + 5, { align: 'right', width: 65 });

    y += 20;
  });

  doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  y += 10;

  // Financial Split Banner
  doc.rect(50, y, 500, 50).fill('#F0FDF4');
  doc.fillColor('#15803D').font('Helvetica-Bold').fontSize(9.5);
  doc.text(`Dispatched Bill Amount (Incl. GST): ${formatCurrency(dispatch.dispatchedBillAmount)}`, 60, y + 12);

  doc.fillColor('#B45309').font('Helvetica').fontSize(8.5);
  doc.text(`Remaining Pending Bill Amount: ${formatCurrency(dispatch.pendingBillAmount)}`, 60, y + 28);
  doc.text(`Total Order Value: ${formatCurrency(dispatch.order?.grandTotal)}`, 350, y + 28);

  y += 75;

  // Signatures
  doc.strokeColor('#9CA3AF').lineWidth(0.5).dash(3, { space: 3 });
  doc.moveTo(50, y + 35).lineTo(180, y + 35).stroke();
  doc.moveTo(400, y + 35).lineTo(540, y + 35).stroke();
  doc.undash();

  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text('Delivered By (Driver / Transporter)', 50, y + 40);
  doc.text('Received in Good Condition (Retailer)', 400, y + 40);

  doc.end();
  return doc;
}

/**
 * 4. Pending Balance Slip (Stage-Specific Split Receipt)
 */
function generatePendingSlip(dispatch) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  drawCorporateHeader(doc, 'PENDING BACKORDER SLIP', 'Stage 2: Pending Items & Balance Due Note');

  let y = 82;

  // Metadata Box
  doc.rect(50, y, 500, 75).strokeColor('#E5E7EB').fillAndStroke('#FEF2F2', '#FCA5A5'); // Light red/pink
  doc.fillColor('#B91C1C').font('Helvetica-Bold').fontSize(9).text('PENDING FULFILLMENT STATUS', 60, y + 8);

  doc.fillColor('#333333').font('Helvetica').fontSize(8.5);
  doc.text(`Dispatch Reference: ${dispatch.dispatchNumber}`, 60, y + 23);
  doc.text(`Parent Order No: ${dispatch.order?.orderNumber}`, 60, y + 37);
  doc.text(`Date of Assessment: ${formatDate(dispatch.dispatchedAt)}`, 60, y + 51);

  doc.text(`Total Order Value: ${formatCurrency(dispatch.order?.grandTotal)}`, 300, y + 23);
  doc.text(`Dispatched So Far: ${formatCurrency(dispatch.dispatchedBillAmount)}`, 300, y + 37);
  doc.fillColor('#B91C1C').font('Helvetica-Bold').text(`Pending Balance: ${formatCurrency(dispatch.pendingBillAmount)}`, 300, y + 51);

  y += 85;

  // Reason Banner
  doc.rect(50, y, 500, 35).fill('#FFFBEB');
  doc.fillColor('#92400E').font('Helvetica-Bold').fontSize(8).text('REASON FOR PENDING / PARTIAL DISPATCH:', 60, y + 8);
  doc.font('Helvetica').fontSize(8).text(dispatch.reason || 'Plant stock allocation / vehicle capacity limit.', 60, y + 20, { width: 480 });

  y += 45;

  // Pending Items Table
  doc.rect(50, y, 500, 20).fill('#DC2626');
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
  doc.text('#', 55, y + 6);
  doc.text('Pending Product Description', 75, y + 6);
  doc.text('Ordered Qty', 280, y + 6);
  doc.text('Pending Qty', 350, y + 6);
  doc.text('Unit Rate', 420, y + 6);
  doc.text('Pending Value (₹)', 480, y + 6, { align: 'right', width: 65 });

  y += 20;

  let pendingItems = [];
  try {
    pendingItems = JSON.parse(dispatch.pendingItemsJson || '[]');
  } catch (e) {
    pendingItems = [];
  }

  doc.font('Helvetica').fontSize(8);
  pendingItems.forEach((item, index) => {
    doc.fillColor('#111827');
    doc.text((index + 1).toString(), 55, y + 5);
    doc.text(item.productName, 75, y + 5, { width: 195 });
    doc.text((item.ordered || 0).toString(), 280, y + 5);
    doc.fillColor('#DC2626').font('Helvetica-Bold').text((item.pending || 0).toString(), 350, y + 5);
    doc.font('Helvetica').fillColor('#111827');
    doc.text(`₹ ${Number(item.rate || 0).toFixed(2)}`, 420, y + 5);
    doc.text(`₹ ${Number(item.amount || 0).toFixed(2)}`, 480, y + 5, { align: 'right', width: 65 });

    y += 20;
  });

  doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  y += 10;

  // Priority Note
  doc.rect(50, y, 500, 45).fill('#F9FAFB');
  doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8).text('Action Advisory:', 60, y + 8);
  doc.font('Helvetica').fontSize(7.5).fillColor('#6B7280');
  doc.text('This pending quantity is held in high-priority backorder status at the regional depot. Once next batch is unloaded, priority delivery challan will be issued without additional delivery surcharges.', 60, y + 20, { width: 480 });

  y += 65;

  doc.strokeColor('#9CA3AF').lineWidth(0.5).dash(3, { space: 3 });
  doc.moveTo(50, y + 35).lineTo(180, y + 35).stroke();
  doc.moveTo(400, y + 35).lineTo(540, y + 35).stroke();
  doc.undash();

  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text('Warehouse Supply Officer', 50, y + 40);
  doc.text('Territory Manager Authorization', 400, y + 40);

  doc.end();
  return doc;
}

/**
 * 5. Payment Receipt Generator
 */
function generatePaymentReceipt(payment) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  drawCorporateHeader(doc, 'OFFICIAL PAYMENT RECEIPT', 'Birla White Finance & Accounts');

  let y = 82;

  // Receipt Box
  doc.rect(50, y, 500, 105).strokeColor('#E5E7EB').fillAndStroke('#F9FAFB', '#D1D5DB');
  doc.fillColor('#A02225').font('Helvetica-Bold').fontSize(10).text('RECEIPT PARTICULARS', 60, y + 8);

  doc.fillColor('#333333').font('Helvetica').fontSize(8.5);
  doc.text(`Receipt Number: ${payment.receiptNumber}`, 60, y + 25);
  doc.text(`Payment Date: ${formatDate(payment.transactionDate)}`, 60, y + 40);
  doc.text(`Payment Mode: ${payment.paymentMode}`, 60, y + 55);
  if (payment.paymentMode === 'Cheque' && payment.chequeDate) {
    doc.text(`Cheque Date: ${formatDate(payment.chequeDate)}`, 60, y + 70);
  } else {
    doc.text(`Reference / UTR No: ${payment.referenceNo || 'Direct Entry'}`, 60, y + 70);
  }

  doc.text(`Linked Order: ${payment.order?.orderNumber || 'Running Account Ledger'}`, 300, y + 25);
  doc.text(`Collected / Recorded By: ${payment.recordedBy || 'Suraj (PZ7550)'}`, 300, y + 40);

  y += 120;

  // Retailer (Payer)
  doc.rect(50, y, 500, 60).strokeColor('#E5E7EB').fillAndStroke('#EFF6FF', '#93C5FD');
  doc.fillColor('#1D4ED8').font('Helvetica-Bold').fontSize(9).text('RECEIVED WITH THANKS FROM:', 60, y + 8);
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9).text(payment.retailer?.firmName || 'Retailer', 60, y + 23);
  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text(`Proprietor: ${payment.retailer?.ownerName} | Mobile: ${payment.retailer?.mobileNumber} | GSTIN: ${payment.retailer?.gstNumber}`, 60, y + 36);
  doc.text(`Location: ${payment.retailer?.locality}, ${payment.retailer?.tehsil}, ${payment.retailer?.district} - ${payment.retailer?.pincode}`, 60, y + 48);

  y += 75;

  // Payment Amount Highlight Banner
  doc.rect(50, y, 500, 60).fill('#0087CF');
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(12);
  doc.text('AMOUNT RECEIVED:', 65, y + 15);
  doc.fontSize(16).text(formatCurrency(payment.amountPaid), 250, y + 13, { align: 'right', width: 280 });

  doc.fontSize(8.5).font('Helvetica-Oblique').text(`Remaining Balance Due: ${formatCurrency(payment.balanceRemaining)}`, 65, y + 38);

  y += 75;

  if (payment.notes) {
    doc.rect(50, y, 500, 35).fill('#F9FAFB');
    doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8).text('Remarks / Notes:', 60, y + 6);
    doc.font('Helvetica').fontSize(8).text(payment.notes, 60, y + 18, { width: 480 });
    y += 45;
  }

  // Signatures
  y += 20;
  doc.strokeColor('#9CA3AF').lineWidth(0.5).dash(3, { space: 3 });
  doc.moveTo(50, y + 35).lineTo(180, y + 35).stroke();
  doc.moveTo(400, y + 35).lineTo(540, y + 35).stroke();
  doc.undash();

  doc.fillColor('#4B5563').font('Helvetica').fontSize(8);
  doc.text('Payer Signature / Stamp', 50, y + 40);
  doc.text('Authorized Receiver (Birla White)', 400, y + 40);

  doc.end();
  return doc;
}

module.exports = {
  formatCurrency,
  formatDate,
  generateRetailerReceipt,
  generateStockistReceipt,
  generateDispatchedChallan,
  generatePendingSlip,
  generatePaymentReceipt
};
