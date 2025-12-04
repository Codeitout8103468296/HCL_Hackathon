const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
// In test mode, env vars should already be set by test setup
if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

const app = express();

// Middleware
// Allow multiple origins for development (Vite uses 5173, Create React App uses 3000)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const FRONTEND_URL = process.env.FRONTEND_URL || allowedOrigins;
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wellness', require('./routes/wellness'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/advisories', require('./routes/advisories'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/symptoms', require('./routes/symptoms'));
app.use('/api/rules', require('./routes/rules'));
app.use('/emergency', require('./routes/emergency'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to MongoDB (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  // Hardcoded MongoDB URI
  const mongoUri = 'mongodb://localhost:27017/healthcare_wellness';
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize database on first setup (only if AUTO_INIT is enabled or not set)
    if (process.env.AUTO_INIT !== 'false') {
      try {
        const initialize = require('./scripts/init');
        await initialize();
      } catch (error) {
        // Don't fail server startup if init fails, just log it
        console.warn('⚠️  Database initialization warning:', error.message);
      }
    }
    
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
}

module.exports = app;

