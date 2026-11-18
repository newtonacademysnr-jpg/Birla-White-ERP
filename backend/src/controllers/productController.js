const prisma = require('../prisma');

// Get all products with search, category & unitType filters
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, unitType, status } = req.query;
    const where = {};

    if (status && status !== 'All') {
      where.status = status;
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (unitType && unitType !== 'All') {
      where.unitType = unitType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { hsnCode: { contains: search } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      unitType,
      manualUnitName,
      unitWeight,
      weightUnit,
      referencePrice,
      hsnCode,
      gstRate,
      inStockQty,
      status
    } = req.body;

    if (!name || !category || !unitType || unitWeight === undefined || referencePrice === undefined) {
      return res.status(400).json({ error: 'Missing mandatory product fields' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        unitType,
        manualUnitName: unitType === 'Manual' ? manualUnitName : null,
        unitWeight: parseFloat(unitWeight),
        weightUnit: weightUnit || 'Kg',
        referencePrice: parseFloat(referencePrice),
        hsnCode: hsnCode || '32141000',
        gstRate: gstRate ? parseFloat(gstRate) : 18.0,
        inStockQty: inStockQty ? parseInt(inStockQty) : 500,
        status: status || 'Active'
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A product with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      unitType,
      manualUnitName,
      unitWeight,
      weightUnit,
      referencePrice,
      hsnCode,
      gstRate,
      inStockQty,
      status
    } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        category,
        unitType,
        manualUnitName: unitType === 'Manual' ? manualUnitName : null,
        unitWeight: unitWeight !== undefined ? parseFloat(unitWeight) : undefined,
        weightUnit,
        referencePrice: referencePrice !== undefined ? parseFloat(referencePrice) : undefined,
        hsnCode,
        gstRate: gstRate !== undefined ? parseFloat(gstRate) : undefined,
        inStockQty: inStockQty !== undefined ? parseInt(inStockQty) : undefined,
        status
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    const orderItemCount = await prisma.orderItem.count({
      where: { productId }
    });

    if (orderItemCount > 0) {
      return res.status(400).json({
        error: `Cannot delete product: It is referenced in ${orderItemCount} historical orders. You can set it to Inactive.`
      });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
