const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StoryView = sequelize.define(
  "StoryView",
  {
    story_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    viewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    viewed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "story_views",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["story_id", "viewer_id"],
      },
    ],
  }
);

module.exports = StoryView;
