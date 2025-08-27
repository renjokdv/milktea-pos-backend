// backend/routes/index.js
const { Router } = require('express');
const router = Router();

// Base API info
router.get('/', (req, res) => {
  res.json({ name: 'MilkTea POS API', version: '1.0' });
});

// Wire up feature routes
router.use('/auth', require('./auth.routes'));           // e.g. POST /api/auth/login
router.use('/users', require('./user.routes'));          // e.g. Admin CRUD
router.use('/inventory', require('./inventory/masters.routes')); // e.g. Inventory CRUD
router.use('/inventory/products', require('./inventory/product.routes'));
router.use('/inventory/stock', require('./inventory/stock.routes'));



module.exports = router;
