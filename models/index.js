const User = require('./User');
const Album = require('./Album');
const Music = require('./Music');
const Like = require('./Like');
const Comment = require('./Comment');
const Rating = require('./Rating');
const Notification = require('./Notification');
const Follow = require('./Follow');

// ─── User ↔ Album ──────────────────────────────────────────────────────────
User.hasMany(Album, { foreignKey: 'author_id', as: 'albums', onDelete: 'CASCADE' });
Album.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// ─── User ↔ Music ──────────────────────────────────────────────────────────
User.hasMany(Music, { foreignKey: 'author_id', as: 'tracks', onDelete: 'CASCADE' });
Music.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// ─── Album ↔ Music ─────────────────────────────────────────────────────────
Album.hasMany(Music, { foreignKey: 'album_id', as: 'tracks', onDelete: 'SET NULL' });
Music.belongsTo(Album, { foreignKey: 'album_id', as: 'album' });

// ─── User ↔ Like ──────────────────────────────────────────────────────────
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── Music ↔ Like ─────────────────────────────────────────────────────────
Music.hasMany(Like, { foreignKey: 'music_id', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Music, { foreignKey: 'music_id', as: 'music' });

// ─── User ↔ Comment ───────────────────────────────────────────────────────
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── Music ↔ Comment ──────────────────────────────────────────────────────
Music.hasMany(Comment, { foreignKey: 'music_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Music, { foreignKey: 'music_id', as: 'music' });

// ─── User ↔ Rating ────────────────────────────────────────────────────────
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── Music ↔ Rating ───────────────────────────────────────────────────────
Music.hasMany(Rating, { foreignKey: 'music_id', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(Music, { foreignKey: 'music_id', as: 'music' });

// ─── Notification ─────────────────────────────────────────────────────────
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Music.hasMany(Notification, { foreignKey: 'music_id', as: 'notifications', onDelete: 'SET NULL' });
Notification.belongsTo(Music, { foreignKey: 'music_id', as: 'music' });

// ─── Follow ───────────────────────────────────────────────────────────────
User.hasMany(Follow, { foreignKey: 'follower_id', as: 'following', onDelete: 'CASCADE' });
User.hasMany(Follow, { foreignKey: 'following_id', as: 'followers', onDelete: 'CASCADE' });
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'followedAuthor' });

module.exports = { User, Album, Music, Like, Comment, Rating, Notification, Follow };
