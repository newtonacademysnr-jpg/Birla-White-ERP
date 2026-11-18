const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Birla White ERP database with Himachal Pradesh (Mandi, Sundernagar, Joginder Nagar) data...');

  // 1. Clear existing test data cleanly in dependency order
  await prisma.pjpVisit.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.dispatchRecord.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.retailer.deleteMany({});
  await prisma.stockist.deleteMany({});
  await prisma.product.deleteMany({});

  // 2. Insert Stockists (Himachal Pradesh)
  const stockist1 = await prisma.stockist.create({
    data: {
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
    }
  });

  const stockist2 = await prisma.stockist.create({
    data: {
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
    }
  });

  const stockist3 = await prisma.stockist.create({
    data: {
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
  });

  console.log('Stockists created successfully.');

  // 3. Insert Retailers (Himachal Pradesh)
  const retailer1 = await prisma.retailer.create({
    data: {
      firmName: 'Sharma Paint & Sanitary Store',
      gstNumber: '02AAFPS1122B1Z1',
      ownerName: 'Ramesh Sharma',
      mobileNumber: '9816055501',
      district: 'Mandi',
      tehsil: 'Sundernagar',
      subTehsil: 'Sundernagar Urban',
      locality: 'Cinema Chowk, Model Town',
      pincode: '175019',
      primaryStockistId: stockist1.id,
      status: 'Active',
      creditLimit: 500000,
      creditDays: 30
    }
  });

  const retailer2 = await prisma.retailer.create({
    data: {
      firmName: 'Himalayan Hardware & Color Point',
      gstNumber: '02AABCH3344C1Z4',
      ownerName: 'Kuldeep Verma',
      mobileNumber: '9816055502',
      district: 'Mandi',
      tehsil: 'Balh',
      subTehsil: 'Ner Chowk',
      locality: 'Main Medical College Road, Ner Chowk',
      pincode: '175008',
      primaryStockistId: stockist1.id,
      status: 'Active',
      creditLimit: 400000,
      creditDays: 30
    }
  });

  const retailer3 = await prisma.retailer.create({
    data: {
      firmName: 'Joginder Nagar Paint House',
      gstNumber: '02AADCP5566D1Z7',
      ownerName: 'Pankaj Jamwal',
      mobileNumber: '9816055503',
      district: 'Mandi',
      tehsil: 'Joginder Nagar',
      subTehsil: 'Joginder Nagar Rural',
      locality: 'Railway Station Road',
      pincode: '175015',
      primaryStockistId: stockist3.id,
      status: 'Active',
      creditLimit: 350000,
      creditDays: 25
    }
  });

  const retailer4 = await prisma.retailer.create({
    data: {
      firmName: 'Hill View Decor & Hardware',
      gstNumber: '02AABCH7788E1Z0',
      ownerName: 'Anil Kumar',
      mobileNumber: '9816055504',
      district: 'Mandi',
      tehsil: 'Mandi Sadar',
      subTehsil: 'Pandoh',
      locality: 'Main Bazaar Pandoh Dam Road',
      pincode: '175124',
      primaryStockistId: stockist2.id,
      status: 'Active',
      creditLimit: 300000,
      creditDays: 21
    }
  });

  const retailer5 = await prisma.retailer.create({
    data: {
      firmName: 'Sarkaghat Building Solutions',
      gstNumber: '02AAECS9900F1Z2',
      ownerName: 'Ajay Guleria',
      mobileNumber: '9816055505',
      district: 'Mandi',
      tehsil: 'Sarkaghat',
      subTehsil: 'Baldwara',
      locality: 'Bus Stand Road',
      pincode: '175024',
      primaryStockistId: stockist2.id,
      status: 'Active',
      creditLimit: 450000,
      creditDays: 30
    }
  });

  console.log('Retailers created successfully.');

  // 4. Insert Products (Birla White Official Product Range)
  const products = await Promise.all([
    // Bags
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    // Buckets
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
      }
    }),
    // Boxes
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
        name: 'Birla White Grout Master Tile Grout (1 Kg Box)',
        category: 'Adhesives & Grouts',
        unitType: 'Box',
        unitWeight: 1,
        weightUnit: 'Kg',
        referencePrice: 75.0,
        hsnCode: '38245090',
        gstRate: 18.0,
        inStockQty: 750,
        status: 'Active'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Birla White Wall Seal Waterproof Coating (4 Ltr Box)',
        category: 'Waterproofing',
        unitType: 'Box',
        unitWeight: 4,
        weightUnit: 'Ltr',
        referencePrice: 960.0,
        hsnCode: '38244090',
        gstRate: 18.0,
        inStockQty: 310,
        status: 'Active'
      }
    }),
    // PCS & Manual Units
    prisma.product.create({
      data: {
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
      }
    }),
    prisma.product.create({
      data: {
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
    })
  ]);

  console.log('Products created successfully.');

  // 5. Sample Orders with Manual Rate Entry
  // Order 1: Full Dispatch (Delivered)
  const order1Date = new Date();
  order1Date.setDate(order1Date.getDate() - 12);

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'BW-ORD-2026-001',
      stockistId: stockist1.id,
      retailerId: retailer1.id,
      orderDate: order1Date,
      deliveryLocation: 'Cinema Chowk Commercial Complex Site, Sundernagar, Mandi',
      deliveryContactPerson: 'Vikram Sharma',
      deliveryContactMobile: '9816088811',
      deliveryDate: new Date(),
      deliveryStatus: 'Delivered',
      state: 'Active',
      fulfillmentStatus: 'Full',
      createdBy: 'Suraj (PZ7550)',
      createdMobile: '8219796922',
      createdEmail: 'suraj-v@adityabirla.com',
      createdCompany: 'UltraTech Cement Ltd. - Unit Birla White',
      subtotal: 91822.04,
      gstTotal: 16527.96,
      grandTotal: 108350.0,
      dispatchedAmount: 108350.0,
      pendingAmount: 0.0,
      totalPaidAmount: 108350.0,
      balanceDueAmount: 0.0,
      remarks: 'Full dispatch completed for Sundernagar commercial project.',
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            unitType: products[0].unitType,
            unitWeight: products[0].unitWeight,
            weightUnit: products[0].weightUnit,
            catalogueReferencePrice: 980.0,
            manualUnitRate: 940.0, // Manual rate entered (Inc. GST)!
            orderedQty: 100,
            dispatchedQty: 100,
            pendingQty: 0,
            gstRate: 18.0,
            lineSubtotal: 79661.02,
            lineGst: 14338.98,
            lineTotal: 94000.0
          },
          {
            productId: products[7].id,
            productName: products[7].name,
            unitType: products[7].unitType,
            unitWeight: products[7].unitWeight,
            weightUnit: products[7].weightUnit,
            catalogueReferencePrice: 2150.0,
            manualUnitRate: 2050.0, // Manual rate entered (Inc. GST)!
            orderedQty: 7,
            dispatchedQty: 7,
            pendingQty: 0,
            gstRate: 18.0,
            lineSubtotal: 12161.02,
            lineGst: 2188.98,
            lineTotal: 14350.0
          }
        ]
      }
    }
  });

  // Dispatch Record for Order 1
  await prisma.dispatchRecord.create({
    data: {
      dispatchNumber: 'BW-DSP-2026-001',
      orderId: order1.id,
      dispatchType: 'Full',
      reason: null,
      dispatchedBillAmount: 108350.0,
      pendingBillAmount: 0.0,
      dispatchedItemsJson: JSON.stringify([
        { productName: products[0].name, ordered: 100, dispatched: 100, pending: 0, rate: 940, amount: 94000 },
        { productName: products[7].name, ordered: 7, dispatched: 7, pending: 0, rate: 2050, amount: 14350 }
      ]),
      pendingItemsJson: JSON.stringify([]),
      vehicleNo: 'HP-31-B-4412',
      driverContact: '9816099112'
    }
  });

  // Payment for Order 1 (Fully Paid)
  await prisma.payment.create({
    data: {
      receiptNumber: 'BW-REC-2026-001',
      retailerId: retailer1.id,
      orderId: order1.id,
      amountPaid: 108350.0,
      balanceRemaining: 0.0,
      transactionDate: new Date(),
      paymentMode: 'UPI',
      referenceNo: 'UPI/9816055501/778844',
      notes: 'Full payment received through UPI scan at shop.',
      recordedBy: 'Suraj (PZ7550)'
    }
  });

  // Order 2: Partial Dispatch
  const order2Date = new Date();
  order2Date.setDate(order2Date.getDate() - 5);

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'BW-ORD-2026-002',
      stockistId: stockist1.id,
      retailerId: retailer2.id,
      orderDate: order2Date,
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
      subtotal: 145709.75,
      gstTotal: 29040.25,
      grandTotal: 174750.0,
      dispatchedAmount: 119250.0,
      pendingAmount: 55500.0,
      totalPaidAmount: 50000.0,
      balanceDueAmount: 124750.0,
      remarks: 'Staggered delivery approved by Territory Officer.',
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            unitType: products[0].unitType,
            unitWeight: products[0].unitWeight,
            weightUnit: products[0].weightUnit,
            catalogueReferencePrice: 980.0,
            manualUnitRate: 925.0, // Manual rate entered (Inc. GST)!
            orderedQty: 150,
            dispatchedQty: 90,
            pendingQty: 60,
            gstRate: 18.0,
            lineSubtotal: 117584.75,
            lineGst: 21165.25,
            lineTotal: 138750.0
          },
          {
            productId: products[3].id,
            productName: products[3].name,
            unitType: products[3].unitType,
            unitWeight: products[3].unitWeight,
            weightUnit: products[3].weightUnit,
            catalogueReferencePrice: 1250.0,
            manualUnitRate: 1200.0, // Manual rate entered (Inc. GST)!
            orderedQty: 30,
            dispatchedQty: 30,
            pendingQty: 0,
            gstRate: 28.0,
            lineSubtotal: 28125.0,
            lineGst: 7875.0,
            lineTotal: 36000.0
          }
        ]
      }
    }
  });

  // Dispatch Record for Order 2 (Partial)
  await prisma.dispatchRecord.create({
    data: {
      dispatchNumber: 'BW-DSP-2026-002',
      orderId: order2.id,
      dispatchType: 'Partial',
      reason: 'Transport vehicle load limit reached. Remaining 60 bags of Putty scheduled for next delivery.',
      dispatchedBillAmount: 119250.0,
      pendingBillAmount: 55500.0,
      dispatchedItemsJson: JSON.stringify([
        { productName: products[0].name, ordered: 150, dispatched: 90, pending: 60, rate: 925, amount: 83250 },
        { productName: products[3].name, ordered: 30, dispatched: 30, pending: 0, rate: 1200, amount: 36000 }
      ]),
      pendingItemsJson: JSON.stringify([
        { productName: products[0].name, ordered: 150, dispatched: 90, pending: 60, rate: 925, amount: 55500 }
      ]),
      vehicleNo: 'HP-33-C-9812',
      driverContact: '9816033441'
    }
  });

  // Partial Payment for Order 2
  await prisma.payment.create({
    data: {
      receiptNumber: 'BW-REC-2026-002',
      retailerId: retailer2.id,
      orderId: order2.id,
      amountPaid: 50000.0,
      balanceRemaining: 124750.0,
      transactionDate: new Date(),
      paymentMode: 'Cheque',
      chequeDate: new Date(Date.now() + 86400000 * 3),
      referenceNo: 'CHQ-889124',
      notes: 'Advance cheque handed over to Suraj (PZ7550).',
      recordedBy: 'Suraj (PZ7550)'
    }
  });

  // Order 3: Overdue Sample for Live Ageing Tracker
  const order3Date = new Date();
  order3Date.setDate(order3Date.getDate() - 48); // 48 days ago -> Overdue by 27 days (credit limit 21 days)

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'BW-ORD-2026-003',
      stockistId: stockist2.id,
      retailerId: retailer4.id,
      orderDate: order3Date,
      deliveryLocation: 'Hill View Godown, Pandoh Dam Colony, Mandi',
      deliveryContactPerson: 'Anil Kumar',
      deliveryContactMobile: '9816055504',
      deliveryDate: new Date(Date.now() - 86400000 * 45),
      deliveryStatus: 'Delivered',
      state: 'Active',
      fulfillmentStatus: 'Full',
      createdBy: 'Suraj (PZ7550)',
      createdMobile: '8219796922',
      createdEmail: 'suraj-v@adityabirla.com',
      createdCompany: 'UltraTech Cement Ltd. - Unit Birla White',
      subtotal: 77966.10,
      gstTotal: 14033.90,
      grandTotal: 92000.0,
      dispatchedAmount: 92000.0,
      pendingAmount: 0.0,
      totalPaidAmount: 0.0,
      balanceDueAmount: 92000.0,
      remarks: 'Payment delayed due to site contractor bill processing.',
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            unitType: products[0].unitType,
            unitWeight: products[0].unitWeight,
            weightUnit: products[0].weightUnit,
            catalogueReferencePrice: 980.0,
            manualUnitRate: 920.0,
            orderedQty: 100,
            dispatchedQty: 100,
            pendingQty: 0,
            gstRate: 18.0,
            lineSubtotal: 77966.10,
            lineGst: 14033.90,
            lineTotal: 92000.0
          }
        ]
      }
    }
  });

  console.log('Orders, dispatches and payments created.');

  // 6. PJP Visits (Permanent Journey Plan)
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  await prisma.pjpVisit.create({
    data: {
      retailerId: retailer1.id,
      salesOfficer: 'Suraj (PZ7550)',
      visitDate: today,
      district: 'Mandi',
      tehsil: 'Sundernagar',
      locality: 'Cinema Chowk',
      status: 'Completed',
      notes: 'Met Ramesh ji. Discussed WallCare Putty secondary sales & collected full UPI payment.',
      orderBookedAmount: 108350.0,
      paymentCollectedAmount: 108350.0,
      completedAt: today
    }
  });

  await prisma.pjpVisit.create({
    data: {
      retailerId: retailer2.id,
      salesOfficer: 'Suraj (PZ7550)',
      visitDate: today,
      district: 'Mandi',
      tehsil: 'Balh / Ner Chowk',
      locality: 'Ner Chowk Market',
      status: 'Completed',
      notes: 'Inspected stock level for Ner Chowk hospital project; took cheque for ₹50,000.',
      orderBookedAmount: 174750.0,
      paymentCollectedAmount: 50000.0,
      completedAt: today
    }
  });

  await prisma.pjpVisit.create({
    data: {
      retailerId: retailer3.id,
      salesOfficer: 'Suraj (PZ7550)',
      visitDate: tomorrow,
      district: 'Mandi',
      tehsil: 'Joginder Nagar',
      locality: 'Railway Station Road',
      status: 'Scheduled',
      notes: 'Planned visit for seasonal stock booking and Extocare Primer sample kit display.',
      orderBookedAmount: 0.0,
      paymentCollectedAmount: 0.0
    }
  });

  await prisma.pjpVisit.create({
    data: {
      retailerId: retailer4.id,
      salesOfficer: 'Suraj (PZ7550)',
      visitDate: tomorrow,
      district: 'Mandi',
      tehsil: 'Mandi Sadar',
      locality: 'Pandoh Bazaar',
      status: 'Scheduled',
      notes: 'Follow-up on overdue invoice BW-ORD-2026-003 balance ₹92,000.',
      orderBookedAmount: 0.0,
      paymentCollectedAmount: 0.0
    }
  });

  console.log('PJP visits seeded successfully.');
  console.log('All seed data inserted successfully for Birla White ERP!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
