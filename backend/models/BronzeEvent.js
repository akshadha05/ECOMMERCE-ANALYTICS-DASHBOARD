const mongoose = require('mongoose');

const bronzeEventSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: ['page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'purchase', 'search'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  sessionId: String,
  userId: String,
  productId: String,
  productName: String,
  category: String,
  price: Number,
  quantity: Number,
  orderId: String,
  orderTotal: Number,
  searchQuery: String,
  pageUrl: String,
  referrer: String,
  deviceType: String,
  browser: String,
  country: String,
  metadata: mongoose.Schema.Types.Mixed,
});

// Index for efficient querying
bronzeEventSchema.index({ tenantId: 1, timestamp: -1 });
bronzeEventSchema.index({ tenantId: 1, eventType: 1, timestamp: -1 });

module.exports = mongoose.model('BronzeEvent', bronzeEventSchema);