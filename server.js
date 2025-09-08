const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

sequelize.sync()
  .then(() => {
    console.log(`[${process.env.NODE_ENV.toUpperCase()}] DB conectado e sincronizado: ${process.env.DB_NAME}`);
    app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
  })
  .catch(err => console.error('Erro ao conectar com o banco:', err));
