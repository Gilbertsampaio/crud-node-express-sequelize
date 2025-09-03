const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

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
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    // validate: {
    //   notNull: { msg: "A senha é obrigatória" },
    //   notEmpty: { msg: "A senha não pode ser vazia" },
    // },
  },
});

// Hash da senha antes de salvar
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;
