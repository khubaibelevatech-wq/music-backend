require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec, swaggerUiOptions } = require('./config/swagger');
const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const musicRoutes = require('./routes/musicRoutes');
const albumRoutes = require('./routes/albumRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Initialize Express app
const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : []),
  'http://localhost:3000',
  'http://localhost:3001',
  'https://toti-music.netlify.app',
].filter(Boolean).map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { error: 'Too many requests from this IP. Please try again later.', field: null },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🎵 Welcome to Music Sharing Platform API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Swagger API documentation
app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.', field: null });
});

// Global error handler
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎵  Music Sharing Platform API                              ║
║                                                               ║
║   Server:        http://localhost:${PORT}                        ║
║   API Docs:      http://localhost:${PORT}/api-docs               ║
║   Environment:   ${process.env.NODE_ENV || 'development'}                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
