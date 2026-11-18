const prisma = require('../prisma');

// Get all stockists with search & filtering
exports.getAllStockists = async (req, res) => {
  try {
    const { search, district, status } = req.query;
    const where = {};

    if (status && status !== 'All') {
      where.status = status;
    }

    if (district && district !== 'All') {
      where.district = { contains: district, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { firmName: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search } },
        { tehsil: { contains: search, mode: 'insensitive' } },
        { locality: { contains: search, mode: 'insensitive' } }
      ];
    }

    const stockists = await prisma.stockist.findMany({
      where,
      include: {
        retailers: {
          select: { id: true, firmName: true, ownerName: true, mobileNumber: true }
        },
        _count: {
          select: { orders: true, retailers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(stockists);
  } catch (error) {
    console.error('Error fetching stockists:', error);
    res.status(500).json({ error: 'Failed to fetch stockists' });
  }
};

// Get single stockist by ID
exports.getStockistById = async (req, res) => {
  try {
    const { id } = req.params;
    const stockist = await prisma.stockist.findUnique({
      where: { id: parseInt(id) },
      include: {
        retailers: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!stockist) {
      return res.status(404).json({ error: 'Stockist not found' });
    }

    res.json(stockist);
  } catch (error) {
    console.error('Error fetching stockist:', error);
    res.status(500).json({ error: 'Failed to fetch stockist' });
  }
};

// Create new stockist with full structured address
exports.createStockist = async (req, res) => {
  try {
    const {
      firmName,
      gstNumber,
      ownerName,
      mobileNumber,
      district,
      tehsil,
      subTehsil,
      locality,
      pincode,
      creditLimit,
      creditDays,
      status
    } = req.body;

    if (!firmName || !gstNumber || !ownerName || !mobileNumber || !district || !tehsil || !locality || !pincode) {
      return res.status(400).json({ error: 'Missing mandatory fields for Stockist' });
    }

    const stockist = await prisma.stockist.create({
      data: {
        firmName,
        gstNumber: gstNumber.toUpperCase().trim(),
        ownerName,
        mobileNumber,
        district,
        tehsil,
        subTehsil: subTehsil || null,
        locality,
        pincode,
        creditLimit: creditLimit ? parseFloat(creditLimit) : 1500000,
        creditDays: creditDays ? parseInt(creditDays) : 45,
        status: status || 'Active'
      }
    });

    res.status(201).json(stockist);
  } catch (error) {
    console.error('Error creating stockist:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A stockist with this GST Number already exists' });
    }
    res.status(500).json({ error: 'Failed to create stockist' });
  }
};

// Update stockist
exports.updateStockist = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firmName,
      gstNumber,
      ownerName,
      mobileNumber,
      district,
      tehsil,
      subTehsil,
      locality,
      pincode,
      creditLimit,
      creditDays,
      status
    } = req.body;

    const stockist = await prisma.stockist.update({
      where: { id: parseInt(id) },
      data: {
        firmName,
        gstNumber: gstNumber ? gstNumber.toUpperCase().trim() : undefined,
        ownerName,
        mobileNumber,
        district,
        tehsil,
        subTehsil,
        locality,
        pincode,
        creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
        creditDays: creditDays ? parseInt(creditDays) : undefined,
        status
      }
    });

    res.json(stockist);
  } catch (error) {
    console.error('Error updating stockist:', error);
    res.status(500).json({ error: 'Failed to update stockist' });
  }
};

// Delete stockist
exports.deleteStockist = async (req, res) => {
  try {
    const { id } = req.params;
    const stockistId = parseInt(id);

    // Check if stockist has active orders
    const orderCount = await prisma.order.count({
      where: { stockistId }
    });

    if (orderCount > 0) {
      return res.status(400).json({
        error: `Cannot delete stockist: ${orderCount} existing orders are mapped to this stockist. Deactivate it instead.`
      });
    }

    await prisma.stockist.delete({
      where: { id: stockistId }
    });

    res.json({ message: 'Stockist deleted successfully' });
  } catch (error) {
    console.error('Error deleting stockist:', error);
    res.status(500).json({ error: 'Failed to delete stockist' });
  }
};
