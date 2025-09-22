const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PinnedChat = sequelize.define(
  "PinnedChat",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    chat_id: { type: DataTypes.INTEGER, allowNull: false },
    fixed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "pinned_chats",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "chat_id"],
      },
    ],
  });

module.exports = PinnedChat;
