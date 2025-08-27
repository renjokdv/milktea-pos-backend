// backend/utils/jwt.js
const jwt = require('jsonwebtoken');

function sign(payload, expiresIn = '8h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { sign, verify };
