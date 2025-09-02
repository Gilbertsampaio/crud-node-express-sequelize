const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('usuarios_db', 'root', '1611@sampaioGGG', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;