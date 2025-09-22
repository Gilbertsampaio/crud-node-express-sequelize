const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatArchive = sequelize.define(
  "ChatArchive",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    chat_id: { type: DataTypes.INTEGER, allowNull: false },
    archived_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "chat_archives",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "chat_id"],
      },
    ],
  }
);

module.exports = ChatArchive;
