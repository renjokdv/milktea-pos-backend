// backend/routes/auth.routes.js
const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { login } = require('../controllers/auth.controller');

const router = Router();

// Validate login body with Joi
router.post(
  '/login',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    })
  }),
  login
);

module.exports = router;
