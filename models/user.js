const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "O nome é obrigatório" },
      notEmpty: { msg: "O nome não pode ser vazio" },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: "Este email já está cadastrado" },
    validate: {
      notNull: { msg: "O email é obrigatório" },
      notEmpty: { msg: "O email não pode ser vazio" },
      isEmail: { msg: "Email inválido" },
    },
  },
});

module.exports = User;
