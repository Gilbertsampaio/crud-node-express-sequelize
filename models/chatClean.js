const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CleanChat = sequelize.define(
  "CleanChat",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    chat_id: { type: DataTypes.INTEGER, allowNull: false },
    cleaned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "clean_chat",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "chat_id"],
      },
    ],
  });

module.exports = CleanChat;
