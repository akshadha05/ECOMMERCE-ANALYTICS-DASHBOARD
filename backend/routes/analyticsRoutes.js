const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.get('/overview', authenticate, analyticsController.getDashboardOverview);
router.get('/revenue-trends', authenticate, analyticsController.getRevenueTrends);
router.get('/top-products', authenticate, analyticsController.getTopProducts);
router.get('/conversion-funnel', authenticate, analyticsController.getConversionFunnel);
router.get('/category-performance', authenticate, analyticsController.getCategoryPerformance);
router.get('/device-breakdown', authenticate, analyticsController.getDeviceBreakdown);
router.get('/search-analytics', authenticate, analyticsController.getSearchAnalytics);

module.exports = router;