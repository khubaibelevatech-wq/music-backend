const authorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.', field: null });
  }
  if (req.user.user_type !== 'author') {
    return res.status(403).json({ error: 'Forbidden: Authors only.', field: null });
  }
  next();
};

module.exports = authorOnly;
