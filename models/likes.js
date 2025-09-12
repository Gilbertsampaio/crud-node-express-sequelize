// models/Like.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require("./User");

const Like = sequelize.define('Like', {
  table_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  record_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'likes',
  indexes: [
    {
      unique: true,
      fields: ['table_name', 'record_id', 'user_id']
    }
  ],
  createdAt: 'created_at',
  updatedAt: false
});

Like.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = Like;
