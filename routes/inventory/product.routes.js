const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/inventory/product.controller');

const router = Router();
router.use(requireAuth);

const canManage = ['ADMIN', 'INVENTORY'];

const bodySchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().allow('', null),
  category: Joi.string().required(),
  brand: Joi.string().required(),
  variant: Joi.string().allow('', null),
  unit: Joi.string().required(),
  costPrice: Joi.number().min(0).required(),
  markupType: Joi.string().valid('PERCENT','ABSOLUTE'),
  markupValue: Joi.number().min(0),
});

router.get('/', requireRole(...canManage), ctrl.list);
router.post('/', requireRole(...canManage), celebrate({ [Segments.BODY]: bodySchema }), ctrl.create);
router.get('/:id', requireRole(...canManage), ctrl.get);
router.patch('/:id', requireRole(...canManage), celebrate({ [Segments.BODY]: bodySchema.fork(Object.keys(bodySchema.describe().keys), s => s.optional()) }), ctrl.update);
router.delete('/:id', requireRole(...canManage), ctrl.remove);

module.exports = router;

