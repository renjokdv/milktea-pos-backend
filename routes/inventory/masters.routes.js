// backend/routes/inventory/masters.routes.js
const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const make = require('../../helpers/crudFactory').makeCrud;

const Category = require('../../models/inventory/Category');
const Brand    = require('../../models/inventory/Brand');
const Variant  = require('../../models/inventory/Variant');
const Unit     = require('../../models/inventory/Unit');

const router = Router();
router.use(requireAuth); // all inventory endpoints require auth

// ROLE MATRIX:
// ADMIN can full CRUD
// INVENTORY can full CRUD
// CASHIER no access here
const canManage = [ 'ADMIN', 'INVENTORY' ];

const validateName = celebrate({
  [Segments.BODY]: Joi.object({ name: Joi.string().min(1).required() })
});

// helper to mount a group quickly
function mount(path, Model) {
  const c = make(Model);
  router.get(`/${path}`, requireRole(...canManage), c.list);
  router.post(`/${path}`, requireRole(...canManage), validateName, c.create);
  router.get(`/${path}/:id`, requireRole(...canManage), c.get);
  router.patch(`/${path}/:id`, requireRole(...canManage), validateName, c.update);
  router.delete(`/${path}/:id`, requireRole(...canManage), c.remove);
}

mount('categories', Category);
mount('brands', Brand);
mount('variants', Variant);
mount('units', Unit);

module.exports = router;
