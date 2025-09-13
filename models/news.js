const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define(
  'News',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "O título da notícia é obrigatório" },
        notEmpty: { msg: "O título da notícia não pode ser vazio" }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: "A descrição da notícia é obrigatória" },
        notEmpty: { msg: "A descrição da notícia não pode ser vazia" }
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    externalUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidUrl(value) {
          if (value && !/^https?:\/\/.+/i.test(value)) {
            throw new Error("A URL externa deve ser válida");
          }
        }
      }
    },
    postDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'news',
    timestamps: true, // Sequelize usará createdAt e updatedAt
  }
);

module.exports = News;
