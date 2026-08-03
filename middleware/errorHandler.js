const errorHandler = (err, req, res, next) => {
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size exceeds the allowed limit.', field: null });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: `Unexpected upload field: ${err.field || 'unknown'}.`, field: err.field || null });
  }
  if (err.message && err.message.startsWith('Invalid audio')) {
    return res.status(400).json({ error: err.message, field: 'audio' });
  }
  if (err.message && err.message.startsWith('Invalid image')) {
    return res.status(400).json({ error: err.message, field: 'image' });
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || null;
    return res.status(409).json({
      error: `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists.`,
      field,
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: err.errors.map((e) => e.message).join(', '),
      field: err.errors?.[0]?.path || null,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'production') {
    return res.status(statusCode).json({ error: message, field: null });
  }

  return res.status(statusCode).json({
    error: message,
    field: null,
    stack: err.stack,
  });
};

module.exports = errorHandler;
