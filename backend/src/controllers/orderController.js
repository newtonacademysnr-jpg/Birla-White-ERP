const prisma = require('../prisma');
const { generateRetailerReceipt, generateStockistReceipt } = require('../services/pdfService');

// Generate unique order number (e.g. BW-ORD-2026-004)
async function generateOrderNumber() {
  const currentYear = new Date().getFullYear();
  const count = await prisma.order.count();
  const nextSeq = String(count + 1).padStart(3, '0');
  return `BW-ORD-${currentYear}-${nextSeq}`;
}

// Get all orders with search & status filters
exports.getAllOrders = async (req, res) => {
  try {
    const { state, fulfillmentStatus, retailerId, stockistId, search } = req.query;
    const where = {};

    if (state && state !== 'All') {
      where.state = state;
    }

    if (fulfillmentStatus && fulfillmentStatus !== 'All') {
      where.fulfillmentStatus = fulfillmentStatus;
    }

    if (retailerId && retailerId !== 'All') {
      where.retailerId = parseInt(retailerId);
    }

    if (stockistId && stockistId !== 'All') {
      where.stockistId = parseInt(stockistId);
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { deliveryLocation: { contains: search, mode: 'insensitive' } },
        { deliveryContactPerson: { contains: search, mode: 'insensitive' } },
        { retailer: { firmName: { contains: search, mode: 'insensitive' } } },
        { stockist: { firmName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        retailer: {
          select: {
            id: true,
            firmName: true,
            ownerName: true,
            mobileNumber: true,
            gstNumber: true,
            locality: true,
            tehsil: true,
            district: true,
            pincode: true
          }
        },
        stockist: {
          select: {
            id: true,
            firmName: true,
            ownerName: true,
            mobileNumber: true,
            gstNumber: true,
            locality: true,
            tehsil: true,
            district: true,
            pincode: true
          }
        },
        items: true,
        dispatchRecords: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { transactionDate: 'desc' }
        }
      },
      orderBy: { orderDate: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order with complete line items and history
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        retailer: true,
        stockist: true,
        items: {
          include: {
            product: true
          }
        },
        dispatchRecords: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { transactionDate: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Create new order with manual rate entry and auto GST calculation
exports.createOrder = async (req, res) => {
  try {
    const {
      stockistId,
      retailerId,
      orderDate,
      deliveryLocation,
      deliveryContactPerson,
      deliveryContactMobile,
      deliveryDate,
      remarks,
      createdBy,
      createdMobile,
      createdEmail,
      createdCompany,
      items // Array of items with productId, manualUnitRate, orderedQty
    } = req.body;

    if (!stockistId || !retailerId || !items || !items.length) {
      return res.status(400).json({ error: 'Please provide stockist, retailer, and at least one product item.' });
    }

    if (!deliveryLocation || !deliveryContactPerson || !deliveryContactMobile) {
      return res.status(400).json({ error: 'Delivery site location, contact person and mobile are required.' });
    }

    const orderNumber = await generateOrderNumber();

    // Fetch product details for all line items to get standard pricing, packaging, and GST rates
    let subtotal = 0;
    let gstTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(item.productId) }
      });

      if (!product) {
        return res.status(400).json({ error: `Product ID ${item.productId} not found` });
      }

      const manualUnitRate = parseFloat(item.manualUnitRate);
      const orderedQty = parseInt(item.orderedQty);
      const gstRate = parseFloat(product.gstRate || 18.0);

      // Rule: Rate entered is INCLUSIVE of 18% GST (e.g. 980 * 10 = 9800)
      const lineTotal = manualUnitRate * orderedQty;
      const lineSubtotal = lineTotal / (1 + gstRate / 100);
      const lineGst = lineTotal - lineSubtotal;

      subtotal += lineSubtotal;
      gstTotal += lineGst;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        unitType: product.unitType,
        unitWeight: product.unitWeight,
        weightUnit: product.weightUnit,
        catalogueReferencePrice: product.referencePrice,
        manualUnitRate,
        orderedQty,
        dispatchedQty: 0,
        pendingQty: orderedQty,
        gstRate,
        lineSubtotal,
        lineGst,
        lineTotal
      });
    }

    const grandTotal = subtotal + gstTotal;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        stockistId: parseInt(stockistId),
        retailerId: parseInt(retailerId),
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        deliveryLocation,
        deliveryContactPerson,
        deliveryContactMobile,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryStatus: 'Pending',
        state: 'Active',
        fulfillmentStatus: 'Pending',
        createdBy: createdBy || 'Suraj (PZ7550)',
        createdMobile: createdMobile || '8219796922',
        createdEmail: createdEmail || 'suraj-v@adityabirla.com',
        createdCompany: createdCompany || 'UltraTech Cement Ltd. - Unit Birla White',
        subtotal,
        gstTotal,
        grandTotal,
        dispatchedAmount: 0.0,
        pendingAmount: grandTotal,
        totalPaidAmount: 0.0,
        balanceDueAmount: grandTotal,
        remarks: remarks || null,
        items: {
          create: orderItemsData
        }
      },
      include: {
        retailer: true,
        stockist: true,
        items: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Update order metadata (State, Delivery Date, Delivery Info, etc.)
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      state,
      deliveryDate,
      deliveryLocation,
      deliveryContactPerson,
      deliveryContactMobile,
      remarks,
      createdBy,
      createdMobile
    } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        state: state !== undefined ? state : undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        deliveryLocation: deliveryLocation !== undefined ? deliveryLocation : undefined,
        deliveryContactPerson: deliveryContactPerson !== undefined ? deliveryContactPerson : undefined,
        deliveryContactMobile: deliveryContactMobile !== undefined ? deliveryContactMobile : undefined,
        remarks: remarks !== undefined ? remarks : undefined,
        createdBy: createdBy !== undefined ? createdBy : undefined,
        createdMobile: createdMobile !== undefined ? createdMobile : undefined
      },
      include: {
        retailer: true,
        stockist: true,
        items: true
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// One-Click "Mark as Delivered Successfully"
exports.markAsDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryDate } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        deliveryStatus: 'Delivered',
        deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date()
      },
      include: {
        retailer: true,
        stockist: true,
        items: true
      }
    });

    res.json({ message: 'Order marked as Delivered Successfully', order });
  } catch (error) {
    console.error('Error marking order delivered:', error);
    res.status(500).json({ error: 'Failed to mark order as delivered' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    // Delete associated items, dispatches, and payments or cascade
    await prisma.order.delete({
      where: { id: orderId }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// Stream Retailer Order Confirmation Receipt PDF (Blind Drop-Shipping: Hides Stockist)
exports.downloadRetailerReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        retailer: true,
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Retailer_Receipt_${order.orderNumber}.pdf"`);

    const doc = generateRetailerReceipt(order);
    doc.pipe(res);
  } catch (error) {
    console.error('Error generating retailer receipt PDF:', error);
    res.status(500).json({ error: 'Failed to generate retailer receipt PDF' });
  }
};

// Stream Stockist Order Confirmation Receipt PDF (Shows both Stockist & Retailer)
exports.downloadStockistReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        stockist: true,
        retailer: true,
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Stockist_Advisory_${order.orderNumber}.pdf"`);

    const doc = generateStockistReceipt(order);
    doc.pipe(res);
  } catch (error) {
    console.error('Error generating stockist receipt PDF:', error);
    res.status(500).json({ error: 'Failed to generate stockist receipt PDF' });
  }
};
