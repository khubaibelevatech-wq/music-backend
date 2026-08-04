const { Sequelize } = require('sequelize');
const pg = require('pg');
require('dotenv').config();

const commonOptions = {
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
};

const postgresOptions = {
  ...commonOptions,
  dialect: 'postgres',
  dialectModule: pg,
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
    },
  },
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, postgresOptions)
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      ...postgresOptions,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
    });

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return sequelize;

  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connected successfully.');

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
