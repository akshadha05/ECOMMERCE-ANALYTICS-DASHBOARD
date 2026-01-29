const BronzeEvent = require('../models/BronzeEvent');
const { processBronzeToSilver, processSilverToGold } = require('../utils/dataProcessor');

// Ingest event (Bronze layer)
exports.ingestEvent = async (req, res) => {
  try {
    const eventData = {
      tenantId: req.tenantId,
      ...req.body,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
    };

    const bronzeEvent = new BronzeEvent(eventData);
    await bronzeEvent.save();

    res.status(201).json({
      message: 'Event ingested successfully',
      eventId: bronzeEvent._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ingest multiple events (bulk)
exports.ingestBulkEvents = async (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Events array is required' });
    }

    const bronzeEvents = events.map(event => ({
      tenantId: req.tenantId,
      ...event,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }));

    await BronzeEvent.insertMany(bronzeEvents);

    res.status(201).json({
      message: 'Bulk events ingested successfully',
      count: bronzeEvents.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Process data pipeline
exports.processData = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Bronze to Silver
    const silverCount = await processBronzeToSilver(req.tenantId, start, end);

    // Silver to Gold (process each day)
    const days = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const day of days) {
      await processSilverToGold(req.tenantId, day);
    }

    res.json({
      message: 'Data processing completed',
      silverEventsProcessed: silverCount,
      daysProcessed: days.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};