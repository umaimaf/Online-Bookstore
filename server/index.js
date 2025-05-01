// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db/db');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/order');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const adminProductRoutes = require('./routes/adminProducts');
const adminOrderRoutes = require('./routes/adminOrders');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');
const { setupWebSocket } = require('./websocket');

const app = express();
const port = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database connection pool
    await connectDB();
    console.log('✅ DB connected and ready');

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Serve static files from the client/public/images directory
    app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
    console.log('Images directory:', path.join(__dirname, '../client/public/images')); // Debug log

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/order', orderRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/admin/products', adminProductRoutes);
    app.use('/api/admin/orders', adminOrderRoutes);
    app.use('/api/admin', adminRoutes);

    // Start HTTP server
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Initialize WebSocket server
    const wss = setupWebSocket(server);
    console.log('✅ WebSocket server started on port 5001');

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();
