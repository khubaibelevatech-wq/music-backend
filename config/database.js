const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
    },
  }
);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return sequelize;

  try {
    await sequelize.authenticate();
    console.log('MySQL database connected successfully.');

    await sequelize.sync();
    console.log('Database tables synced.');

    isConnected = true;
    return sequelize;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
