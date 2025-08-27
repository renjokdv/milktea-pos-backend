// backend/middleware/errors.js
// Unified 404 + error handler to keep consistent API responses

function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal Server Error',
  };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack; // helpful during dev
  }
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
