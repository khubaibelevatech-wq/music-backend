/**
 * Parse pagination params from query string.
 * Returns { limit, offset, page }.
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { limit, offset, page };
};

/**
 * Build a standard paginated response meta object.
 */
const getPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

module.exports = { getPagination, getPaginationMeta };
