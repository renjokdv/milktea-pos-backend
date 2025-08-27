// backend/routes/index.js
const { Router } = require('express');
const router = Router();

// Base API info
router.get('/', (req, res) => {
  res.json({ name: 'MilkTea POS API', version: '1.0' });
});

// Wire up feature routes (make sure these files exist!)
router.use('/auth', require('./auth.routes'));   // e.g. POST /api/auth/login
router.use('/users', require('./user.routes')); // e.g. Admin CRUD

module.exports = router;
