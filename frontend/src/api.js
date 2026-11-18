// Unified API client with automatic LocalStorage / In-Memory Mock Fallback
// When deployed on static GitHub Pages, it smoothly handles all ERP data, full CRUD,
// live GST calculations, and dual-receipt previews right in the browser!

const BASE_URL = '/api';

// Initial Seed Data for Himachal Pradesh (Mandi, Sundernagar, Joginder Nagar)
const initialStockists = [
  {
    id: 1,
    firmName: 'Mandi Valley Building Materials & Cement Depot',
    gstNumber: '02AAACM4455H1Z3',
    ownerName: 'Sunil Sen',
    mobileNumber: '9816012345',
    district: 'Mandi',
    tehsil: 'Sundernagar',
    subTehsil: 'Nihri',
    locality: 'Bhojpur Bazaar, Near NH-21',
    pincode: '175002',
    status: 'Active',
    creditLimit: 2500000,
    creditDays: 45
  },
  {
    id: 2,
    firmName: 'Beas Traders & Hardware Solutions',
    gstNumber: '02AABCT6677J1Z6',
    ownerName: 'Rajeev Kapoor',
    mobileNumber: '9816023456',
    district: 'Mandi',
    tehsil: 'Mandi Sadar',
    subTehsil: 'Kotli',
    locality: 'Indira Market / Near Old Bus Stand',
    pincode: '175001',
    status: 'Active',
    creditLimit: 3000000,
    creditDays: 45
  },
  {
    id: 3,
    firmName: 'Dhauladhar Building Store & Putty Hub',
    gstNumber: '02AABCD8899K1Z9',
    ownerName: 'Vipin Thakur',
    mobileNumber: '9816034567',
    district: 'Mandi',
    tehsil: 'Joginder Nagar',
    subTehsil: 'Chauntra',
    locality: 'Main Chowk, Pathankot-Mandi Highway',
    pincode: '175015',
    status: 'Active',
    creditLimit: 2000000,
    creditDays: 30
  }
];

const initialRetailers = [
  {
    id: 1,
    firmName: 'Sharma Paint & Sanitary Store',
    gstNumber: '02AAFPS1122B1Z1',
    ownerName: 'Ramesh Sharma',
    mobileNumber: '9816055501',
    district: 'Mandi',
    tehsil: 'Sundernagar',
    subTehsil: 'Sundernagar Urban',
    locality: 'Cinema Chowk, Model Town',
    pincode: '175019',
    primaryStockistId: 1,
    status: 'Active',
    creditLimit: 500000,
    creditDays: 30
  },
  {
    id: 2,
    firmName: 'Himalayan Hardware & Color Point',
    gstNumber: '02AABCH3344C1Z4',
    ownerName: 'Kuldeep Verma',
    mobileNumber: '9816055502',
    district: 'Mandi',
    tehsil: 'Balh',
    subTehsil: 'Ner Chowk',
    locality: 'Main Medical College Road, Ner Chowk',
    pincode: '175008',
    primaryStockistId: 1,
    status: 'Active',
    creditLimit: 400000,
    creditDays: 30
  },
  {
    id: 3,
    firmName: 'Joginder Nagar Paint House',
    gstNumber: '02AADCP5566D1Z7',
    ownerName: 'Pankaj Jamwal',
    mobileNumber: '9816055503',
    district: 'Mandi',
    tehsil: 'Joginder Nagar',
    subTehsil: 'Joginder Nagar Rural',
    locality: 'Railway Station Road',
    pincode: '175015',
    primaryStockistId: 3,
    status: 'Active',
    creditLimit: 350000,
    creditDays: 25
  },
  {
    id: 4,
    firmName: 'Hill View Decor & Hardware',
    gstNumber: '02AABCH7788E1Z0',
    ownerName: 'Anil Kumar',
    mobileNumber: '9816055504',
    district: 'Mandi',
    tehsil: 'Mandi Sadar',
    subTehsil: 'Pandoh',
    locality: 'Main Bazaar Pandoh Dam Road',
    pincode: '175124',
    primaryStockistId: 2,
    status: 'Active',
    creditLimit: 300000,
    creditDays: 21
  },
  {
    id: 5,
    firmName: 'Sarkaghat Building Solutions',
    gstNumber: '02AAECS9900F1Z2',
    ownerName: 'Ajay Guleria',
    mobileNumber: '9816055505',
    district: 'Mandi',
    tehsil: 'Sarkaghat',
    subTehsil: 'Baldwara',
    locality: 'Bus Stand Road',
    pincode: '175024',
    primaryStockistId: 2,
    status: 'Active',
    creditLimit: 450000,
    creditDays: 30
  }
];

