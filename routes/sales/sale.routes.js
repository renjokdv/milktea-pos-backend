const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/sales/sale.controller');

const router = Router();
router.use(requireAuth);

// CASHIER can create sales & view own sales; ADMIN can view all as well
router.get(
  '/',
  (req, res, next) => { req.isCashierSelfOnly = req.user.role === 'CASHIER'; next(); },
  requireRole('ADMIN', 'CASHIER'),
  ctrl.list
);

router.post(
  '/',
  requireRole('ADMIN', 'CASHIER'),
  celebrate({
    [Segments.BODY]: Joi.object({
      paid: Joi.number().min(0).required(),
      note: Joi.string().allow('', null),
      items: Joi.array().items(Joi.object({
        product: Joi.string().required(),
        qty: Joi.number().integer().min(1).required()
      })).min(1).required()
    })
  }),
  ctrl.create
);

module.exports = router;
