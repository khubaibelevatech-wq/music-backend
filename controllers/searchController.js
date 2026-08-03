const { Op } = require('sequelize');
const { Music, User, Album, Rating, Follow } = require('../models');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { sequelize } = require('../config/database');

// ─── Search Music ─────────────────────────────────────────────────────────────
const searchMusic = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters.', field: 'q' });
    }

    const { limit, offset, page } = getPagination(req.query);
    const like = { [Op.like]: `%${q.trim()}%` };

    const { count, rows } = await Music.findAndCountAll({
      where: {
        [Op.or]: [{ title: like }, { genre: like }],
      },
      include: [
        { model: User, as: 'author', where: { [Op.or]: [{ username: like }, { id: { [Op.gte]: 0 } }] }, required: false, attributes: ['id', 'username', 'profile_picture'] },
      ],
      order: [['plays_count', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    // Also search by author username
    const byAuthor = await Music.findAndCountAll({
      include: [
        { model: User, as: 'author', where: { username: like }, required: true, attributes: ['id', 'username', 'profile_picture'] },
      ],
      limit,
      offset,
      distinct: true,
    });

    // Merge and deduplicate
    const allRows = [...rows, ...byAuthor.rows];
    const seen = new Set();
    const unique = allRows.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    return res.status(200).json({
      data: unique,
      meta: getPaginationMeta(count + byAuthor.count, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Search Authors ───────────────────────────────────────────────────────────
const searchAuthors = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters.', field: 'q' });
    }

    const { limit, offset, page } = getPagination(req.query);
    const like = { [Op.like]: `%${q.trim()}%` };

    const { count, rows } = await User.findAndCountAll({
      where: {
        user_type: 'author',
        [Op.or]: [{ username: like }, { full_name: like }],
      },
      attributes: { exclude: ['password'] },
      order: [['username', 'ASC']],
      limit,
      offset,
    });

    const data = await Promise.all(
      rows.map(async (author) => {
        const [trackCount, followersCount] = await Promise.all([
          Music.count({ where: { author_id: author.id } }),
          Follow.count({ where: { following_id: author.id } }),
        ]);
        return { ...author.toJSON(), trackCount, followersCount };
      })
    );

    return res.status(200).json({ data, meta: getPaginationMeta(count, page, limit) });
  } catch (error) {
    next(error);
  }
};

// ─── Search Albums ────────────────────────────────────────────────────────────
const searchAlbums = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters.', field: 'q' });
    }

    const { limit, offset, page } = getPagination(req.query);
    const like = { [Op.like]: `%${q.trim()}%` };

    const { count, rows } = await Album.findAndCountAll({
      where: { title: like },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profile_picture'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const data = await Promise.all(
      rows.map(async (album) => {
        const trackCount = await Music.count({ where: { album_id: album.id } });
        return { ...album.toJSON(), trackCount };
      })
    );

    return res.status(200).json({ data, meta: getPaginationMeta(count, page, limit) });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchMusic, searchAuthors, searchAlbums };
