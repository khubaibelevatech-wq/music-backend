const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;

      if (authHeader.startsWith('Bearer ')) {
        // Handle both "Bearer TOKEN" and "Bearer Bearer TOKEN" (Swagger double-prefix bug)
        const parts = authHeader.split(' ').filter(p => p && p.toLowerCase() !== 'bearer');
        token = parts[parts.length - 1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.', field: null });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token.', field: null });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({ error: 'User belonging to this token no longer exists.', field: null });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error.', field: null });
  }
};

module.exports = protect;
