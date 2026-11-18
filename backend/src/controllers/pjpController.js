const prisma = require('../prisma');

// Get all PJP visits with date & status filtering
exports.getAllPjpVisits = async (req, res) => {
  try {
    const { status, date, tehsil, salesOfficer } = req.query;
    const where = {};

    if (status && status !== 'All') {
      where.status = status;
    }

    if (tehsil && tehsil !== 'All') {
      where.tehsil = { contains: tehsil, mode: 'insensitive' };
    }

    if (salesOfficer) {
      where.salesOfficer = { contains: salesOfficer, mode: 'insensitive' };
    }

    if (date) {
      const selected = new Date(date);
      const startOfDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
      const endOfDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
      where.visitDate = {
        gte: startOfDay,
        lt: endOfDay
      };
    }

    const visits = await prisma.pjpVisit.findMany({
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
            district: true
          }
        }
      },
      orderBy: { visitDate: 'asc' }
    });

    res.json(visits);
  } catch (error) {
    console.error('Error fetching PJP visits:', error);
    res.status(500).json({ error: 'Failed to fetch PJP visits' });
  }
};

// Schedule a new PJP visit
exports.createPjpVisit = async (req, res) => {
  try {
    const {
      retailerId,
      salesOfficer,
      visitDate,
      district,
      tehsil,
      locality,
      notes
    } = req.body;

    if (!retailerId || !visitDate) {
      return res.status(400).json({ error: 'Retailer and visit date are mandatory.' });
    }

    const retailer = await prisma.retailer.findUnique({
      where: { id: parseInt(retailerId) }
    });

    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found' });
    }

    const visit = await prisma.pjpVisit.create({
      data: {
        retailerId: parseInt(retailerId),
        salesOfficer: salesOfficer || 'Suraj (PZ7550)',
        visitDate: new Date(visitDate),
        district: district || retailer.district,
        tehsil: tehsil || retailer.tehsil,
        locality: locality || retailer.locality,
        status: 'Scheduled',
        notes: notes || null
      },
      include: {
        retailer: true
      }
    });

    res.status(201).json(visit);
  } catch (error) {
    console.error('Error scheduling PJP visit:', error);
    res.status(500).json({ error: 'Failed to schedule PJP visit' });
  }
};

// Update PJP visit (or mark as completed / order booked / payment collected)
exports.updatePjpVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, // 'Scheduled', 'Completed', 'Rescheduled', 'Order Booked', 'Payment Collected'
      visitDate,
      notes,
      orderBookedAmount,
      paymentCollectedAmount
    } = req.body;

    const visit = await prisma.pjpVisit.update({
      where: { id: parseInt(id) },
      data: {
        status: status !== undefined ? status : undefined,
        visitDate: visitDate ? new Date(visitDate) : undefined,
        notes: notes !== undefined ? notes : undefined,
        orderBookedAmount: orderBookedAmount !== undefined ? parseFloat(orderBookedAmount) : undefined,
        paymentCollectedAmount: paymentCollectedAmount !== undefined ? parseFloat(paymentCollectedAmount) : undefined,
        completedAt: status === 'Completed' || status === 'Order Booked' || status === 'Payment Collected' ? new Date() : undefined
      },
      include: {
        retailer: true
      }
    });

    res.json(visit);
  } catch (error) {
    console.error('Error updating PJP visit:', error);
    res.status(500).json({ error: 'Failed to update PJP visit' });
  }
};

// Delete PJP visit
exports.deletePjpVisit = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pjpVisit.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'PJP visit deleted successfully' });
  } catch (error) {
    console.error('Error deleting PJP visit:', error);
    res.status(500).json({ error: 'Failed to delete PJP visit' });
  }
};
