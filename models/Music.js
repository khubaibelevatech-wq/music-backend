const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Music = sequelize.define(
  'Music',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    album_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    audio_file_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    duration: {
      type: DataTypes.INTEGER, // seconds
      allowNull: true,
      defaultValue: null,
    },
    genre: {
      type: DataTypes.STRING(80),
      allowNull: true,
      defaultValue: null,
    },
    plays_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'music',
  }
);

module.exports = Music;