const initialProducts = [
  {
    id: 1,
    name: 'Birla White WallCare Putty (40 Kg Bag)',
    category: 'Wall Putty',
    unitType: 'Bag',
    unitWeight: 40,
    weightUnit: 'Kg',
    referencePrice: 980.0,
    hsnCode: '32141000',
    gstRate: 18.0,
    inStockQty: 1500,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Birla White WallCare Putty (20 Kg Bag)',
    category: 'Wall Putty',
    unitType: 'Bag',
    unitWeight: 20,
    weightUnit: 'Kg',
    referencePrice: 510.0,
    hsnCode: '32141000',
    gstRate: 18.0,
    inStockQty: 900,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Birla White WallCare Putty (5 Kg Bag)',
    category: 'Wall Putty',
    unitType: 'Bag',
    unitWeight: 5,
    weightUnit: 'Kg',
    referencePrice: 145.0,
    hsnCode: '32141000',
    gstRate: 18.0,
    inStockQty: 600,
    status: 'Active'
  },
  {
    id: 4,
    name: 'Birla White White Portland Cement (50 Kg Bag)',
    category: 'White Cement',
    unitType: 'Bag',
    unitWeight: 50,
    weightUnit: 'Kg',
    referencePrice: 1250.0,
    hsnCode: '25232100',
    gstRate: 28.0,
    inStockQty: 850,
    status: 'Active'
  },
  {
    id: 5,
    name: 'Birla White White Portland Cement (25 Kg Bag)',
    category: 'White Cement',
    unitType: 'Bag',
    unitWeight: 25,
    weightUnit: 'Kg',
    referencePrice: 660.0,
    hsnCode: '25232100',
    gstRate: 28.0,
    inStockQty: 700,
    status: 'Active'
  },
  {
    id: 6,
    name: 'Birla White Levelplast Water-Resistant Putty (30 Kg Bag)',
    category: 'Waterproofing Putty',
    unitType: 'Bag',
    unitWeight: 30,
    weightUnit: 'Kg',
    referencePrice: 720.0,
    hsnCode: '32141000',
    gstRate: 18.0,
    inStockQty: 450,
    status: 'Active'
  },
  {
    id: 7,
    name: 'Birla White Textura Spray Finish (25 Kg Bag)',
    category: 'Textures',
    unitType: 'Bag',
    unitWeight: 25,
    weightUnit: 'Kg',
    referencePrice: 890.0,
    hsnCode: '32141000',
    gstRate: 18.0,
    inStockQty: 320,
    status: 'Active'
  },
  {
    id: 8,
    name: 'Birla White Extocare Primer (20 Ltr Bucket)',
    category: 'Primers & Paints',
    unitType: 'Bucket',
    unitWeight: 20,
    weightUnit: 'Ltr',
    referencePrice: 2150.0,
    hsnCode: '32091000',
    gstRate: 18.0,
    inStockQty: 380,
    status: 'Active'
  },
  {
    id: 9,
    name: 'Birla White Extocare Primer (10 Ltr Bucket)',
    category: 'Primers & Paints',
    unitType: 'Bucket',
    unitWeight: 10,
    weightUnit: 'Ltr',
    referencePrice: 1140.0,
    hsnCode: '32091000',
    gstRate: 18.0,
    inStockQty: 250,
    status: 'Active'
  },
  {
    id: 10,
    name: 'Birla White PrimaCoat Cement Primer (20 Ltr Bucket)',
    category: 'Primers & Paints',
    unitType: 'Bucket',
    unitWeight: 20,
    weightUnit: 'Ltr',
    referencePrice: 1850.0,
    hsnCode: '32091000',
    gstRate: 18.0,
    inStockQty: 400,
    status: 'Active'
  },
  {
    id: 11,
    name: 'Birla White Bio-Shield Anti-Fungal Putty (10 Ltr Bucket)',
    category: 'Wall Putty',
    unitType: 'Bucket',
    unitWeight: 10,
    weightUnit: 'Ltr',
    referencePrice: 1280.0,
    hsnCode: '32141000',
    gstRate: 18.0,
    inStockQty: 210,
    status: 'Active'
  },
  {
    id: 12,
    name: 'Birla White Grout Master Tile Grout (5 Kg Box)',
    category: 'Adhesives & Grouts',
    unitType: 'Box',
    unitWeight: 5,
    weightUnit: 'Kg',
    referencePrice: 320.0,
    hsnCode: '38245090',
    gstRate: 18.0,
    inStockQty: 500,
    status: 'Active'
  },
  {
    id: 13,
    name: 'Birla White Texture Roller Kit (PCS)',
    category: 'Accessories',
    unitType: 'PCS',
    unitWeight: 0.8,
    weightUnit: 'Kg',
    referencePrice: 450.0,
    hsnCode: '82055900',
    gstRate: 18.0,
    inStockQty: 180,
    status: 'Active'
  },
  {
    id: 14,
    name: 'Birla White Site Bulk Silo Tanker Blend (MT)',
    category: 'White Cement',
    unitType: 'Manual',
    manualUnitName: 'Metric Ton (MT)',
    unitWeight: 1000,
    weightUnit: 'Kg',
    referencePrice: 19800.0,
    hsnCode: '25232100',
    gstRate: 28.0,
    inStockQty: 30,
    status: 'Active'
  }
];

