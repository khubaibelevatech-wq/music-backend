const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({ error: first.msg, field: first.path });
  }
  next();
};

const commentValidator = [
  body('comment_text')
    .trim()
    .notEmpty().withMessage('Comment text cannot be empty.'),
  handleValidationErrors,
];

const ratingValidator = [
  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
  handleValidationErrors,
];

module.exports = { commentValidator, ratingValidator };
