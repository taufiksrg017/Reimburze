require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());

// Rate limit login
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/reimbursements', require('./src/routes/reimbursementRoutes'));
app.use('/api/reimbursements', require('./src/routes/verificationRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/cash', require('./src/routes/cashRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// === TAMBAHAN BUAT JALAN DI LOKAL ===
// Kalau lu jalanin di laptop (bukan di Vercel), nyalain servernya di port 4000
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Reimburze API on :${PORT}`));
}

// === BUAT VERCEL ===
module.exports = app;