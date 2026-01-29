const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { authenticateApiKey, authenticate } = require('../middleware/auth');

router.post('/ingest', authenticateApiKey, eventsController.ingestEvent);
router.post('/ingest/bulk', authenticateApiKey, eventsController.ingestBulkEvents);
router.post('/process', authenticate, eventsController.processData);

module.exports = router;