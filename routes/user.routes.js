// backend/routes/user.routes.js
const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { requireAuth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/user.controller');

const router = Router();

// Admin-only user management
router.use(requireAuth, requireRole('ADMIN'));

router.get('/', ctrl.listUsers);
router.get('/:id', ctrl.getUser);

router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      role: Joi.string().valid('ADMIN', 'INVENTORY', 'CASHIER').required(),
      password: Joi.string().min(6).required()
    })
  }),
  ctrl.createUser
);

router.patch(
  '/:id',
  celebrate({
    [Segments.BODY]: Joi.object({
      name: Joi.string(),
      role: Joi.string().valid('ADMIN', 'INVENTORY', 'CASHIER'),
      isActive: Joi.boolean()
    })
  }),
  ctrl.updateUser
);

router.delete('/:id', ctrl.deleteUser);

module.exports = router;
