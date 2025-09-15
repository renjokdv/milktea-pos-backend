// backend/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const fs = require('fs');
const path = require('path');

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errors');
const routes = require('./routes');
const ENV = require('./config/env');

const app = express();

app.use(helmet());
app.use(compression());

if (ENV.CORS_ORIGINS.length > 0) {
  app.use(
    cors({
      origin: (origin, cb) => (!origin ? cb(null, true) : (ENV.CORS_ORIGINS.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS')))),
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use((req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') mongoSanitize.sanitize(req.body);
    if (req.params && typeof req.params === 'object') mongoSanitize.sanitize(req.params);
    if (req.headers && typeof req.headers === 'object') mongoSanitize.sanitize(req.headers);
    if (req.query && typeof req.query === 'object') mongoSanitize.sanitize(req.query);
    next();
  } catch (err) {
    next(err);
  }
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: ENV.isProd ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
  })
);

if (ENV.isProd) {
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}

connectDB();

app.get('/health', (req, res) => res.json({ ok: true, env: ENV.NODE_ENV }));
app.get('/', (req, res) => res.json({ name: 'MilkTea POS API', version: '1.0' }));

// serve uploaded files (avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
