const { Op } = require('sequelize');
const { Music, User, Album, Like, Comment, Rating } = require('../models');
const { deleteFile } = require('../utils/fileUtils');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { sanitizeText } = require('../utils/sanitize');
const { sequelize } = require('../config/database');

// Helper: attach metrics (likes, comments, avgRating) to a track data object
const attachMetrics = async (trackId) => {
  const [likesCount, commentCount, ratingData] = await Promise.all([
    Like.count({ where: { music_id: trackId } }),
    Comment.count({ where: { music_id: trackId } }),
    Rating.findOne({
      where: { music_id: trackId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('rating')), 'totalRatings'],
      ],
      raw: true,
    }),
  ]);

  return {
    likesCount,
    commentCount,
    averageRating: ratingData?.avgRating
      ? parseFloat(parseFloat(ratingData.avgRating).toFixed(2))
      : 0,
    totalRatings: parseInt(ratingData?.totalRatings) || 0,
  };
};

// ─── Get All Music ────────────────────────────────────────────────────────────
const getAllMusic = async (req, res, next) => {
  try {
    const { genre, author_id, album_id, sort } = req.query;
    const { limit, offset, page } = getPagination(req.query);

    const where = {};
    if (genre) where.genre = { [Op.iLike]: `%${genre}%` };
    if (author_id) where.author_id = author_id;
    if (album_id) where.album_id = album_id;

    let order = [['createdAt', 'DESC']];
    if (sort === 'plays') order = [['plays_count', 'DESC']];
    if (sort === 'oldest') order = [['createdAt', 'ASC']];

    const { count, rows } = await Music.findAndCountAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'profile_picture'] }],
      order,
      limit,
      offset,
      distinct: true,
    });

    // Attach metrics to each track
    const data = await Promise.all(
      rows.map(async (track) => {
        const metrics = await attachMetrics(track.id);
        return { ...track.toJSON(), ...metrics };
      })
    );

    return res.status(200).json({
      data,
      meta: getPaginationMeta(count, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Music ─────────────────────────────────────────────────────────
const getMusicById = async (req, res, next) => {
  try {
    const track = await Music.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'profile_picture', 'bio'] },
        { model: Album, as: 'album', attributes: ['id', 'title', 'cover_image'] },
      ],
    });

    if (!track) {
      return res.status(404).json({ error: 'Music track not found.', field: null });
    }

    // Increment play count
    await track.increment('plays_count');
    await track.reload();

    const metrics = await attachMetrics(track.id);

    return res.status(200).json({ data: { ...track.toJSON(), ...metrics } });
  } catch (error) {
    next(error);
  }
};

// ─── Get Music by Author ──────────────────────────────────────────────────────
const getMusicByAuthor = async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const { limit, offset, page } = getPagination(req.query);

    const author = await User.findByPk(authorId, { attributes: ['id', 'username'] });
    if (!author) {
      return res.status(404).json({ error: 'Author not found.', field: null });
    }

    const { count, rows } = await Music.findAndCountAll({
      where: { author_id: authorId },
      include: [{ model: Album, as: 'album', attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const data = await Promise.all(
      rows.map(async (track) => {
        const metrics = await attachMetrics(track.id);
        return { ...track.toJSON(), ...metrics };
      })
    );

    return res.status(200).json({
      data,
      meta: getPaginationMeta(count, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Upload Music ─────────────────────────────────────────────────────────────
const uploadMusic = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: 'Audio file is required.', field: 'audio' });
    }

    const { title, description, genre, duration, album_id } = req.body;

    // Validate album ownership if provided
    if (album_id) {
      const album = await Album.findByPk(album_id);
      if (!album) {
        return res.status(404).json({ error: 'Album not found.', field: 'album_id' });
      }
      if (album.author_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not own this album.', field: 'album_id' });
      }
    }

    const audioPath = req.files.audio[0].path.replace(/\\/g, '/');
    const thumbnailPath = req.files.thumbnail
      ? req.files.thumbnail[0].path.replace(/\\/g, '/')
      : null;

    const track = await Music.create({
      author_id: req.user.id,
      album_id: album_id || null,
      title: sanitizeText(title),
      description: description ? sanitizeText(description) : null,
      genre: genre ? sanitizeText(genre) : null,
      duration: duration ? parseInt(duration) : null,
      audio_file_url: audioPath,
      thumbnail_url: thumbnailPath,
    });

    return res.status(201).json({
      data: await Music.findByPk(track.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
      }),
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.audio) deleteFile(req.files.audio[0].path);
      if (req.files.thumbnail) deleteFile(req.files.thumbnail[0].path);
    }
    next(error);
  }
};

// ─── Update Music ─────────────────────────────────────────────────────────────
const updateMusic = async (req, res, next) => {
  try {
    const track = await Music.findByPk(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Music track not found.', field: null });
    }
    if (track.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this track.', field: null });
    }

    const { title, description, genre, duration, album_id } = req.body;

    if (title) track.title = sanitizeText(title);
    if (description !== undefined) track.description = sanitizeText(description);
    if (genre !== undefined) track.genre = sanitizeText(genre);
    if (duration) track.duration = parseInt(duration);
    if (album_id !== undefined) track.album_id = album_id || null;

    // New thumbnail?
    if (req.file) {
      if (track.thumbnail_url) deleteFile(track.thumbnail_url);
      track.thumbnail_url = req.file.path.replace(/\\/g, '/');
    }

    await track.save();

    return res.status(200).json({ data: track });
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
};

// ─── Delete Music ─────────────────────────────────────────────────────────────
const deleteMusic = async (req, res, next) => {
  try {
    const track = await Music.findByPk(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Music track not found.', field: null });
    }
    if (track.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this track.', field: null });
    }

    // Delete files from disk
    deleteFile(track.audio_file_url);
    if (track.thumbnail_url) deleteFile(track.thumbnail_url);

    await track.destroy();

    return res.status(200).json({ data: { message: 'Music track deleted successfully.' } });
  } catch (error) {
    next(error);
  }
};

// ─── Author Analytics ─────────────────────────────────────────────────────────
const getAuthorAnalytics = async (req, res, next) => {
  try {
    const { authorId } = req.params;

    if (req.user.id !== parseInt(authorId)) {
      return res.status(403).json({ error: 'Access denied. You can only view your own analytics.', field: null });
    }

    const tracks = await Music.findAll({ where: { author_id: authorId }, attributes: ['id', 'plays_count'] });
    const trackIds = tracks.map((t) => t.id);
    const totalPlays = tracks.reduce((sum, t) => sum + t.plays_count, 0);

    const [totalLikes, totalComments, ratingData, followersCount] = await Promise.all([
      Like.count({ where: { music_id: trackIds } }),
      Comment.count({ where: { music_id: trackIds } }),
      Rating.findOne({
        where: { music_id: trackIds },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
        raw: true,
      }),
      require('../models').Follow.count({ where: { following_id: authorId } }),
    ]);

    return res.status(200).json({
      data: {
        totalTracks: tracks.length,
        totalPlays,
        totalLikes,
        totalComments,
        averageRating: ratingData?.avgRating
          ? parseFloat(parseFloat(ratingData.avgRating).toFixed(2))
          : 0,
        followersCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMusic,
  getMusicById,
  getMusicByAuthor,
  uploadMusic,
  updateMusic,
  deleteMusic,
  getAuthorAnalytics,
};
