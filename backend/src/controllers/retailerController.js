const prisma = require('../prisma');

// Get all retailers with search, district filter & mapped stockist
exports.getAllRetailers = async (req, res) => {
  try {
    const { search, district, status, stockistId } = req.query;
    const where = {};

    if (status && status !== 'All') {
      where.status = status;
    }

    if (stockistId && stockistId !== 'All') {
      where.primaryStockistId = parseInt(stockistId);
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

    const retailers = await prisma.retailer.findMany({
      where,
      include: {
        primaryStockist: {
          select: { id: true, firmName: true, ownerName: true, mobileNumber: true, locality: true, tehsil: true }
        },
        _count: {
          select: { orders: true, payments: true, pjpVisits: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(retailers);
  } catch (error) {
    console.error('Error fetching retailers:', error);
    res.status(500).json({ error: 'Failed to fetch retailers' });
  }
};

// Get single retailer by ID
exports.getRetailerById = async (req, res) => {
  try {
    const { id } = req.params;
    const retailer = await prisma.retailer.findUnique({
      where: { id: parseInt(id) },
      include: {
        primaryStockist: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        payments: {
          orderBy: { transactionDate: 'desc' },
          take: 10
        }
      }
    });

    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found' });
    }

    res.json(retailer);
  } catch (error) {
    console.error('Error fetching retailer:', error);
    res.status(500).json({ error: 'Failed to fetch retailer' });
  }
};

// Create new retailer with full structured address & stockist mapping
exports.createRetailer = async (req, res) => {
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
      primaryStockistId,
      creditLimit,
      creditDays,
      status
    } = req.body;

    if (!firmName || !gstNumber || !ownerName || !mobileNumber || !district || !tehsil || !locality || !pincode) {
      return res.status(400).json({ error: 'Missing mandatory fields for Retailer' });
    }

    const retailer = await prisma.retailer.create({
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
        primaryStockistId: primaryStockistId ? parseInt(primaryStockistId) : null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : 300000,
        creditDays: creditDays ? parseInt(creditDays) : 30,
        status: status || 'Active'
      },
      include: {
        primaryStockist: true
      }
    });

    res.status(201).json(retailer);
  } catch (error) {
    console.error('Error creating retailer:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A retailer with this GST Number already exists' });
    }
    res.status(500).json({ error: 'Failed to create retailer' });
  }
};

// Update retailer
exports.updateRetailer = async (req, res) => {
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
      primaryStockistId,
      creditLimit,
      creditDays,
      status
    } = req.body;

    const retailer = await prisma.retailer.update({
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
        primaryStockistId: primaryStockistId !== undefined ? (primaryStockistId ? parseInt(primaryStockistId) : null) : undefined,
        creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
        creditDays: creditDays ? parseInt(creditDays) : undefined,
        status
      },
      include: {
        primaryStockist: true
      }
    });

    res.json(retailer);
  } catch (error) {
    console.error('Error updating retailer:', error);
    res.status(500).json({ error: 'Failed to update retailer' });
  }
};

// Delete retailer
exports.deleteRetailer = async (req, res) => {
  try {
    const { id } = req.params;
    const retailerId = parseInt(id);

    const orderCount = await prisma.order.count({
      where: { retailerId }
    });

    if (orderCount > 0) {
      return res.status(400).json({
        error: `Cannot delete retailer: ${orderCount} existing orders are mapped to this retailer. Deactivate it instead.`
      });
    }

    await prisma.retailer.delete({
      where: { id: retailerId }
    });

    res.json({ message: 'Retailer deleted successfully' });
  } catch (error) {
    console.error('Error deleting retailer:', error);
    res.status(500).json({ error: 'Failed to delete retailer' });
  }
};
