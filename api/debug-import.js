module.exports = (req, res) => {
  try {
    require('../server');
    res.status(200).json({ status: 'server import ok' });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      name: error.name,
      stack: error.stack,
    });
  }
};
