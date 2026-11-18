const prisma = require('../prisma');
const { generateDispatchedChallan, generatePendingSlip } = require('../services/pdfService');

async function generateDispatchNumber() {
  const currentYear = new Date().getFullYear();
  const count = await prisma.dispatchRecord.count();
  const nextSeq = String(count + 1).padStart(3, '0');
  return `BW-DSP-${currentYear}-${nextSeq}`;
}

// Process Order Dispatch (Full / Partial / Out of Stock)
exports.processDispatch = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      dispatchType, // 'Full', 'Partial', 'Out of Stock'
      reason, // Mandatory if dispatchType === 'Partial'
      vehicleNo,
      driverContact,
      itemDispatches // Array of { orderItemId, dispatchedQtyNow }
    } = req.body;

    if (!dispatchType) {
      return res.status(400).json({ error: 'Please specify dispatch type (Full, Partial, Out of Stock).' });
    }

    if (dispatchType === 'Partial' && (!reason || !reason.trim())) {
      return res.status(400).json({ error: 'Reason is strictly required for Partial Dispatch fulfillment.' });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: true,
        retailer: true,
        stockist: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let dispatchedBillAmount = 0;
    let pendingBillAmount = 0;
    const dispatchedItemsList = [];
    const pendingItemsList = [];

    // Process item by item
    for (const item of order.items) {
      let dispatchedQtyNow = 0;

      if (dispatchType === 'Full') {
        dispatchedQtyNow = item.orderedQty - item.dispatchedQty;
      } else if (dispatchType === 'Out of Stock') {
        dispatchedQtyNow = 0;
      } else {
        // Partial: find user input for this item
        const input = itemDispatches?.find((d) => d.orderItemId === item.id);
        dispatchedQtyNow = input ? parseInt(input.dispatchedQtyNow) : 0;
      }

      const totalDispatchedSoFar = item.dispatchedQty + dispatchedQtyNow;
      const pendingQtyRemaining = Math.max(0, item.orderedQty - totalDispatchedSoFar);

      // Calculations with GST
      const lineRate = item.manualUnitRate;
      const gstRate = item.gstRate || 18.0;

      const itemDispatchedValue = dispatchedQtyNow * lineRate * (1 + gstRate / 100);
      const itemPendingValue = pendingQtyRemaining * lineRate * (1 + gstRate / 100);

      dispatchedBillAmount += itemDispatchedValue;
      pendingBillAmount += itemPendingValue;

      // Update line item in database
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          dispatchedQty: totalDispatchedSoFar,
          pendingQty: pendingQtyRemaining
        }
      });

      if (dispatchedQtyNow > 0) {
        dispatchedItemsList.push({
          orderItemId: item.id,
          productName: item.productName,
          ordered: item.orderedQty,
          dispatched: dispatchedQtyNow,
          pending: pendingQtyRemaining,
          rate: lineRate,
          amount: itemDispatchedValue
        });
      }

      if (pendingQtyRemaining > 0) {
        pendingItemsList.push({
          orderItemId: item.id,
          productName: item.productName,
          ordered: item.orderedQty,
          dispatched: totalDispatchedSoFar,
          pending: pendingQtyRemaining,
          rate: lineRate,
          amount: itemPendingValue
        });
      }
    }

    const dispatchNumber = await generateDispatchNumber();

    // Determine final fulfillment status based on remaining pending quantity
    const totalPendingQtyAcross = order.items.reduce((acc, curr) => {
      const match = itemDispatches?.find((d) => d.orderItemId === curr.id);
      const dispatchedNow = match ? parseInt(match.dispatchedQtyNow) : (dispatchType === 'Full' ? curr.orderedQty - curr.dispatchedQty : 0);
      return acc + Math.max(0, curr.orderedQty - (curr.dispatchedQty + dispatchedNow));
    }, 0);

    let finalFulfillmentStatus = dispatchType;
    if (dispatchType === 'Partial' && totalPendingQtyAcross === 0) {
      finalFulfillmentStatus = 'Full';
    }

    // Create Dispatch Record
    const dispatchRecord = await prisma.dispatchRecord.create({
      data: {
        dispatchNumber,
        orderId: order.id,
        dispatchType,
        reason: reason || null,
        dispatchedBillAmount,
        pendingBillAmount,
        dispatchedItemsJson: JSON.stringify(dispatchedItemsList),
        pendingItemsJson: JSON.stringify(pendingItemsList),
        vehicleNo: vehicleNo || null,
        driverContact: driverContact || null
      }
    });

    // Update parent Order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        fulfillmentStatus: finalFulfillmentStatus,
        partialReason: dispatchType === 'Partial' ? reason : null,
        dispatchedAmount: { increment: dispatchedBillAmount },
        pendingAmount: pendingBillAmount,
        deliveryStatus: finalFulfillmentStatus === 'Full' ? 'Delivered' : order.deliveryStatus
      },
      include: {
        items: true,
        dispatchRecords: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.status(201).json({
      message: 'Dispatch processed successfully',
      dispatchRecord,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error processing dispatch:', error);
    res.status(500).json({ error: 'Failed to process dispatch' });
  }
};

// Stream Dispatched Delivery Challan PDF
exports.downloadDispatchedChallan = async (req, res) => {
  try {
    const { id } = req.params;
    const dispatch = await prisma.dispatchRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: {
          include: {
            retailer: true,
            stockist: true
          }
        }
      }
    });

    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch record not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Challan_${dispatch.dispatchNumber}.pdf"`);

    const doc = generateDispatchedChallan(dispatch);
    doc.pipe(res);
  } catch (error) {
    console.error('Error generating dispatched challan PDF:', error);
    res.status(500).json({ error: 'Failed to generate dispatched challan PDF' });
  }
};

// Stream Pending Backorder Slip PDF
exports.downloadPendingSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const dispatch = await prisma.dispatchRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: {
          include: {
            retailer: true,
            stockist: true
          }
        }
      }
    });

    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch record not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="PendingSlip_${dispatch.dispatchNumber}.pdf"`);

    const doc = generatePendingSlip(dispatch);
    doc.pipe(res);
  } catch (error) {
    console.error('Error generating pending slip PDF:', error);
    res.status(500).json({ error: 'Failed to generate pending slip PDF' });
  }
};
