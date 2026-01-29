const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');

// JWT Authentication
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenant = await Tenant.findById(decoded.tenantId);
    
    if (!tenant || !tenant.isActive) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }
    
    req.tenant = tenant;
    req.tenantId = tenant._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API Key Authentication (for event ingestion)
exports.authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    
    const tenant = await Tenant.findOne({ apiKey, isActive: true });
    
    if (!tenant) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    req.tenant = tenant;
    req.tenantId = tenant._id;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};