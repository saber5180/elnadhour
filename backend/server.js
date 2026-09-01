const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const uploadDir = require('./config/uploadDir');

const { ensureSchema } = require('./db/ensureSchema');

// Import routes
const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const menuItemsRoutes = require('./routes/menuItems');
const liveStreamRoutes = require('./routes/liveStream');
const heroImagesRoutes = require('./routes/heroImages');
const ambienceRoutes = require('./routes/ambience');
const reservationsRoutes = require('./routes/reservations');
const subcategoriesRoutes = require('./routes/subcategories');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

function parseOriginList(value) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Origines CORS : fusion de ALLOWED_ORIGINS et CORS_ORIGINS (même format, virgules).
 * Les deux sont optionnels ; en dev, localhost est toujours ajouté.
 */
function getAllowedOrigins() {
  const fromPrimary = parseOriginList(process.env.ALLOWED_ORIGINS);
  const fromAlias = parseOriginList(process.env.CORS_ORIGINS);
  const fromEnv = [...new Set([...fromPrimary, ...fromAlias])];

  const local = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5173',
  ];

  if (process.env.NODE_ENV === 'production') {
    return fromEnv.length ? fromEnv : local;
  }
  return [...new Set([...local, ...fromEnv])];
}

const allowedOrigins = getAllowedOrigins();

/** When true, allow any https://*.vercel.app origin (fixes preview URLs & slug mismatches vs ALLOWED_ORIGINS). */
function isVercelAppOrigin(origin) {
  if (!origin || typeof origin !== 'string') return false;
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

const allowAllVercelApp =
  process.env.CORS_ALLOW_VERCEL_APP === 'true' ||
  process.env.CORS_ALLOW_VERCEL_APP === '1';

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowAllVercelApp && isVercelAppOrigin(origin)) {
      return callback(null, origin);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists (Docker volume + local dev)
// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/subcategories', subcategoriesRoutes);
app.use('/api/menu-items', menuItemsRoutes);
app.use('/api/live', liveStreamRoutes);
app.use('/api/hero-images', heroImagesRoutes);
app.use('/api/ambience', ambienceRoutes);
app.use('/api/reservations', reservationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Café API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server after DB schema checks (do not listen if schema fails — avoids opaque 500s)
(async () => {
  try {
    await ensureSchema();
    console.log('✅ Database schema OK (users, categories, subcategories, menu_items)');
  } catch (err) {
    console.error('❌ ensureSchema failed — fix DATABASE_URL / DB permissions and redeploy:', err);
    process.exit(1);
    return;
  }

  app.listen(PORT, () => {
    console.log('🚀 Café API Server started');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS allowed origins (${allowedOrigins.length}):`, allowedOrigins.join(', ') || '(none)');
    console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || 'uploads'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log('---');
    console.log('🎯 API Endpoints:');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/auth/profile');
    console.log('   GET  /api/categories');
    console.log('   POST /api/categories (admin)');
    console.log('   GET  /api/menu-items');
    console.log('   POST /api/menu-items (admin)');
    console.log('   GET  /api/hero-images');
    console.log('---');
  });
})(); 
