// backend/routes/auth.routes.js
const { Router } = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { login } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post(
  '/login',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  login
);

// return current user based on JWT
router.get('/me', requireAuth, (req, res) => {
  const { id, role, name, email } = req.user || {};
  return res.json({ id, role, name, email });
});

module.exports = router;
