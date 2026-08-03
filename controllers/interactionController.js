const { Music, Like, Comment, Rating, User, Follow } = require('../models');
const { createNotification } = require('../utils/notificationHelper');
const { sanitizeText } = require('../utils/sanitize');
const { sequelize } = require('../config/database');

// ─── Toggle Like ──────────────────────────────────────────────────────────────
const toggleLike = async (req, res, next) => {
  try {
    const { musicId } = req.params;
    const userId = req.user.id;

    const track = await Music.findByPk(musicId);
    if (!track) return res.status(404).json({ error: 'Music track not found.', field: null });

    const existing = await Like.findOne({ where: { user_id: userId, music_id: musicId } });

    if (existing) {
      await existing.destroy();
      const likesCount = await Like.count({ where: { music_id: musicId } });
      return res.status(200).json({ data: { liked: false, likesCount } });
    }

    await Like.create({ user_id: userId, music_id: musicId });
    const likesCount = await Like.count({ where: { music_id: musicId } });

    // Notification
    const sender = await User.findByPk(userId, { attributes: ['username'] });
    await createNotification({
      userId: track.author_id,
      senderId: userId,
      musicId: track.id,
      type: 'like',
      message: `${sender.username} liked your track "${track.title}".`,
    });

    return res.status(201).json({ data: { liked: true, likesCount } });
  } catch (error) {
    next(error);
  }
};

// ─── Add Comment ──────────────────────────────────────────────────────────────
const addComment = async (req, res, next) => {
  try {
    const { musicId } = req.params;
    const userId = req.user.id;
    const { comment_text } = req.body;

    const track = await Music.findByPk(musicId);
    if (!track) return res.status(404).json({ error: 'Music track not found.', field: null });

    const comment = await Comment.create({
      user_id: userId,
      music_id: musicId,
      comment_text: sanitizeText(comment_text),
    });

    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profile_picture'] }],
    });

    // Notification
    const sender = await User.findByPk(userId, { attributes: ['username'] });
    await createNotification({
      userId: track.author_id,
      senderId: userId,
      musicId: track.id,
      type: 'comment',
      message: `${sender.username} commented on your track "${track.title}".`,
    });

    return res.status(201).json({ data: full });
  } catch (error) {
    next(error);
  }
};

// ─── Get Comments ─────────────────────────────────────────────────────────────
const getComments = async (req, res, next) => {
  try {
    const { musicId } = req.params;

    const track = await Music.findByPk(musicId);
    if (!track) return res.status(404).json({ error: 'Music track not found.', field: null });

    const comments = await Comment.findAll({
      where: { music_id: musicId },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profile_picture'] }],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ data: comments });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Comment ───────────────────────────────────────────────────────────
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.', field: null });
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own comments.', field: null });
    }
    await comment.destroy();
    return res.status(200).json({ data: { message: 'Comment deleted.' } });
  } catch (error) {
    next(error);
  }
};

// ─── Rate Music ───────────────────────────────────────────────────────────────
const rateMusic = async (req, res, next) => {
  try {
    const { musicId } = req.params;
    const userId = req.user.id;
    const { rating } = req.body;

    const track = await Music.findByPk(musicId);
    if (!track) return res.status(404).json({ error: 'Music track not found.', field: null });

    const [ratingRecord, created] = await Rating.findOrCreate({
      where: { user_id: userId, music_id: musicId },
      defaults: { rating },
    });

    if (!created) {
      ratingRecord.rating = rating;
      await ratingRecord.save();
    }

    // Compute updated avg
    const aggregate = await Rating.findOne({
      where: { music_id: musicId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('rating')), 'totalRatings'],
      ],
      raw: true,
    });

    const averageRating = parseFloat(parseFloat(aggregate.avgRating).toFixed(2));
    const totalRatings = parseInt(aggregate.totalRatings);

    // Notification (only when creating a new rating)
    if (created) {
      const sender = await User.findByPk(userId, { attributes: ['username'] });
      await createNotification({
        userId: track.author_id,
        senderId: userId,
        musicId: track.id,
        type: 'rating',
        message: `${sender.username} rated your track "${track.title}" ${rating}/5.`,
      });
    }

    return res.status(created ? 201 : 200).json({
      data: { rating: ratingRecord.rating, averageRating, totalRatings },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Rating ───────────────────────────────────────────────────────────────
const getRating = async (req, res, next) => {
  try {
    const { musicId } = req.params;

    const aggregate = await Rating.findOne({
      where: { music_id: musicId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('rating')), 'totalRatings'],
      ],
      raw: true,
    });

    return res.status(200).json({
      data: {
        averageRating: aggregate?.avgRating
          ? parseFloat(parseFloat(aggregate.avgRating).toFixed(2))
          : 0,
        totalRatings: parseInt(aggregate?.totalRatings) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle Follow ────────────────────────────────────────────────────────────
const toggleFollow = async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const followerId = req.user.id;

    if (parseInt(authorId) === followerId) {
      return res.status(400).json({ error: 'You cannot follow yourself.', field: null });
    }

    const author = await User.findOne({ where: { id: authorId, user_type: 'author' } });
    if (!author) {
      return res.status(404).json({ error: 'Author not found.', field: null });
    }

    const existing = await Follow.findOne({ where: { follower_id: followerId, following_id: authorId } });

    if (existing) {
      await existing.destroy();
      const followersCount = await Follow.count({ where: { following_id: authorId } });
      return res.status(200).json({ data: { following: false, followersCount } });
    }

    await Follow.create({ follower_id: followerId, following_id: authorId });
    const followersCount = await Follow.count({ where: { following_id: authorId } });

    // Notification
    const follower = await User.findByPk(followerId, { attributes: ['username'] });
    await createNotification({
      userId: parseInt(authorId),
      senderId: followerId,
      type: 'follow',
      message: `${follower.username} started following you.`,
    });

    return res.status(201).json({ data: { following: true, followersCount } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  rateMusic,
  getRating,
  toggleFollow,
};
