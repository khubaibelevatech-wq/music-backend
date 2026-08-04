require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec, swaggerUiOptions } = require('./config/swagger');
const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const musicRoutes = require('./routes/musicRoutes');
const albumRoutes = require('./routes/albumRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
app.set('trust proxy', 1);

let dbReady;

const ensureDatabase = () => {
  if (!dbReady) {
    dbReady = connectDB().catch((error) => {
      dbReady = null;
      throw error;
    });
  }

  return dbReady;
};

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : []),
  'http://localhost:3000',
  'http://localhost:3001',
  'https://music-frontend-pi-tan.vercel.app',
  'https://toti-music.netlify.app',
].filter(Boolean).map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use('/uploads', express.static('uploads'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests from this IP. Please try again later.', field: null },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Music Sharing Platform API',
    version: '1.0.0',
    documentation: '/api-docs',
    status: 'ok',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.use('/api', async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.', field: null });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await ensureDatabase();

    app.listen(PORT, () => {
      console.log(`Music Sharing Platform API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    if (process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
