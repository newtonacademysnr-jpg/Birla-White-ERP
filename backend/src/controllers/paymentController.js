const prisma = require('../prisma');
const { generatePaymentReceipt } = require('../services/pdfService');

async function generateReceiptNumber() {
  const currentYear = new Date().getFullYear();
  const count = await prisma.payment.count();
  const nextSeq = String(count + 1).padStart(3, '0');
  return `BW-REC-${currentYear}-${nextSeq}`;
}

// Get all payments with filters
exports.getAllPayments = async (req, res) => {
  try {
    const { retailerId, orderId, paymentMode, search } = req.query;
    const where = {};

    if (retailerId && retailerId !== 'All') {
      where.retailerId = parseInt(retailerId);
    }

    if (orderId && orderId !== 'All') {
      where.orderId = parseInt(orderId);
    }

    if (paymentMode && paymentMode !== 'All') {
      where.paymentMode = paymentMode;
    }

    if (search) {
      where.OR = [
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { referenceNo: { contains: search, mode: 'insensitive' } },
        { retailer: { firmName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const payments = await prisma.payment.findMany({
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
            grandTotal: true,
            totalPaidAmount: true,
            balanceDueAmount: true
          }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Record new payment & generate receipt
exports.recordPayment = async (req, res) => {
  try {
    const {
      retailerId,
      orderId,
      amountPaid,
      transactionDate,
      paymentMode,
      chequeDate,
      referenceNo,
      notes,
      recordedBy
    } = req.body;

    if (!retailerId || !amountPaid || !paymentMode) {
      return res.status(400).json({ error: 'Retailer, amount paid, and payment mode are mandatory.' });
    }

    if (paymentMode === 'Cheque' && !chequeDate) {
      return res.status(400).json({ error: 'Cheque Date is strictly mandatory when payment mode is Cheque.' });
    }

    const parsedAmount = parseFloat(amountPaid);
    let linkedOrder = null;
    let balanceRemaining = 0;

    if (orderId) {
      linkedOrder = await prisma.order.findUnique({
        where: { id: parseInt(orderId) }
      });

      if (!linkedOrder) {
        return res.status(404).json({ error: 'Linked order not found' });
      }

      const updatedPaidAmount = linkedOrder.totalPaidAmount + parsedAmount;
      balanceRemaining = Math.max(0, linkedOrder.grandTotal - updatedPaidAmount);

      await prisma.order.update({
        where: { id: linkedOrder.id },
        data: {
          totalPaidAmount: updatedPaidAmount,
          balanceDueAmount: balanceRemaining
        }
      });
    }

    const receiptNumber = await generateReceiptNumber();

    const payment = await prisma.payment.create({
      data: {
        receiptNumber,
        retailerId: parseInt(retailerId),
        orderId: orderId ? parseInt(orderId) : null,
        amountPaid: parsedAmount,
        balanceRemaining,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        paymentMode,
        chequeDate: paymentMode === 'Cheque' && chequeDate ? new Date(chequeDate) : null,
        referenceNo: referenceNo || null,
        notes: notes || null,
        recordedBy: recordedBy || 'Suraj (PZ7550)'
      },
      include: {
        retailer: true,
        order: true
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amountPaid,
      paymentMode,
      chequeDate,
      referenceNo,
      notes,
      transactionDate
    } = req.body;

    const payment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        amountPaid: amountPaid ? parseFloat(amountPaid) : undefined,
        paymentMode,
        chequeDate: paymentMode === 'Cheque' && chequeDate ? new Date(chequeDate) : null,
        referenceNo,
        notes,
        transactionDate: transactionDate ? new Date(transactionDate) : undefined
      },
      include: {
        retailer: true,
        order: true
      }
    });

    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentId = parseInt(id);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (payment && payment.orderId) {
      // Revert order paid amount
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          totalPaidAmount: { decrement: payment.amountPaid },
          balanceDueAmount: { increment: payment.amountPaid }
        }
      });
    }

    await prisma.payment.delete({
      where: { id: paymentId }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

// Stream Payment Receipt PDF
exports.downloadPaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        retailer: true,
        order: true
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Payment_Receipt_${payment.receiptNumber}.pdf"`);

    const doc = generatePaymentReceipt(payment);
    doc.pipe(res);
  } catch (error) {
    console.error('Error generating payment receipt PDF:', error);
    res.status(500).json({ error: 'Failed to generate payment receipt PDF' });
  }
};

// Retailer Ledger Summary & Live Ageing / Overdue Tracker
exports.getRetailerLedgerSummary = async (req, res) => {
  try {
    const retailers = await prisma.retailer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
            grandTotal: true,
            totalPaidAmount: true,
            balanceDueAmount: true,
            deliveryDate: true,
            createdBy: true
          }
        },
        payments: {
          select: {
            id: true,
            receiptNumber: true,
            amountPaid: true,
            transactionDate: true,
            paymentMode: true
          }
        }
      }
    });

    const today = new Date();

    const ledgerSummary = retailers.map((retailer) => {
      const totalInvoiced = retailer.orders.reduce((sum, o) => sum + o.grandTotal, 0);
      const totalPaid = retailer.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      const outstandingBalance = Math.max(0, totalInvoiced - totalPaid);

      // Calculate Overdue Days for unpaid orders
      const creditDays = retailer.creditDays || 30;
      let maxOverdueDays = 0;
      let overdueAmount = 0;

      const agedOrders = retailer.orders
        .filter((o) => o.balanceDueAmount > 0)
        .map((order) => {
          const orderDate = new Date(order.orderDate);
          const diffDays = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
          const dueDays = Math.max(0, diffDays - creditDays);

          if (dueDays > 0) {
            overdueAmount += order.balanceDueAmount;
          }
          if (dueDays > maxOverdueDays) {
            maxOverdueDays = dueDays;
          }

          return {
            ...order,
            ageDays: diffDays,
            dueDays,
            isOverdue: dueDays > 0
          };
        });

      return {
        id: retailer.id,
        firmName: retailer.firmName,
        ownerName: retailer.ownerName,
        mobileNumber: retailer.mobileNumber,
        gstNumber: retailer.gstNumber,
        locality: retailer.locality,
        tehsil: retailer.tehsil,
        district: retailer.district,
        creditLimit: retailer.creditLimit,
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

    // Grouping by Created By
    const ordersGroupedByCreator = await prisma.order.groupBy({
      by: ['createdBy'],
      _sum: {
        grandTotal: true,
        totalPaidAmount: true,
        balanceDueAmount: true
      },
      _count: {
        id: true
      }
    });

    res.json({
      ledgerSummary,
      ordersGroupedByCreator
    });
  } catch (error) {
    console.error('Error generating ledger summary:', error);
    res.status(500).json({ error: 'Failed to generate ledger summary' });
  }
};

// Detailed Ledger for single Retailer
exports.getRetailerLedgerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const retailerId = parseInt(id);

    const retailer = await prisma.retailer.findUnique({
      where: { id: retailerId },
      include: {
        primaryStockist: true,
        orders: {
          include: {
            items: true
          },
          orderBy: { orderDate: 'asc' }
        },
        payments: {
          orderBy: { transactionDate: 'asc' }
        }
      }
    });

    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found' });
    }

    // Build chronological transaction timeline
    const timeline = [];

    retailer.orders.forEach((order) => {
      timeline.push({
        type: 'Invoice (Debit)',
        date: order.orderDate,
        refNumber: order.orderNumber,
        debit: order.grandTotal,
        credit: 0,
        notes: `Order booked with ${order.items?.length || 0} line items. Delivery: ${order.deliveryLocation}`,
        details: order
      });
    });

    retailer.payments.forEach((payment) => {
      timeline.push({
        type: 'Payment (Credit)',
        date: payment.transactionDate,
        refNumber: payment.receiptNumber,
        debit: 0,
        credit: payment.amountPaid,
        notes: `Mode: ${payment.paymentMode} | Ref: ${payment.referenceNo || 'Direct'}`,
        details: payment
      });
    });

    // Sort timeline chronologically
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let runningBalance = 0;
    const ledgerEntries = timeline.map((entry) => {
      runningBalance += entry.debit - entry.credit;
      return {
        ...entry,
        runningBalance
      };
    });

    const totalInvoiced = retailer.orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalPaid = retailer.payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const balanceRemaining = totalInvoiced - totalPaid;

    res.json({
      retailer,
      totalInvoiced,
      totalPaid,
      balanceRemaining,
      ledgerEntries
    });
  } catch (error) {
    console.error('Error fetching detailed ledger:', error);
    res.status(500).json({ error: 'Failed to fetch detailed ledger' });
  }
};
