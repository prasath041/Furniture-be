const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes statically (required for Vercel bundling)
const authRoutes = require('./routes/authRoutes');
const furnitureRoutes = require('./routes/furnitureRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const woodRoutes = require('./routes/woodRoutes');
const doorRoutes = require('./routes/doorRoutes');
const windowRoutes = require('./routes/windowRoutes');
const lockerRoutes = require('./routes/lockerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const shopkeeperRoutes = require('./routes/shopkeeperRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with caching for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not set');
    return;
  }
  
  try {
    mongoose.set('strictQuery', false);
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    isConnected = false;
  }
};

// Root route (before DB middleware)
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to FurnitureHub API',
    version: '1.0.0'
  });
});

// Health check route (before DB middleware)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FurnitureHub API is running' });
});

// Middleware to ensure DB connection for each request (serverless-friendly)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database middleware error:', err.message);
    next();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/furniture', furnitureRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/woods', woodRoutes);
app.use('/api/doors', doorRoutes);
app.use('/api/windows', windowRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/shopkeeper', shopkeeperRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// Export for Vercel serverless
module.exports = app;

// Only listen when running locally (not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
