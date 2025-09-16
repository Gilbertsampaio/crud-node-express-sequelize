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
    allowNull: true, // opcional
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true, // nome do arquivo da imagem, pode ficar nulo
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiry: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  last_active: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

// Hash da senha antes de criar
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Hash da senha antes de atualizar (se necessário)
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

module.exports = User;
