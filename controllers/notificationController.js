const { Notification, User, Music } = require('../models');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// ─── Get All Notifications ───────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset, page } = getPagination(req.query);

    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: userId },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'profile_picture'] },
        { model: Music, as: 'music', attributes: ['id', 'title', 'thumbnail_url'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({ data: rows, meta: getPaginationMeta(count, page, limit) });
  } catch (error) {
    next(error);
  }
};

// ─── Mark Notification as Read ────────────────────────────────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ error: 'Notification not found.', field: null });
    if (notif.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.', field: null });
    }
    notif.is_read = true;
    await notif.save();
    return res.status(200).json({ data: notif });
  } catch (error) {
    next(error);
  }
};

// ─── Mark All as Read ─────────────────────────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    const updated = await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    return res.status(200).json({ data: { updatedCount: updated[0] } });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Notification ──────────────────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ error: 'Notification not found.', field: null });
    if (notif.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.', field: null });
    }
    await notif.destroy();
    return res.status(200).json({ data: { message: 'Notification deleted.' } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
