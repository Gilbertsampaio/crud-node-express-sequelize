// models/service.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Service = sequelize.define('Service', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "O título do serviço é obrigatório" },
      notEmpty: { msg: "O título não pode ser vazio" },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

// Relação: um usuário tem muitos serviços
User.hasMany(Service, { foreignKey: 'userId', onDelete: 'CASCADE' });
Service.belongsTo(User, { foreignKey: 'userId' });

module.exports = Service;
