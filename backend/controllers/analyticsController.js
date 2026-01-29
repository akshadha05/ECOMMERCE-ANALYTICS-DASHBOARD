const GoldMetrics = require('../models/GoldMetrics');
const SilverEvent = require('../models/SilverEvent');

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const metrics = await GoldMetrics.find({
      tenantId: req.tenantId,
      date: { $gte: start, $lte: end },
      period: 'daily',
    }).sort({ date: 1 });

    // Aggregate totals
    const totals = metrics.reduce((acc, metric) => {
      acc.totalRevenue += metric.totalRevenue;
      acc.totalOrders += metric.totalOrders;
      acc.totalPageViews += metric.totalPageViews;
      acc.uniqueVisitors += metric.uniqueVisitors;
      acc.totalSessions += metric.totalSessions;
      acc.totalProductViews += metric.totalProductViews;
      acc.totalAddToCarts += metric.totalAddToCarts;
      return acc;
    }, {
      totalRevenue: 0,
      totalOrders: 0,
      totalPageViews: 0,
      uniqueVisitors: 0,
      totalSessions: 0,
      totalProductViews: 0,
      totalAddToCarts: 0,
    });

    // Calculate averages
    const avgConversionRate = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.conversionRate, 0) / metrics.length
      : 0;

    const avgCartAbandonmentRate = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.cartAbandonmentRate, 0) / metrics.length
      : 0;

    const avgOrderValue = totals.totalOrders > 0
      ? totals.totalRevenue / totals.totalOrders
      : 0;

    const addToCartRate = totals.totalProductViews > 0
      ? (totals.totalAddToCarts / totals.totalProductViews) * 100
      : 0;

    res.json({
      overview: {
        totalRevenue: totals.totalRevenue,
        totalOrders: totals.totalOrders,
        averageOrderValue: avgOrderValue,
        conversionRate: avgConversionRate,
        cartAbandonmentRate: avgCartAbandonmentRate,
        totalPageViews: totals.totalPageViews,
        uniqueVisitors: totals.uniqueVisitors,
        totalSessions: totals.totalSessions,
        addToCartRate: addToCartRate,
      },
      dailyMetrics: metrics,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get revenue trends
exports.getRevenueTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const metrics = await GoldMetrics.find({
      tenantId: req.tenantId,
      date: { $gte: start, $lte: end },
      period: 'daily',
    }).sort({ date: 1 }).select('date totalRevenue totalOrders averageOrderValue');

    res.json({ trends: metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get top products
exports.getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const metrics = await GoldMetrics.find({
      tenantId: req.tenantId,
      date: { $gte: start, $lte: end },
      period: 'daily',
    });

    // Aggregate products across all days
    const productMap = {};
metrics.forEach(metric => {
  metric.topProducts.forEach(product => {
    if (!productMap[product.productId]) {
      productMap[product.productId] = {
        productId: product.productId,
        productName: product.productName,
        totalRevenue: 0,
        totalQuantity: 0,
        totalViews: 0,
      };
    }
    productMap[product.productId].totalRevenue += product.revenue || 0;
    productMap[product.productId].totalQuantity += product.quantity || 0;
    productMap[product.productId].totalViews += product.views || 0;
  });
});

const topProducts = Object.values(productMap)
  .sort((a, b) => b.totalRevenue - a.totalRevenue)
  .slice(0, parseInt(limit));

res.json({ topProducts });
} catch (error) {
res.status(500).json({ error: error.message });
}
};
// Get conversion funnel
exports.getConversionFunnel = async (req, res) => {
try {
const { startDate, endDate } = req.query;
const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const end = endDate ? new Date(endDate) : new Date();

const events = await SilverEvent.aggregate([
  {
    $match: {
      tenantId: req.tenantId,
      timestamp: { $gte: start, $lte: end },
    },
  },
  {
    $group: {
      _id: '$eventType',
      count: { $sum: 1 },
    },
  },
]);

const funnelData = {
  pageViews: 0,
  productViews: 0,
  addToCarts: 0,
  checkouts: 0,
  purchases: 0,
};

events.forEach(event => {
  switch (event._id) {
    case 'page_view':
      funnelData.pageViews = event.count;
      break;
    case 'product_view':
      funnelData.productViews = event.count;
      break;
    case 'add_to_cart':
      funnelData.addToCarts = event.count;
      break;
    case 'checkout_start':
      funnelData.checkouts = event.count;
      break;
    case 'purchase':
      funnelData.purchases = event.count;
      break;
  }
});

res.json({ funnel: funnelData });
} catch (error) {
res.status(500).json({ error: error.message });
}
};
// Get category performance
exports.getCategoryPerformance = async (req, res) => {
try {
const { startDate, endDate } = req.query;
const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const end = endDate ? new Date(endDate) : new Date();

const metrics = await GoldMetrics.find({
  tenantId: req.tenantId,
  date: { $gte: start, $lte: end },
  period: 'daily',
});

// Aggregate categories
const categoryMap = {};

metrics.forEach(metric => {
  metric.topCategories.forEach(cat => {
    if (!categoryMap[cat.category]) {
      categoryMap[cat.category] = {
        category: cat.category,
        totalRevenue: 0,
        totalOrders: 0,
      };
    }
    categoryMap[cat.category].totalRevenue += cat.revenue || 0;
    categoryMap[cat.category].totalOrders += cat.orders || 0;
  });
});

const categories = Object.values(categoryMap)
  .sort((a, b) => b.totalRevenue - a.totalRevenue);

res.json({ categories });
} catch (error) {
res.status(500).json({ error: error.message });
}
};
// Get device breakdown
exports.getDeviceBreakdown = async (req, res) => {
try {
const { startDate, endDate } = req.query;
const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const end = endDate ? new Date(endDate) : new Date();

const metrics = await GoldMetrics.find({
  tenantId: req.tenantId,
  date: { $gte: start, $lte: end },
  period: 'daily',
});

const deviceTotals = {
  mobile: 0,
  tablet: 0,
  desktop: 0,
};

metrics.forEach(metric => {
  deviceTotals.mobile += metric.deviceBreakdown.mobile || 0;
  deviceTotals.tablet += metric.deviceBreakdown.tablet || 0;
  deviceTotals.desktop += metric.deviceBreakdown.desktop || 0;
});

const total = deviceTotals.mobile + deviceTotals.tablet + deviceTotals.desktop;

const deviceBreakdown = [
  { device: 'Mobile', count: deviceTotals.mobile, percentage: total > 0 ? (deviceTotals.mobile / total) * 100 : 0 },
  { device: 'Tablet', count: deviceTotals.tablet, percentage: total > 0 ? (deviceTotals.tablet / total) * 100 : 0 },
  { device: 'Desktop', count: deviceTotals.desktop, percentage: total > 0 ? (deviceTotals.desktop / total) * 100 : 0 },
];

res.json({ deviceBreakdown });
} catch (error) {
res.status(500).json({ error: error.message });
}
};
// Get search analytics
exports.getSearchAnalytics = async (req, res) => {
try {
const { startDate, endDate } = req.query;
const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const end = endDate ? new Date(endDate) : new Date();

const metrics = await GoldMetrics.find({
  tenantId: req.tenantId,
  date: { $gte: start, $lte: end },
  period: 'daily',
});

const searchMap = {};

metrics.forEach(metric => {
  metric.topSearches.forEach(search => {
    if (!searchMap[search.query]) {
      searchMap[search.query] = 0;
    }
    searchMap[search.query] += search.count;
  });
});

const topSearches = Object.entries(searchMap)
  .map(([query, count]) => ({ query, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

res.json({ topSearches });
} catch (error) {
res.status(500).json({ error: error.message });
}
};

