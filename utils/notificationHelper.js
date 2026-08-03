const { Notification } = require('../models');

/**
 * Create a notification record.
 * Skips if recipient === sender (no self-notifications).
 */
const createNotification = async ({ userId, senderId, musicId = null, type, message }) => {
  try {
    if (userId === senderId) return; // no self-notification
    await Notification.create({ user_id: userId, sender_id: senderId, music_id: musicId, type, message });
  } catch (err) {
    // Notification failure should never crash the main flow
    console.error('Notification creation error:', err.message);
  }
};

module.exports = { createNotification };
