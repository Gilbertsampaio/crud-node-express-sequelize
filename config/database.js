// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('usuarios_db', 'root', '1611@sampaioGGG', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