const initialOrders = [
  {
    id: 1,
    orderNumber: 'BW-ORD-2026-001',
    stockistId: 1,
    retailerId: 1,
    orderDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    deliveryLocation: 'Cinema Chowk Commercial Complex Site, Sundernagar, Mandi',
    deliveryContactPerson: 'Vikram Sharma',
    deliveryContactMobile: '9816088811',
    deliveryDate: new Date().toISOString(),
    deliveryStatus: 'Delivered',
    state: 'Active',
    fulfillmentStatus: 'Full',
    createdBy: 'Suraj (PZ7550)',
    createdMobile: '8219796922',
    createdEmail: 'suraj-v@adityabirla.com',
    createdCompany: 'UltraTech Cement Ltd. - Unit Birla White',
    subtotal: 108350.0,
    gstTotal: 19503.0,
    grandTotal: 127853.0,
    dispatchedAmount: 127853.0,
    pendingAmount: 0.0,
    totalPaidAmount: 127853.0,
    balanceDueAmount: 0.0,
    remarks: 'Full dispatch completed for Sundernagar commercial project.',
    items: [
      {
        id: 1,
        productId: 1,
        productName: 'Birla White WallCare Putty (40 Kg Bag)',
        unitType: 'Bag',
        unitWeight: 40,
        weightUnit: 'Kg',
        catalogueReferencePrice: 980.0,
        manualUnitRate: 940.0,
        orderedQty: 100,
        dispatchedQty: 100,
        pendingQty: 0,
        gstRate: 18.0,
        lineSubtotal: 94000.0,
        lineGst: 16920.0,
        lineTotal: 110920.0
      },
      {
        id: 2,
        productId: 8,
        productName: 'Birla White Extocare Primer (20 Ltr Bucket)',
        unitType: 'Bucket',
        unitWeight: 20,
        weightUnit: 'Ltr',
        catalogueReferencePrice: 2150.0,
        manualUnitRate: 2050.0,
        orderedQty: 7,
        dispatchedQty: 7,
        pendingQty: 0,
        gstRate: 18.0,
        lineSubtotal: 14350.0,
        lineGst: 2583.0,
        lineTotal: 16933.0
      }
    ],
    dispatchRecords: [
      {
        id: 1,
        dispatchNumber: 'BW-DSP-2026-001',
        dispatchType: 'Full',
        reason: null,
        dispatchedBillAmount: 127853.0,
        pendingBillAmount: 0.0,
        dispatchedItemsJson: JSON.stringify([
          { productName: 'Birla White WallCare Putty (40 Kg Bag)', ordered: 100, dispatched: 100, pending: 0, rate: 940, amount: 110920 },
          { productName: 'Birla White Extocare Primer (20 Ltr Bucket)', ordered: 7, dispatched: 7, pending: 0, rate: 2050, amount: 16933 }
        ]),
        pendingItemsJson: JSON.stringify([]),
        vehicleNo: 'HP-31-B-4412',
        driverContact: '9816099112',
        dispatchedAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ]
  },
  {
    id: 2,
    orderNumber: 'BW-ORD-2026-002',
    stockistId: 1,
    retailerId: 2,
    orderDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    deliveryLocation: 'Ner Chowk Medical College Road Depot, Distt. Mandi',
    deliveryContactPerson: 'Sanjay Verma',
    deliveryContactMobile: '9816077722',
    deliveryDate: null,
    deliveryStatus: 'Pending',
    state: 'Active',
    fulfillmentStatus: 'Partial',
    partialReason: 'Transport vehicle load limit reached. Remaining 60 bags of Putty scheduled for next delivery.',
    createdBy: 'Suraj (PZ7550)',
    createdMobile: '8219796922',
    createdEmail: 'suraj-v@adityabirla.com',
    createdCompany: 'UltraTech Cement Ltd. - Unit Birla White',
    subtotal: 174750.0,
    gstTotal: 35055.0,
    grandTotal: 209805.0,
    dispatchedAmount: 132455.0,
    pendingAmount: 77350.0,
    totalPaidAmount: 50000.0,
    balanceDueAmount: 159805.0,
    remarks: 'Staggered delivery approved by Territory Officer.',
    items: [
      {
        id: 3,
        productId: 1,
        productName: 'Birla White WallCare Putty (40 Kg Bag)',
        unitType: 'Bag',
        unitWeight: 40,
        weightUnit: 'Kg',
        catalogueReferencePrice: 980.0,
        manualUnitRate: 925.0,
        orderedQty: 150,
        dispatchedQty: 90,
        pendingQty: 60,
        gstRate: 18.0,
        lineSubtotal: 138750.0,
        lineGst: 24975.0,
        lineTotal: 163725.0
      },
      {
        id: 4,
        productId: 4,
        productName: 'Birla White White Portland Cement (50 Kg Bag)',
        unitType: 'Bag',
        unitWeight: 50,
        weightUnit: 'Kg',
        catalogueReferencePrice: 1250.0,
        manualUnitRate: 1200.0,
        orderedQty: 30,
        dispatchedQty: 30,
        pendingQty: 0,
        gstRate: 28.0,
        lineSubtotal: 36000.0,
        lineGst: 10080.0,
        lineTotal: 46080.0
      }
    ],
    dispatchRecords: [
      {
        id: 2,
        dispatchNumber: 'BW-DSP-2026-002',
        dispatchType: 'Partial',
        reason: 'Transport vehicle load limit reached. Remaining 60 bags of Putty scheduled for next delivery.',
        dispatchedBillAmount: 132455.0,
        pendingBillAmount: 77350.0,
        dispatchedItemsJson: JSON.stringify([
          { productName: 'Birla White WallCare Putty (40 Kg Bag)', ordered: 150, dispatched: 90, pending: 60, rate: 925, amount: 98235 },
          { productName: 'Birla White White Portland Cement (50 Kg Bag)', ordered: 30, dispatched: 30, pending: 0, rate: 1200, amount: 46080 }
        ]),
        pendingItemsJson: JSON.stringify([
          { productName: 'Birla White WallCare Putty (40 Kg Bag)', ordered: 150, dispatched: 90, pending: 60, rate: 925, amount: 65490 }
        ]),
        vehicleNo: 'HP-33-C-9812',
        driverContact: '9816033441',
        dispatchedAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ]
  },
  {
    id: 3,
    orderNumber: 'BW-ORD-2026-003',
    stockistId: 2,
    retailerId: 4,
    orderDate: new Date(Date.now() - 86400000 * 48).toISOString(), // 48 days ago -> Overdue by 27 days
    deliveryLocation: 'Hill View Godown, Pandoh Dam Colony, Mandi',
    deliveryContactPerson: 'Anil Kumar',
    deliveryContactMobile: '9816055504',
    deliveryDate: new Date(Date.now() - 86400000 * 45).toISOString(),
    deliveryStatus: 'Delivered',
    state: 'Active',
    fulfillmentStatus: 'Full',
    createdBy: 'Suraj (PZ7550)',
    createdMobile: '8219796922',
    createdEmail: 'suraj-v@adityabirla.com',
    createdCompany: 'UltraTech Cement Ltd. - Unit Birla White',
    subtotal: 92000.0,
    gstTotal: 16560.0,
    grandTotal: 108560.0,
    dispatchedAmount: 108560.0,
    pendingAmount: 0.0,
    totalPaidAmount: 0.0,
    balanceDueAmount: 108560.0,
    remarks: 'Payment delayed due to site contractor bill processing.',
    items: [
      {
        id: 5,
        productId: 1,
        productName: 'Birla White WallCare Putty (40 Kg Bag)',
        unitType: 'Bag',
        unitWeight: 40,
        weightUnit: 'Kg',
        catalogueReferencePrice: 980.0,
        manualUnitRate: 920.0,
        orderedQty: 100,
        dispatchedQty: 100,
        pendingQty: 0,
        gstRate: 18.0,
        lineSubtotal: 92000.0,
        lineGst: 16560.0,
        lineTotal: 108560.0
      }
    ]
  }
];

const initialPayments = [
  {
    id: 1,
    receiptNumber: 'BW-REC-2026-001',
    retailerId: 1,
    orderId: 1,
    amountPaid: 127853.0,
    balanceRemaining: 0.0,
    transactionDate: new Date(Date.now() - 86400000 * 8).toISOString(),
    paymentMode: 'UPI',
    referenceNo: 'UPI/9816055501/778844',
    notes: 'Full payment received through UPI scan at shop.',
    recordedBy: 'Suraj (PZ7550)'
  },
  {
    id: 2,
    receiptNumber: 'BW-REC-2026-002',
    retailerId: 2,
    orderId: 2,
    amountPaid: 50000.0,
    balanceRemaining: 159805.0,
    transactionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    paymentMode: 'Cheque',
    chequeDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    referenceNo: 'CHQ-889124',
    notes: 'Advance cheque handed over to Suraj (PZ7550).',
    recordedBy: 'Suraj (PZ7550)'
  }
];

const initialPjpVisits = [
  {
    id: 1,
    retailerId: 1,
    salesOfficer: 'Suraj (PZ7550)',
    visitDate: new Date().toISOString(),
    district: 'Mandi',
    tehsil: 'Sundernagar',
    locality: 'Cinema Chowk',
    status: 'Completed',
    notes: 'Met Ramesh ji. Discussed WallCare Putty secondary sales & collected full UPI payment.',
    orderBookedAmount: 127853.0,
    paymentCollectedAmount: 127853.0
  },
  {
    id: 2,
    retailerId: 2,
    salesOfficer: 'Suraj (PZ7550)',
    visitDate: new Date().toISOString(),
    district: 'Mandi',
    tehsil: 'Balh / Ner Chowk',
    locality: 'Ner Chowk Market',
    status: 'Completed',
    notes: 'Inspected stock level for Ner Chowk hospital project; took cheque for ₹50,000.',
    orderBookedAmount: 209805.0,
    paymentCollectedAmount: 50000.0
  },
  {
    id: 3,
    retailerId: 3,
    salesOfficer: 'Suraj (PZ7550)',
    visitDate: new Date(Date.now() + 86400000).toISOString(),
    district: 'Mandi',
    tehsil: 'Joginder Nagar',
    locality: 'Railway Station Road',
    status: 'Scheduled',
    notes: 'Planned visit for seasonal stock booking and Extocare Primer sample kit display.',
    orderBookedAmount: 0.0,
    paymentCollectedAmount: 0.0
  },
  {
    id: 4,
    retailerId: 4,
    salesOfficer: 'Suraj (PZ7550)',
    visitDate: new Date(Date.now() + 86400000).toISOString(),
    district: 'Mandi',
    tehsil: 'Mandi Sadar',
    locality: 'Pandoh Bazaar',
    status: 'Scheduled',
    notes: 'Follow-up on overdue invoice BW-ORD-2026-003 balance ₹1,08,560.',
    orderBookedAmount: 0.0,
    paymentCollectedAmount: 0.0
  }
];

// LocalStorage Helper
function getLocal(key, initial) {
  try {
    const stored = localStorage.getItem(`bw_erp_${key}`);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return initial;
}

function setLocal(key, value) {
  try {
    localStorage.setItem(`bw_erp_${key}`, JSON.stringify(value));
  } catch (e) {}
}

// In-Memory Database store with LocalStorage persistence
let dbStockists = getLocal('stockists', initialStockists);
let dbRetailers = getLocal('retailers', initialRetailers);
let dbProducts = getLocal('products', initialProducts);
let dbOrders = getLocal('orders', initialOrders);
let dbPayments = getLocal('payments', initialPayments);
let dbPjpVisits = getLocal('pjp', initialPjpVisits);

// Hydrate orders with retailer & stockist object relations
function hydrateOrder(o) {
  return {
    ...o,
    retailer: dbRetailers.find((r) => r.id === o.retailerId),
    stockist: dbStockists.find((s) => s.id === o.stockistId),
    items: o.items || []
  };
}

export const api = {
  // Stockists
  getStockists: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/stockists${query ? `?${query}` : ''}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback
    let result = [...dbStockists];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.firmName.toLowerCase().includes(q) ||
          s.ownerName.toLowerCase().includes(q) ||
          s.gstNumber.toLowerCase().includes(q) ||
          s.locality.toLowerCase().includes(q)
      );
    }
    if (params.status && params.status !== 'All') {
      result = result.filter((s) => s.status === params.status);
    }
    if (params.district && params.district !== 'All') {
      result = result.filter((s) => s.district.toLowerCase() === params.district.toLowerCase());
    }
    return result;
  },

  createStockist: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/stockists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const newStockist = {
      id: Date.now(),
      ...data,
      creditLimit: parseFloat(data.creditLimit || 1500000),
      creditDays: parseInt(data.creditDays || 45)
    };
    dbStockists = [newStockist, ...dbStockists];
    setLocal('stockists', dbStockists);
    return newStockist;
  },

  updateStockist: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/stockists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbStockists = dbStockists.map((s) => (s.id === parseInt(id) ? { ...s, ...data } : s));
    setLocal('stockists', dbStockists);
    return dbStockists.find((s) => s.id === parseInt(id));
  },

  deleteStockist: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/stockists/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbStockists = dbStockists.filter((s) => s.id !== parseInt(id));
    setLocal('stockists', dbStockists);
    return { message: 'Deleted' };
  },

  // Retailers
  getRetailers: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/retailers${query ? `?${query}` : ''}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    let result = dbRetailers.map((r) => ({
      ...r,
      primaryStockist: dbStockists.find((s) => s.id === r.primaryStockistId)
    }));

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.firmName.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.gstNumber.toLowerCase().includes(q) ||
          r.locality.toLowerCase().includes(q)
      );
    }
    if (params.status && params.status !== 'All') {
      result = result.filter((r) => r.status === params.status);
    }
    if (params.district && params.district !== 'All') {
      result = result.filter((r) => r.district.toLowerCase() === params.district.toLowerCase());
    }
    return result;
  },

  createRetailer: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/retailers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const newRet = {
      id: Date.now(),
      ...data,
      primaryStockistId: data.primaryStockistId ? parseInt(data.primaryStockistId) : null,
      creditLimit: parseFloat(data.creditLimit || 300000),
      creditDays: parseInt(data.creditDays || 30)
    };
    dbRetailers = [newRet, ...dbRetailers];
    setLocal('retailers', dbRetailers);
    return newRet;
  },

  updateRetailer: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/retailers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbRetailers = dbRetailers.map((r) => (r.id === parseInt(id) ? { ...r, ...data } : r));
    setLocal('retailers', dbRetailers);
    return dbRetailers.find((r) => r.id === parseInt(id));
  },

  deleteRetailer: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/retailers/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbRetailers = dbRetailers.filter((r) => r.id !== parseInt(id));
    setLocal('retailers', dbRetailers);
    return { message: 'Deleted' };
  },

  // Products
  getProducts: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/products${query ? `?${query}` : ''}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    let result = [...dbProducts];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.hsnCode.includes(q)
      );
    }
    if (params.category && params.category !== 'All') {
      result = result.filter((p) => p.category === params.category);
    }
    if (params.unitType && params.unitType !== 'All') {
      result = result.filter((p) => p.unitType === params.unitType);
    }
    return result;
  },

  createProduct: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const newProd = {
      id: Date.now(),
      ...data,
      unitWeight: parseFloat(data.unitWeight),
      referencePrice: parseFloat(data.referencePrice),
      gstRate: parseFloat(data.gstRate || 18),
      inStockQty: parseInt(data.inStockQty || 500)
    };
    dbProducts = [newProd, ...dbProducts];
    setLocal('products', dbProducts);
    return newProd;
  },

  updateProduct: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbProducts = dbProducts.map((p) => (p.id === parseInt(id) ? { ...p, ...data } : p));
    setLocal('products', dbProducts);
    return dbProducts.find((p) => p.id === parseInt(id));
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbProducts = dbProducts.filter((p) => p.id !== parseInt(id));
    setLocal('products', dbProducts);
    return { message: 'Deleted' };
  },

  // Orders
  getOrders: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/orders${query ? `?${query}` : ''}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    let result = dbOrders.map(hydrateOrder);
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.retailer?.firmName?.toLowerCase().includes(q) ||
          o.stockist?.firmName?.toLowerCase().includes(q) ||
          o.deliveryLocation?.toLowerCase().includes(q)
      );
    }
    if (params.state && params.state !== 'All') {
      result = result.filter((o) => o.state === params.state);
    }
    if (params.fulfillmentStatus && params.fulfillmentStatus !== 'All') {
      result = result.filter((o) => o.fulfillmentStatus === params.fulfillmentStatus);
    }
    if (params.retailerId && params.retailerId !== 'All') {
      result = result.filter((o) => o.retailerId === parseInt(params.retailerId));
    }
    return result;
  },

  createOrder: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback create order with line items & GST
    const orderNumber = `BW-ORD-2026-00${dbOrders.length + 1}`;
    let subtotal = 0;
    let gstTotal = 0;

    const items = data.items.map((item, idx) => {
      const prd = dbProducts.find((p) => p.id === parseInt(item.productId));
      const rate = parseFloat(item.manualUnitRate);
      const qty = parseInt(item.orderedQty);
      const gstRate = prd?.gstRate || 18.0;
      const lineSub = rate * qty;
      const lineGst = (lineSub * gstRate) / 100;
      const lineTotal = lineSub + lineGst;

      subtotal += lineSub;
      gstTotal += lineGst;

      return {
        id: Date.now() + idx,
        productId: prd?.id || 1,
        productName: prd?.name || 'Birla White WallCare Putty',
        unitType: prd?.unitType || 'Bag',
        unitWeight: prd?.unitWeight || 40,
        weightUnit: prd?.weightUnit || 'Kg',
        catalogueReferencePrice: prd?.referencePrice || rate,
        manualUnitRate: rate,
        orderedQty: qty,
        dispatchedQty: 0,
        pendingQty: qty,
        gstRate,
        lineSubtotal: lineSub,
        lineGst,
        lineTotal
      };
    });

    const grandTotal = subtotal + gstTotal;

    const newOrder = {
      id: Date.now(),
      orderNumber,
      stockistId: parseInt(data.stockistId),
      retailerId: parseInt(data.retailerId),
      orderDate: data.orderDate ? new Date(data.orderDate).toISOString() : new Date().toISOString(),
      deliveryLocation: data.deliveryLocation,
      deliveryContactPerson: data.deliveryContactPerson,
      deliveryContactMobile: data.deliveryContactMobile,
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString() : null,
      deliveryStatus: 'Pending',
      state: 'Active',
      fulfillmentStatus: 'Pending',
      createdBy: data.createdBy || 'Suraj (PZ7550)',
      createdMobile: data.createdMobile || '8219796922',
      createdEmail: data.createdEmail || 'suraj-v@adityabirla.com',
      createdCompany: data.createdCompany || 'UltraTech Cement Ltd. - Unit Birla White',
      subtotal,
      gstTotal,
      grandTotal,
      dispatchedAmount: 0.0,
      pendingAmount: grandTotal,
      totalPaidAmount: 0.0,
      balanceDueAmount: grandTotal,
      remarks: data.remarks || '',
      items,
      dispatchRecords: []
    };

    dbOrders = [newOrder, ...dbOrders];
    setLocal('orders', dbOrders);
    return hydrateOrder(newOrder);
  },

  markOrderDelivered: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/deliver`, { method: 'PUT' });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbOrders = dbOrders.map((o) =>
      o.id === parseInt(id) ? { ...o, deliveryStatus: 'Delivered', deliveryDate: new Date().toISOString() } : o
    );
    setLocal('orders', dbOrders);
    return { message: 'Delivered' };
  },

  deleteOrder: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbOrders = dbOrders.filter((o) => o.id !== parseInt(id));
    setLocal('orders', dbOrders);
    return { message: 'Deleted' };
  },

  // Dispatches
  processDispatch: async (orderId, data) => {
    try {
      const res = await fetch(`${BASE_URL}/dispatches/orders/${orderId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const order = dbOrders.find((o) => o.id === parseInt(orderId));
    if (!order) throw new Error('Order not found');

    let dispatchedBillAmt = 0;
    let pendingBillAmt = 0;
    const dispatchedList = [];
    const pendingList = [];

    const updatedItems = order.items.map((item) => {
      let dispatchNow = 0;
      if (data.dispatchType === 'Full') {
        dispatchNow = item.orderedQty - item.dispatchedQty;
      } else if (data.dispatchType === 'Out of Stock') {
        dispatchNow = 0;
      } else {
        const match = data.itemDispatches?.find((d) => d.orderItemId === item.id);
        dispatchNow = match ? parseInt(match.dispatchedQtyNow) : 0;
      }

      const totalDispatched = item.dispatchedQty + dispatchNow;
      const pendingQty = Math.max(0, item.orderedQty - totalDispatched);
      const rateWithGst = item.manualUnitRate * (1 + (item.gstRate || 18) / 100);

      const dVal = dispatchNow * rateWithGst;
      const pVal = pendingQty * rateWithGst;
      dispatchedBillAmt += dVal;
      pendingBillAmt += pVal;

      if (dispatchNow > 0) {
        dispatchedList.push({ productName: item.productName, ordered: item.orderedQty, dispatched: dispatchNow, rate: item.manualUnitRate, amount: dVal });
      }
      if (pendingQty > 0) {
        pendingList.push({ productName: item.productName, ordered: item.orderedQty, pending: pendingQty, rate: item.manualUnitRate, amount: pVal });
      }

      return {
        ...item,
        dispatchedQty: totalDispatched,
        pendingQty
      };
    });

    const dispatchRecord = {
      id: Date.now(),
      dispatchNumber: `BW-DSP-2026-00${(order.dispatchRecords?.length || 0) + 1}`,
      dispatchType: data.dispatchType,
      reason: data.reason || null,
      dispatchedBillAmount: dispatchedBillAmt,
      pendingBillAmount: pendingBillAmt,
      dispatchedItemsJson: JSON.stringify(dispatchedList),
      pendingItemsJson: JSON.stringify(pendingList),
      vehicleNo: data.vehicleNo || 'HP-31-B-4412',
      driverContact: data.driverContact || '9816099112',
      dispatchedAt: new Date().toISOString()
    };

    const finalFulfillment = pendingBillAmt === 0 ? 'Full' : data.dispatchType;

    dbOrders = dbOrders.map((o) =>
      o.id === parseInt(orderId)
        ? {
            ...o,
            fulfillmentStatus: finalFulfillment,
            partialReason: data.dispatchType === 'Partial' ? data.reason : null,
            dispatchedAmount: o.dispatchedAmount + dispatchedBillAmt,
            pendingAmount: pendingBillAmt,
            items: updatedItems,
            dispatchRecords: [dispatchRecord, ...(o.dispatchRecords || [])]
          }
        : o
    );

    setLocal('orders', dbOrders);
    return { dispatchRecord };
  },

  // Payments & Ledger
  getPayments: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/payments${query ? `?${query}` : ''}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    return dbPayments.map((p) => ({
      ...p,
      retailer: dbRetailers.find((r) => r.id === p.retailerId),
      order: dbOrders.find((o) => o.id === p.orderId)
    }));
  },

  recordPayment: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const amount = parseFloat(data.amountPaid);
    let balanceRemaining = 0;

    if (data.orderId) {
      dbOrders = dbOrders.map((o) => {
        if (o.id === parseInt(data.orderId)) {
          const newPaid = o.totalPaidAmount + amount;
          const newBalance = Math.max(0, o.grandTotal - newPaid);
          balanceRemaining = newBalance;
          return { ...o, totalPaidAmount: newPaid, balanceDueAmount: newBalance };
        }
        return o;
      });
      setLocal('orders', dbOrders);
    }

    const newPayment = {
      id: Date.now(),
      receiptNumber: `BW-REC-2026-00${dbPayments.length + 1}`,
      retailerId: parseInt(data.retailerId),
      orderId: data.orderId ? parseInt(data.orderId) : null,
      amountPaid: amount,
      balanceRemaining,
      transactionDate: data.transactionDate ? new Date(data.transactionDate).toISOString() : new Date().toISOString(),
      paymentMode: data.paymentMode,
      chequeDate: data.paymentMode === 'Cheque' && data.chequeDate ? new Date(data.chequeDate).toISOString() : null,
      referenceNo: data.referenceNo || 'Direct Deposit',
      notes: data.notes || '',
      recordedBy: 'Suraj (PZ7550)'
    };

    dbPayments = [newPayment, ...dbPayments];
    setLocal('payments', dbPayments);
    return newPayment;
  },

  deletePayment: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/payments/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbPayments = dbPayments.filter((p) => p.id !== parseInt(id));
    setLocal('payments', dbPayments);
    return { message: 'Deleted' };
  },

  getLedgerSummary: async () => {
    try {
      const res = await fetch(`${BASE_URL}/payments/ledger/summary`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const today = new Date();
    const ledgerSummary = dbRetailers.map((ret) => {
      const retOrders = dbOrders.filter((o) => o.retailerId === ret.id);
      const retPayments = dbPayments.filter((p) => p.retailerId === ret.id);

      const totalInvoiced = retOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      const totalPaid = retPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const outstandingBalance = Math.max(0, totalInvoiced - totalPaid);

      const creditDays = ret.creditDays || 30;
      let maxOverdueDays = 0;
      let overdueAmount = 0;

      const agedOrders = retOrders
        .filter((o) => o.balanceDueAmount > 0)
        .map((o) => {
          const ordDate = new Date(o.orderDate);
          const diffDays = Math.floor((today - ordDate) / (1000 * 60 * 60 * 24));
          const dueDays = Math.max(0, diffDays - creditDays);

          if (dueDays > 0) overdueAmount += o.balanceDueAmount;
          if (dueDays > maxOverdueDays) maxOverdueDays = dueDays;

          return {
            ...o,
            ageDays: diffDays,
            dueDays,
            isOverdue: dueDays > 0
          };
        });

      return {
        id: ret.id,
        firmName: ret.firmName,
        ownerName: ret.ownerName,
        mobileNumber: ret.mobileNumber,
        gstNumber: ret.gstNumber,
        locality: ret.locality,
        tehsil: ret.tehsil,
        district: ret.district,
        creditLimit: ret.creditLimit,
        creditDays,
        totalInvoiced,
        totalPaid,
        outstandingBalance,
        overdueAmount,
        maxOverdueDays,
        hasOverdue: overdueAmount > 0,
        unpaidOrdersCount: agedOrders.length,
        agedOrders
      };
    });

    const ordersGroupedByCreator = [
      {
        createdBy: 'Suraj (PZ7550)',
        _sum: {
          grandTotal: dbOrders.reduce((s, o) => s + o.grandTotal, 0),
          totalPaidAmount: dbOrders.reduce((s, o) => s + o.totalPaidAmount, 0),
          balanceDueAmount: dbOrders.reduce((s, o) => s + o.balanceDueAmount, 0)
        },
        _count: { id: dbOrders.length }
      }
    ];

    return { ledgerSummary, ordersGroupedByCreator };
  },

  // Analytics
  getDashboardSummary: async () => {
    try {
      const res = await fetch(`${BASE_URL}/analytics/dashboard`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const totalSales = dbOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalDispatchedValue = dbOrders.reduce((sum, o) => sum + o.dispatchedAmount, 0);
    const totalPendingValue = dbOrders.reduce((sum, o) => sum + o.pendingAmount, 0);
    const totalCollected = dbPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalOutstanding = Math.max(0, totalSales - totalCollected);

    const today = new Date();
    let totalOverdueAmount = 0;
    let totalOverdueInvoices = 0;
    const overdueRetailers = [];

    dbRetailers.forEach((ret) => {
      const creditDays = ret.creditDays || 30;
      let retOverdueAmount = 0;
      let maxOverdueDays = 0;
      dbOrders
        .filter((o) => o.retailerId === ret.id && o.balanceDueAmount > 0)
        .forEach((o) => {
          const diffDays = Math.floor((today - new Date(o.orderDate)) / (1000 * 60 * 60 * 24));
          if (diffDays > creditDays) {
            totalOverdueAmount += o.balanceDueAmount;
            totalOverdueInvoices += 1;
            retOverdueAmount += o.balanceDueAmount;
            if (diffDays > maxOverdueDays) maxOverdueDays = diffDays;
          }
        });
      if (retOverdueAmount > 0) {
        overdueRetailers.push({
          retailerId: ret.id,
          retailerName: ret.firmName,
          locality: ret.locality,
          tehsil: ret.tehsil,
          contact: ret.mobileNumber,
          overdueAmount: retOverdueAmount,
          creditDays: ret.creditDays,
          maxDaysOverdue: maxOverdueDays,
          dueDaysBeyondLimit: Math.max(0, maxOverdueDays - creditDays)
        });
      }
    });

    // Monthly Target (e.g. 8 Lakh for Himachal Zone)
    const monthlyTarget = 800000;
    const targetAchievementPct = Math.min(100, Math.round((totalSales / monthlyTarget) * 100));

    const topSellingProducts = [
      { productName: 'Birla White WallCare Putty (40 Kg Bag)', unitType: 'Bag', unitWeight: 40, weightUnit: 'Kg', totalQuantity: 350, totalRevenue: 365565, totalWeightVolume: 14.0, volumeUnit: 'MT' },
      { productName: 'Birla White White Portland Cement (50 Kg Bag)', unitType: 'Bag', unitWeight: 50, weightUnit: 'Kg', totalQuantity: 70, totalRevenue: 104960, totalWeightVolume: 3.5, volumeUnit: 'MT' },
      { productName: 'Birla White Extocare Primer (20 Ltr Bucket)', unitType: 'Bucket', unitWeight: 20, weightUnit: 'Ltr', totalQuantity: 17, totalRevenue: 41713, totalWeightVolume: 340, volumeUnit: 'Ltr' }
    ];

    const salesVsCollectionTrend = [
      { month: 'Aug 26', sales: 75000, collections: 60000 },
      { month: 'Sep 26', sales: 110000, collections: 85000 },
      { month: 'Oct 26', sales: 145000, collections: 127853 },
      { month: 'Nov 26', sales: 218590, collections: 182000 }
    ];

    return {
      kpis: {
        totalSales,
        totalDispatchedValue,
        totalPendingValue,
        totalCollected,
        totalOutstanding,
        totalOverdueAmount,
        totalOverdueInvoices,
        monthlyTarget,
        targetAchievementPct,
        activePjpToday: dbPjpVisits.length
      },
      counts: {
        stockists: dbStockists.length,
        retailers: dbRetailers.length,
        products: dbProducts.length,
        orders: dbOrders.length
      },
      overdueRetailers,
      topSellingProducts,
      salesVsCollectionTrend,
      allOrders: dbOrders.map(hydrateOrder),
      recentOrders: dbOrders.slice(0, 8).map(hydrateOrder),
      pjpVisits: dbPjpVisits.map((v) => ({
        ...v,
        retailer: dbRetailers.find((r) => r.id === v.retailerId)
      }))
    };
  },

  getBiAnalytics: async (timeframe = 'monthly') => {
    try {
      const res = await fetch(`${BASE_URL}/analytics/bi?timeframe=${timeframe}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const totalInvoiced = dbOrders.reduce((s, o) => s + o.grandTotal, 0);
    const totalCollected = dbPayments.reduce((s, p) => s + p.amountPaid, 0);
    const totalDue = Math.max(0, totalInvoiced - totalCollected);

    const modeMap = { Cash: 0, UPI: 0, Cheque: 0, Online: 0 };
    dbPayments.forEach((p) => {
      const m = p.paymentMode || 'UPI';
      modeMap[m] = (modeMap[m] || 0) + p.amountPaid;
    });

    const paymentModesBreakdown = Object.keys(modeMap).map((m) => ({ mode: m, amount: modeMap[m] }));

    const topSellingProducts = [
      { productName: 'Birla White WallCare Putty (40 Kg Bag)', unitType: 'Bag', unitWeight: 40, weightUnit: 'Kg', totalQuantity: 350, totalRevenue: 365565, totalWeightVolume: 14000 },
      { productName: 'Birla White White Portland Cement (50 Kg Bag)', unitType: 'Bag', unitWeight: 50, weightUnit: 'Kg', totalQuantity: 70, totalRevenue: 104960, totalWeightVolume: 3500 },
      { productName: 'Birla White Extocare Primer (20 Ltr Bucket)', unitType: 'Bucket', unitWeight: 20, weightUnit: 'Ltr', totalQuantity: 17, totalRevenue: 41713, totalWeightVolume: 340 }
    ];

    const volumeByUnitType = [
      { unit: 'Bag', quantity: 420 },
      { unit: 'Bucket', quantity: 17 },
      { unit: 'Box', quantity: 35 },
      { unit: 'PCS', quantity: 12 },
      { unit: 'Manual', quantity: 2 }
    ];

    return {
      timeframe,
      periodMetrics: {
        totalInvoiced,
        totalCollected,
        totalDue,
        orderCount: dbOrders.length,
        paymentCount: dbPayments.length
      },
      paymentModesBreakdown,
      topSellingProducts,
      volumeByUnitType,
      salesVsCollectionTrend: [
        { period: 'Sep 26', sales: 90000, collections: 65000 },
        { period: 'Oct 26', sales: 145000, collections: 127853 },
        { period: 'Nov 26', sales: 218590, collections: 50000 }
      ]
    };
  },

  // PJP
  getPjpVisits: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/pjp${query ? `?${query}` : ''}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    let result = dbPjpVisits.map((v) => ({
      ...v,
      retailer: dbRetailers.find((r) => r.id === v.retailerId)
    }));

    if (params.status && params.status !== 'All') {
      result = result.filter((v) => v.status === params.status);
    }
    if (params.tehsil && params.tehsil !== 'All') {
      result = result.filter((v) => v.tehsil.toLowerCase().includes(params.tehsil.toLowerCase()));
    }
    return result;
  },

  createPjpVisit: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/pjp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const newVisit = {
      id: Date.now(),
      ...data,
      retailerId: parseInt(data.retailerId),
      orderBookedAmount: parseFloat(data.orderBookedAmount || 0),
      paymentCollectedAmount: parseFloat(data.paymentCollectedAmount || 0)
    };
    dbPjpVisits = [newVisit, ...dbPjpVisits];
    setLocal('pjp', dbPjpVisits);
    return newVisit;
  },

  updatePjpVisit: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/pjp/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbPjpVisits = dbPjpVisits.map((v) => (v.id === parseInt(id) ? { ...v, ...data } : v));
    setLocal('pjp', dbPjpVisits);
    return dbPjpVisits.find((v) => v.id === parseInt(id));
  },

  deletePjpVisit: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/pjp/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}

    dbPjpVisits = dbPjpVisits.filter((v) => v.id !== parseInt(id));
    setLocal('pjp', dbPjpVisits);
    return { message: 'Deleted' };
  }
};
