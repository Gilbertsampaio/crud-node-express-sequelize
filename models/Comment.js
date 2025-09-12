// models/Comment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Comment = sequelize.define(
  "Comment",
  {
    table_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    record_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Associação com User
Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = Comment;
