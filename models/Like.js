const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define(
  'Like',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    music_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'likes',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'music_id'],
      },
    ],
  }
);

module.exports = Like;
