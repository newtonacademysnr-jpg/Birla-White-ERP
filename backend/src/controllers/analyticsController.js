const prisma = require('../prisma');

// Command Center Dashboard KPI Cards
exports.getDashboardSummary = async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    const payments = await prisma.payment.findMany();

    const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalDispatchedValue = orders.reduce((sum, o) => sum + o.dispatchedAmount, 0);
    const totalPendingValue = orders.reduce((sum, o) => sum + o.pendingAmount, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalOutstanding = Math.max(0, totalSales - totalCollected);

    // Overdue Calculation
    const today = new Date();
    const retailers = await prisma.retailer.findMany({
      include: {
        orders: {
          where: { balanceDueAmount: { gt: 0 } }
        }
      }
    });

    let totalOverdueAmount = 0;
    let totalOverdueInvoices = 0;

    retailers.forEach((ret) => {
      const creditDays = ret.creditDays || 30;
      ret.orders.forEach((o) => {
        const orderDate = new Date(o.orderDate);
        const diffDays = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
        if (diffDays > creditDays) {
          totalOverdueAmount += o.balanceDueAmount;
          totalOverdueInvoices += 1;
        }
      });
    });

    // Today's PJP visits
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const activePjpToday = await prisma.pjpVisit.count({
      where: {
        visitDate: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    });

    const counts = {
      stockists: await prisma.stockist.count({ where: { status: 'Active' } }),
      retailers: await prisma.retailer.count({ where: { status: 'Active' } }),
      products: await prisma.product.count({ where: { status: 'Active' } }),
      orders: orders.length
    };

    // Recent 5 orders for dashboard feed
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { orderDate: 'desc' },
      include: {
        retailer: { select: { firmName: true, locality: true } },
        stockist: { select: { firmName: true } }
      }
    });

    res.json({
      kpis: {
        totalSales,
        totalDispatchedValue,
        totalPendingValue,
        totalCollected,
        totalOutstanding,
        totalOverdueAmount,
        totalOverdueInvoices,
        activePjpToday
      },
      counts,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};

// BI Performance Tracker with Timeframe Filter (Monthly, Quarterly, Half-Yearly, Annually)
exports.getBiAnalytics = async (req, res) => {
  try {
    const { timeframe = 'monthly' } = req.query; // 'monthly', 'quarterly', 'halfyearly', 'annually'

    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'quarterly') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (timeframe === 'halfyearly') {
      startDate.setMonth(now.getMonth() - 6);
    } else if (timeframe === 'annually') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // default: monthly (last 30 days)
      startDate.setMonth(now.getMonth() - 1);
    }

    // Orders within timeframe
    const orders = await prisma.order.findMany({
      where: {
        orderDate: { gte: startDate }
      },
      include: {
        items: true,
        retailer: true,
        stockist: true
      }
    });

    // Payments within timeframe
    const payments = await prisma.payment.findMany({
      where: {
        transactionDate: { gte: startDate }
      }
    });

    // 1. Payment-Wise Breakdown (Collected vs Due, Payment Mode Breakdown)
    const modeWiseMap = {
      Cash: 0,
      UPI: 0,
      Cheque: 0,
      Online: 0
    };

    payments.forEach((p) => {
      const mode = p.paymentMode || 'Cash';
      modeWiseMap[mode] = (modeWiseMap[mode] || 0) + p.amountPaid;
    });

    const paymentModesBreakdown = Object.keys(modeWiseMap).map((mode) => ({
      mode,
      amount: modeWiseMap[mode]
    }));

    const totalInvoicedInPeriod = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalCollectedInPeriod = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalDueInPeriod = Math.max(0, totalInvoicedInPeriod - totalCollectedInPeriod);

    // 2. Product-Wise Breakdown (Top-selling products, volume in Kg/Ltr/Bags)
    const productStats = {};

    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productStats[item.productName]) {
          productStats[item.productName] = {
            productName: item.productName,
            unitType: item.unitType,
            weightUnit: item.weightUnit,
            unitWeight: item.unitWeight,
            totalQuantity: 0,
            totalRevenue: 0,
            totalWeightVolume: 0
          };
        }

        const stat = productStats[item.productName];
        stat.totalQuantity += item.orderedQty;
        stat.totalRevenue += item.lineTotal;
        stat.totalWeightVolume += item.orderedQty * item.unitWeight;
      });
    });

    const topSellingProducts = Object.values(productStats).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Volume by Unit Type (Bag vs Bucket vs Box vs PCS vs Manual)
    const unitTypeVolume = {};
    Object.values(productStats).forEach((p) => {
      unitTypeVolume[p.unitType] = (unitTypeVolume[p.unitType] || 0) + p.totalQuantity;
    });

    const volumeByUnitType = Object.keys(unitTypeVolume).map((unit) => ({
      unit,
      quantity: unitTypeVolume[unit]
    }));

    // 3. Time Trend (Grouped by Week or Month depending on timeframe)
    const trendMap = {};

    orders.forEach((o) => {
      const d = new Date(o.orderDate);
      const label = timeframe === 'annually' || timeframe === 'halfyearly'
        ? d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
        : `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('en-IN', { month: 'short' })}`;

      if (!trendMap[label]) {
        trendMap[label] = { period: label, sales: 0, collections: 0 };
      }
      trendMap[label].sales += o.grandTotal;
    });

    payments.forEach((p) => {
      const d = new Date(p.transactionDate);
      const label = timeframe === 'annually' || timeframe === 'halfyearly'
        ? d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
        : `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('en-IN', { month: 'short' })}`;

      if (!trendMap[label]) {
        trendMap[label] = { period: label, sales: 0, collections: 0 };
      }
      trendMap[label].collections += p.amountPaid;
    });

    const salesVsCollectionTrend = Object.values(trendMap);

    res.json({
      timeframe,
      periodMetrics: {
        totalInvoiced: totalInvoicedInPeriod,
        totalCollected: totalCollectedInPeriod,
        totalDue: totalDueInPeriod,
        orderCount: orders.length,
        paymentCount: payments.length
      },
      paymentModesBreakdown,
      topSellingProducts: topSellingProducts.slice(0, 10),
      volumeByUnitType,
      salesVsCollectionTrend
    });
  } catch (error) {
    console.error('Error fetching BI analytics:', error);
    res.status(500).json({ error: 'Failed to fetch BI analytics' });
  }
};
