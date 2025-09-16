const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Storie = sequelize.define(
  "Storie",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("image", "video"),
      allowNull: false,
      defaultValue: "image",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "expired"),
      defaultValue: "active",
    },
  },
  {
    tableName: "storys",
    timestamps: false,
  }
);

module.exports = Storie;
