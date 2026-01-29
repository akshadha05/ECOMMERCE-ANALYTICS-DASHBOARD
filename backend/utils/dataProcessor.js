const BronzeEvent = require('../models/BronzeEvent');
const SilverEvent = require('../models/SilverEvent');
const GoldMetrics = require('../models/GoldMetrics');

// Bronze to Silver: Clean and validate data
exports.processBronzeToSilver = async (tenantId, startDate, endDate) => {
  try {
    const bronzeEvents = await BronzeEvent.find({
      tenantId,
      timestamp: { $gte: startDate, $lte: endDate },
    });

    const silverEvents = [];

    for (const event of bronzeEvents) {
      // Data cleaning and validation
      const cleanedEvent = {
        tenantId: event.tenantId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        userId: event.userId,
        processedAt: new Date(),
      };

      // Clean product data
      if (event.productId) {
        cleanedEvent.productId = event.productId.trim();
        cleanedEvent.productName = event.productName?.trim() || 'Unknown Product';
        cleanedEvent.category = event.category?.trim() || 'Uncategorized';
        cleanedEvent.price = event.price && event.price > 0 ? event.price : 0;
        cleanedEvent.quantity = event.quantity && event.quantity > 0 ? event.quantity : 1;
      }

      // Clean order data
      if (event.orderId) {
        cleanedEvent.orderId = event.orderId.trim();
        cleanedEvent.orderTotal = event.orderTotal && event.orderTotal > 0 ? event.orderTotal : 0;
      }

      // Clean search data
      if (event.searchQuery) {
        cleanedEvent.searchQuery = event.searchQuery.trim().toLowerCase();
      }

      // Clean device type
      cleanedEvent.deviceType = ['mobile', 'tablet', 'desktop'].includes(event.deviceType) 
        ? event.deviceType 
        : 'unknown';

      cleanedEvent.country = event.country?.trim();
      cleanedEvent.pageUrl = event.pageUrl?.trim();

      silverEvents.push(cleanedEvent);
    }

    // Bulk insert to Silver layer
    if (silverEvents.length > 0) {
      await SilverEvent.insertMany(silverEvents);
    }

    return silverEvents.length;
  } catch (error) {
    console.error('Error processing Bronze to Silver:', error);
    throw error;
  }
};

// Silver to Gold: Aggregate metrics
exports.processSilverToGold = async (tenantId, date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await SilverEvent.find({
      tenantId,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    // Calculate metrics
    const metrics = {
      tenantId,
      date: startOfDay,
      period: 'daily',
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalPageViews: 0,
      uniqueVisitors: 0,
      totalSessions: 0,
      conversionRate: 0,
      cartAbandonmentRate: 0,
      totalProductViews: 0,
      totalAddToCarts: 0,
      addToCartRate: 0,
      topProducts: [],
      topCategories: [],
      deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
      topSearches: [],
      calculatedAt: new Date(),
    };

    // Track unique users and sessions
    const uniqueUsers = new Set();
    const uniqueSessions = new Set();
    const productStats = {};
    const categoryStats = {};
    const searchStats = {};
    const sessionsWithCheckout = new Set();
    const sessionsWithPurchase = new Set();

    events.forEach(event => {
      if (event.userId) uniqueUsers.add(event.userId);
      if (event.sessionId) uniqueSessions.add(event.sessionId);

      // Count events
      switch (event.eventType) {
        case 'page_view':
          metrics.totalPageViews++;
          break;
          
        case 'product_view':
          metrics.totalProductViews++;
          if (event.productId) {
            if (!productStats[event.productId]) {
              productStats[event.productId] = {
                productId: event.productId,
                productName: event.productName,
                views: 0,
                addToCarts: 0,
                revenue: 0,
                quantity: 0,
              };
            }
            productStats[event.productId].views++;
          }
          break;
          
        case 'add_to_cart':
          metrics.totalAddToCarts++;
          if (event.productId && productStats[event.productId]) {
            productStats[event.productId].addToCarts++;
          }
          break;
          
        case 'checkout_start':
          if (event.sessionId) {
            sessionsWithCheckout.add(event.sessionId);
          }
          break;
          
        case 'purchase':
          metrics.totalOrders++;
          metrics.totalRevenue += event.orderTotal || 0;
          
          if (event.sessionId) {
            sessionsWithPurchase.add(event.sessionId);
          }
          
          if (event.productId) {
            if (!productStats[event.productId]) {
              productStats[event.productId] = {
                productId: event.productId,
                productName: event.productName,
                views: 0,
                addToCarts: 0,
                revenue: 0,
                quantity: 0,
              };
            }
            productStats[event.productId].revenue += (event.price || 0) * (event.quantity || 1);
            productStats[event.productId].quantity += event.quantity || 1;
          }
          
          if (event.category) {
            if (!categoryStats[event.category]) {
              categoryStats[event.category] = {
                category: event.category,
                revenue: 0,
                orders: 0,
              };
            }
            categoryStats[event.category].revenue += (event.price || 0) * (event.quantity || 1);
            categoryStats[event.category].orders++;
          }
          break;
          
        case 'search':
          if (event.searchQuery) {
            searchStats[event.searchQuery] = (searchStats[event.searchQuery] || 0) + 1;
          }
          break;
      }

      // Device breakdown
      if (event.deviceType && metrics.deviceBreakdown[event.deviceType] !== undefined) {
        metrics.deviceBreakdown[event.deviceType]++;
      }
    });

    metrics.uniqueVisitors = uniqueUsers.size;
    metrics.totalSessions = uniqueSessions.size;

    // Calculate derived metrics
    if (metrics.totalOrders > 0) {
      metrics.averageOrderValue = metrics.totalRevenue / metrics.totalOrders;
    }

    if (metrics.totalSessions > 0) {
      metrics.conversionRate = (metrics.totalOrders / metrics.totalSessions) * 100;
    }

    if (sessionsWithCheckout.size > 0) {
      const abandoned = sessionsWithCheckout.size - sessionsWithPurchase.size;
      metrics.cartAbandonmentRate = (abandoned / sessionsWithCheckout.size) * 100;
    }

    if (metrics.totalProductViews > 0) {
      metrics.addToCartRate = (metrics.totalAddToCarts / metrics.totalProductViews) * 100;
    }

    // Top products (by revenue)
    metrics.topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top categories
    metrics.topCategories = Object.values(categoryStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top searches
    metrics.topSearches = Object.entries(searchStats)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Upsert Gold metrics
    await GoldMetrics.findOneAndUpdate(
      { tenantId, date: startOfDay, period: 'daily' },
      metrics,
      { upsert: true, new: true }
    );

    return metrics;
  } catch (error) {
    console.error('Error processing Silver to Gold:', error);
    throw error;
  }
};