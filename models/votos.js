// models/Enquete.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enquete = sequelize.define('Enquete', {
  resposta_index: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensagem_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'votacoes_enquete',
  indexes: [
    {
      unique: true,
      fields: ['resposta_index', 'mensagem_id', 'user_id']
    }
  ],
  createdAt: 'data_voto',
  updatedAt: false
});

module.exports = Enquete;
