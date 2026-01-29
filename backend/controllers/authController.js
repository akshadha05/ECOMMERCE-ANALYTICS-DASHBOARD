const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Tenant = require('../models/Tenant');

// Register new tenant
exports.register = async (req, res) => {
  try {
    const { storeName, email, password, domain } = req.body;

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({ $or: [{ email }, { storeName }] });
    if (existingTenant) {
      return res.status(400).json({ error: 'Store name or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex');

    // Create tenant
    const tenant = new Tenant({
      storeName,
      email,
      password: hashedPassword,
      domain,
      apiKey,
    });

    await tenant.save();

    // Generate JWT
    const token = jwt.sign(
      { tenantId: tenant._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Tenant registered successfully',
      token,
      tenant: {
        id: tenant._id,
        storeName: tenant.storeName,
        email: tenant.email,
        domain: tenant.domain,
        apiKey: tenant.apiKey,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login tenant
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find tenant
    const tenant = await Tenant.findOne({ email });
    if (!tenant) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, tenant.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if active
    if (!tenant.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Generate JWT
    const token = jwt.sign(
      { tenantId: tenant._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      tenant: {
        id: tenant._id,
        storeName: tenant.storeName,
        email: tenant.email,
        domain: tenant.domain,
        apiKey: tenant.apiKey,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current tenant info
exports.getCurrentTenant = async (req, res) => {
  try {
    res.json({
      tenant: {
        id: req.tenant._id,
        storeName: req.tenant.storeName,
        email: req.tenant.email,
        domain: req.tenant.domain,
        apiKey: req.tenant.apiKey,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};