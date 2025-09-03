const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Category = require('./category'); // importar Category

const Service = sequelize.define('Service', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "O título do serviço é obrigatório" },
      notEmpty: { msg: "O título do serviço não pode ser vazio" }
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  categoryId: { // nova coluna
    type: DataTypes.INTEGER,
    allowNull: true // opcional
  }
});

// Relacionamento: Service pertence a User
Service.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Service, { foreignKey: 'userId' });

// Relacionamento: Service pertence a Category
Service.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Service, { foreignKey: 'categoryId', onDelete: 'SET NULL' });

module.exports = Service;
