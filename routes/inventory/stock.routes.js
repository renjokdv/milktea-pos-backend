const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/inventory/stock.controller');

const router = Router();
router.use(requireAuth);
const canManage = ['ADMIN','INVENTORY'];

router.get('/', requireRole(...canManage), ctrl.list);
router.post(
  '/',
  requireRole(...canManage),
  celebrate({
    [Segments.BODY]: Joi.object({
      product: Joi.string().required(),
      qty: Joi.number().integer().required(),
      reason: Joi.string().valid('RECEIVE','CORRECTION','SPOILAGE','RETURN','OTHER').required(),
      note: Joi.string().allow('', null)
    })
  }),
  ctrl.create
);

module.exports = router;
