const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BronzeEvent = require('../models/BronzeEvent');
const Tenant = require('../models/Tenant');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const products = [
  { id: 'PRD001', name: 'Wireless Headphones', category: 'Electronics', price: 79.99 },
  { id: 'PRD002', name: 'Smart Watch', category: 'Electronics', price: 199.99 },
  { id: 'PRD003', name: 'Laptop Backpack', category: 'Accessories', price: 49.99 },
  { id: 'PRD004', name: 'USB-C Cable', category: 'Accessories', price: 12.99 },
  { id: 'PRD005', name: 'Bluetooth Speaker', category: 'Electronics', price: 89.99 },
  { id: 'PRD006', name: 'Phone Case', category: 'Accessories', price: 19.99 },
  { id: 'PRD007', name: 'Wireless Mouse', category: 'Electronics', price: 29.99 },
  { id: 'PRD008', name: 'Keyboard', category: 'Electronics', price: 69.99 },
  { id: 'PRD009', name: 'Monitor Stand', category: 'Accessories', price: 39.99 },
  { id: 'PRD010', name: 'Webcam', category: 'Electronics', price: 59.99 },
  { id: 'PRD011', name: 'Desk Lamp', category: 'Home', price: 34.99 },
  { id: 'PRD012', name: 'Coffee Mug', category: 'Home', price: 14.99 },
  { id: 'PRD013', name: 'Water Bottle', category: 'Home', price: 24.99 },
  { id: 'PRD014', name: 'Notebook', category: 'Stationery', price: 9.99 },
  { id: 'PRD015', name: 'Pen Set', category: 'Stationery', price: 15.99 },
];

const searchQueries = [
  'wireless headphones', 'smart watch', 'laptop bag', 'usb cable', 'bluetooth speaker',
  'phone accessories', 'computer mouse', 'gaming keyboard', 'office supplies', 'home decor'
];

const deviceTypes = ['mobile', 'tablet', 'desktop'];
const countries = ['US', 'UK', 'Canada', 'Australia', 'Germany'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

async function generateDemoData(tenantId, numSessions = 1000) {
  console.log(`🎲 Generating demo data for ${numSessions} sessions...`);
  
  const events = [];
  
  for (let i = 0; i < numSessions; i++) {
    const sessionId = `session_${i}_${Date.now()}`;
    const userId = Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 500)}` : null;
    const deviceType = randomElement(deviceTypes);
    const country = randomElement(countries);
    const timestamp = randomDate(30);
    
    // Page view (always)
    events.push({
      tenantId,
      eventType: 'page_view',
      sessionId,
      userId,
      timestamp: new Date(timestamp.getTime() + 1000),
      pageUrl: '/home',
      deviceType,
      country,
    });
    
    // 70% view products
    if (Math.random() > 0.3) {
      const product = randomElement(products);
      events.push({
        tenantId,
        eventType: 'product_view',
        sessionId,
        userId,
        timestamp: new Date(timestamp.getTime() + 5000),
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.price,
        pageUrl: `/product/${product.id}`,
        deviceType,
        country,
      });
      
      // 40% add to cart
      if (Math.random() > 0.6) {
        events.push({
          tenantId,
          eventType: 'add_to_cart',
          sessionId,
          userId,
          timestamp: new Date(timestamp.getTime() + 10000),
          productId: product.id,
          productName: product.name,
          category: product.category,
          price: product.price,
          quantity: Math.floor(Math.random() * 3) + 1,
          deviceType,
          country,
        });
        
        // 50% start checkout
        if (Math.random() > 0.5) {
          events.push({
            tenantId,
            eventType: 'checkout_start',
            sessionId,
            userId,
            timestamp: new Date(timestamp.getTime() + 15000),
            deviceType,
            country,
          });
          
          // 70% complete purchase
          if (Math.random() > 0.3) {
            const quantity = Math.floor(Math.random() * 2) + 1;
            events.push({
              tenantId,
              eventType: 'purchase',
              sessionId,
              userId,
              timestamp: new Date(timestamp.getTime() + 20000),
              productId: product.id,
              productName: product.name,
              category: product.category,
              price: product.price,
              quantity,
              orderId: `order_${Date.now()}_${i}`,
              orderTotal: product.price * quantity,
              deviceType,
              country,
            });
          }
        }
      }
    }
    
    // 20% perform search
    if (Math.random() > 0.8) {
      events.push({
        tenantId,
        eventType: 'search',
        sessionId,
        userId,
        timestamp: new Date(timestamp.getTime() + 3000),
        searchQuery: randomElement(searchQueries),
        deviceType,
        country,
      });
    }
    
    if (i % 100 === 0) {
      console.log(`Generated ${i} sessions...`);
    }
  }
  
  console.log(`📊 Inserting ${events.length} events into Bronze layer...`);
  await BronzeEvent.insertMany(events);
  console.log('✅ Demo data generated successfully!');
}

async function main() {
  try {
    // Connect to database first
    await connectDB();
    
    // Get the first tenant or prompt for tenant ID
    const tenants = await Tenant.find().limit(1);
    
    if (tenants.length === 0) {
      console.log('❌ No tenants found. Please register a tenant first!');
      process.exit(1);
    }
    
    const tenant = tenants[0];
    console.log(`🏪 Using tenant: ${tenant.storeName} (${tenant._id})`);
    
    await generateDemoData(tenant._id, 1000);
    
    console.log('\n🎉 All done! Now click the "Process Data" button in your dashboard!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();