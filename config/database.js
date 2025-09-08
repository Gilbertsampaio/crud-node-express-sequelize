const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const dbName = process.env.NODE_ENV === 'test'
  ? process.env.DB_NAME + '_test'
  : process.env.DB_NAME;

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

console.log(`[${process.env.NODE_ENV.toUpperCase()}] Banco carregado: ${dbName}`);

module.exports = sequelize;
