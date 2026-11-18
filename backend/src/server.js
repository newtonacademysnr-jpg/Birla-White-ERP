require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (e.g. birlaabg.svg logo)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API Routes
app.use('/api/stockists', stockistRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pjp', pjpRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'UltraTech Cement Ltd. - Unit Birla White ERP',
    timestamp: new Date().toISOString(),
    defaultUser: {
      name: 'Suraj (PZ7550)',
      mobile: '8219796922',
      email: 'suraj-v@adityabirla.com',
      company: 'UltraTech Cement Ltd. - Unit Birla White'
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Birla White Sales & Distribution ERP API Server Running.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` BIRLA WHITE ERP BACKEND SERVER ACTIVE ON PORT ${PORT}`);
  console.log(` Organisation: UltraTech Cement Ltd. - Unit Birla White`);
  console.log(` Connected Database: PostgreSQL (birla_white_erp)`);
  console.log(` Default Operator: Suraj (PZ7550) | 8219796922`);
  console.log(`=======================================================`);
});
