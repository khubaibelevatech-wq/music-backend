const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({ error: first.msg, field: first.path });
  }
  next();
};

const registerValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3–50 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required.'),
  body('user_type')
    .optional()
    .isIn(['user', 'author']).withMessage('user_type must be "user" or "author".'),
  handleValidationErrors,
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];

const profileUpdateValidator = [
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty.'),
  body('email').optional().trim().isEmail().withMessage('Please enter a valid email address.'),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('bio').optional().trim(),
  handleValidationErrors,
];

module.exports = { registerValidator, loginValidator, profileUpdateValidator };
