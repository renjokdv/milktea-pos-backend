// backend/app.js
// Express application configuration (middlewares, routes wiring)
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const { connectDB } = require('./config/db'); // (we'll create this next)
const routes = require('./routes');           // (we'll create progressively)
const { notFound, errorHandler } = require('./middleware/errors'); // (later)

const app = express();

// --- Global Middlewares ---
app.use(helmet());                 // secure headers
app.use(compression());            // gzip responses
app.use(cors());                   // allow CORS (configure later if needed)
app.use(express.json());           // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form bodies
app.use(morgan('dev'));            // request logging

// --- Database ---
connectDB(); // connect right when app boots

// --- Routes ---
app.get('/health', (req, res) => res.json({ ok: true })); // quick probe
app.use('/api', routes); // mount all API routes under /api

// --- Error handlers ---
app.use(notFound);     // 404
app.use(errorHandler); // centralized error formatting

module.exports = app;
