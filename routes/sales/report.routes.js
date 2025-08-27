const { Router } = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/sales/report.controller');

const router = Router();
router.use(requireAuth);

// All roles can view reports they need; simplest rule:
router.get('/summary/:period', requireRole('ADMIN','CASHIER'), ctrl.summary);
router.get('/export/:period/csv', requireRole('ADMIN','CASHIER'), ctrl.exportCsv);
router.get('/export/:period/pdf', requireRole('ADMIN','CASHIER'), ctrl.exportPdf);

module.exports = router;
