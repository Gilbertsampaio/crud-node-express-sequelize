// setDefaultPasswords.js
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const User = require('./models/user');

async function setDefaultPasswords() {
  await sequelize.sync();
  const users = await User.findAll();
  for (const user of users) {
    if (!user.password) {
      const hashed = await bcrypt.hash('123456', 10);
      await user.update({ password: hashed });
      console.log(`Senha atualizada para: ${user.email}`);
    }
  }
  console.log('Todas as senhas padrão foram definidas.');
  process.exit(0);
}

setDefaultPasswords();
