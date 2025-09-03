const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notNull: { msg: "O nome da categoria é obrigatório" },
      notEmpty: { msg: "O nome da categoria não pode ser vazio" }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Category;
