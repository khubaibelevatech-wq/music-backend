const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({ error: first.msg, field: first.path });
  }
  next();
};

const musicUploadValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.'),
  body('genre').optional().trim(),
  body('description').optional().trim(),
  body('duration')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer (seconds).'),
  body('album_id')
    .optional()
    .isInt({ min: 1 }).withMessage('album_id must be a valid integer.'),
  handleValidationErrors,
];

const albumCreateValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Album title is required.'),
  body('description').optional().trim(),
  body('release_date')
    .optional()
    .isDate().withMessage('release_date must be a valid date (YYYY-MM-DD).'),
  body('track_ids')
    .optional()
    .custom((value) => {
      let ids = [];

      if (Array.isArray(value)) {
        ids = value;
      } else {
        try {
          const parsed = JSON.parse(value);
          ids = Array.isArray(parsed) ? parsed : [];
        } catch {
          ids = String(value)
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
        }
      }

      if (ids.length > 5) {
        throw new Error('You can add a maximum of 5 tracks to an album.');
      }

      const allValid = ids.every((id) => Number.isInteger(Number(id)) && Number(id) > 0);
      if (!allValid) {
        throw new Error('track_ids must contain valid music track IDs.');
      }

      return true;
    }),
  handleValidationErrors,
];

module.exports = { musicUploadValidator, albumCreateValidator };
