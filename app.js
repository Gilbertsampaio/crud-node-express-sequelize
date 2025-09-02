const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

// Sincroniza modelos com o banco
sequelize.sync()
  .then(() => {
    console.log('DB conectado e sincronizado');
    app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
  })
  .catch(err => console.error('Erro ao conectar com o banco:', err));