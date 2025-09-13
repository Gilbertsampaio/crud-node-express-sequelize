const User = require('./user');
const Service = require('./service');
const Category = require('./category');
const Like = require('./likes');
const News = require('./news');
const Comment = require('./Comment');

// Relacionamentos Service ? User
Service.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(Service, { foreignKey: "userId" });

// Relacionamentos Service ? Category
Service.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Service, { foreignKey: 'categoryId', onDelete: 'SET NULL' });

// Relacionamentos News ? User / Category
News.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(News, { foreignKey: 'userId' });
News.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(News, { foreignKey: 'categoryId', onDelete: 'SET NULL' });

// Likes e Comments
Like.belongsTo(User, { foreignKey: "user_id", as: "user" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = { User, Service, Category, Like, News, Comment };