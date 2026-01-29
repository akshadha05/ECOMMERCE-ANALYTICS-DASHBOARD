const mongoose = require('mongoose');

const silverEventSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  sessionId: String,
  userId: String,
  
  // Product Information (cleaned)
  productId: String,
  productName: String,
  category: String,
  price: {
    type: Number,
    min: 0,
  },
  quantity: {
    type: Number,
    min: 1,
    default: 1,
  },
  
  // Order Information (cleaned)
  orderId: String,
  orderTotal: {
    type: Number,
    min: 0,
  },
  
  // Additional cleaned fields
  searchQuery: String,
  pageUrl: String,
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown',
  },
  country: String,
  
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

silverEventSchema.index({ tenantId: 1, timestamp: -1 });
silverEventSchema.index({ tenantId: 1, eventType: 1, timestamp: -1 });
silverEventSchema.index({ tenantId: 1, productId: 1 });

module.exports = mongoose.model('SilverEvent', silverEventSchema);