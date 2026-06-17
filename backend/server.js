const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow Railway frontend URL in production, or all origins in dev
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : true; // Allow all in development

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/universities', require('./routes/universities'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Marketplace Kampus API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message && err.message.includes('Format file tidak didukung')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Terjadi kesalahan internal server.' });
});

// Auto-seed on startup (triggered by SEED_ON_START=true env var)
async function startServer() {
  if (process.env.SEED_ON_START === 'true') {
    console.log('🌱 SEED_ON_START=true detected, running database seed...');
    try {
      const seed = require('./seed');
      // seed.js calls process.exit() — override it temporarily
      const originalExit = process.exit;
      process.exit = (code) => {
        process.exit = originalExit;
        if (code === 0) {
          console.log('✅ Seed completed, starting server...');
        } else {
          console.error('❌ Seed failed, starting server anyway...');
        }
        app.listen(PORT, () => {
          console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
          console.log(`📦 API tersedia di http://localhost:${PORT}/api`);
          console.log('⚠️  Hapus env var SEED_ON_START setelah ini!');
        });
      };
    } catch (err) {
      console.error('❌ Seed error:', err.message);
    }
  } else {
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`📦 API tersedia di http://localhost:${PORT}/api`);
    });
  }
}

startServer();

