// backend/config/env.js
// PURPOSE: Single place to read and validate environment variables.
// REASON: Avoid "undefined" env bugs and keep production safe defaults.

require('dotenv').config();

const required = (name, fallback = undefined) => {
  const val = process.env[name] ?? fallback;
  if (val === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
};

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  // CORS allowlist (comma-separated) e.g. "http://localhost:5173,https://pos.yourdomain.com"
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim()).filter(Boolean),
  isProd,
};
