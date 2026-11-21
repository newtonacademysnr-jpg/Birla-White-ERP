require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Middlewares
const { requireAuth } = require('./middlewares/authMiddleware');
const csrfProtection = require('./middlewares/csrfProtection');

// Routes
const authRoutes = require('./routes/authRoutes');
const stockistRoutes = require('./routes/stockistRoutes');
const retailerRoutes = require('./routes/retailerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const pjpRoutes = require('./routes/pjpRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// 1. Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. Strict CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server or mobile requests without origin header
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS error: Request origin not authorized by Birla White Security Policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));

// 3. Body & Cookie Parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// 4. Rate Limiting Protection
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // max 20 login attempts per 15 minutes
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

app.use('/api/', generalApiLimiter);
app.use('/api/auth/login', authLimiter);

// 5. Anti-CSRF on mutating API requests (POST, PUT, DELETE)
app.use('/api/', (req, res, next) => {
  // Allow login without CSRF header
  if (req.path === '/auth/login' || req.path === '/auth/logout') {
    return next();
  }
  return csrfProtection(req, res, next);
});

// Serve static assets (e.g. logo)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stockists', requireAuth, stockistRoutes);
app.use('/api/retailers', requireAuth, retailerRoutes);
app.use('/api/products', requireAuth, productRoutes);
app.use('/api/orders', requireAuth, orderRoutes);
app.use('/api/dispatches', requireAuth, dispatchRoutes);
app.use('/api/payments', requireAuth, paymentRoutes);
app.use('/api/analytics', requireAuth, analyticsRoutes);
app.use('/api/pjp', requireAuth, pjpRoutes);

// Sanitized Health Check (Clean production monitoring, zero PII)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'UltraTech Cement Ltd. - Unit Birla White ERP',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Birla White Sales & Distribution ERP API Server Running.');
});

// Sanitized Global Error Handler (Hides internal database stack traces in production)
app.use((err, req, res, next) => {
  console.error('[UNHANDLED_ERROR]', {
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: isProd ? undefined : err.stack
  });

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
    message: isProd
      ? 'An error occurred while processing your request. Please contact system support.'
      : err.message
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` BIRLA WHITE ERP BACKEND SERVER ACTIVE ON PORT ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Security Mode: JWT Authentication & CSRF Protection Active`);
  console.log(`=======================================================`);
});
