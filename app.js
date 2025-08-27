// backend/app.js
// PURPOSE: Configure hardened Express app.
// REASON: Security, performance, validation, and consistent error handling.

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const fs = require('fs');
const path = require('path');

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errors');
const routes = require('./routes');
const ENV = require('./config/env');

const app = express();

// --- Security headers ---
app.use(helmet());

// (optional but recommended): gzip responses
app.use(compression());

// --- CORS (restrict in prod) ---
if (ENV.CORS_ORIGINS.length > 0) {
  app.use(
    cors({
      origin: (origin, cb) => {
        // allow tools like curl/postman (no origin)
        if (!origin) return cb(null, true);
        return ENV.CORS_ORIGINS.includes(origin)
          ? cb(null, true)
          : cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
} else {
  app.use(cors()); // dev-friendly default
}

// --- Body parsers ---
app.use(express.json({ limit: '1mb' })); // prevent giant payloads
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- Input sanitation ---
app.use(mongoSanitize()); // strips $ and . from inputs
app.use(xssClean());      // neutralize basic XSS payloads

// --- Rate limiting (tighten in prod if needed) ---
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.isProd ? 300 : 1000, // lower cap in prod
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
  })
);

// --- Logging (to file in prod, console in dev) ---
if (ENV.isProd) {
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream })); // Apache combined format
} else {
  app.use(morgan('dev'));
}

// --- Connect DB ---
connectDB();

// --- Health & root ---
app.get('/health', (req, res) => res.json({ ok: true, env: ENV.NODE_ENV }));
app.get('/', (req, res) => res.json({ name: 'MilkTea POS API', version: '1.0' }));

// --- API routes ---
app.use('/api', routes);

// --- 404 & Errors ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
