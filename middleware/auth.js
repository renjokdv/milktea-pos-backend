// backend/middleware/auth.js
const { verify } = require('../utils/jwt');

function requireAuth(req, res, next) {
  // Expect token in Authorization: Bearer <token>
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  const payload = verify(token);
  if (!payload) return res.status(401).json({ message: 'Invalid token' });

  req.user = payload; // { id, role, name, email }
  next();
}

function requireRole(...roles) {
  // Usage: router.post('/x', requireAuth, requireRole('ADMIN'), handler)
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
