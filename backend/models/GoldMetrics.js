const mongoose = require('mongoose');

const goldMetricsSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  },
  
  // Revenue Metrics
  totalRevenue: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  averageOrderValue: {
    type: Number,
    default: 0,
  },
  
  // Traffic Metrics
  totalPageViews: {
    type: Number,
    default: 0,
  },
  uniqueVisitors: {
    type: Number,
    default: 0,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  
  // Conversion Metrics
  conversionRate: {
    type: Number,
    default: 0,
  },
  cartAbandonmentRate: {
    type: Number,
    default: 0,
  },
  
  // Product Metrics
  totalProductViews: {
    type: Number,
    default: 0,
  },
  totalAddToCarts: {
    type: Number,
    default: 0,
  },
  addToCartRate: {
    type: Number,
    default: 0,
  },
  
  // Top Products
  topProducts: [{
    productId: String,
    productName: String,
    revenue: Number,
    quantity: Number,
    views: Number,
  }],
  
  // Top Categories
  topCategories: [{
    category: String,
    revenue: Number,
    orders: Number,
  }],
  
  // Device Breakdown
  deviceBreakdown: {
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
  },
  
  // Search Metrics
  topSearches: [{
    query: String,
    count: Number,
  }],
  
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
});

goldMetricsSchema.index({ tenantId: 1, date: -1 });
goldMetricsSchema.index({ tenantId: 1, period: 1, date: -1 });

module.exports = mongoose.model('GoldMetrics', goldMetricsSchema);