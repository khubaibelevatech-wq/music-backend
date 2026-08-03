/**
 * Strip HTML tags from a string to prevent XSS in stored text.
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/<[^>]*>/g, '').trim();
};

module.exports = { sanitizeText };
