// routes/loginRoutes.js
const express = require('express');
const router = express.Router();
const { User } = require('../models/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // garante que o .env seja carregado

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Senha incorreta' });

    // Cria token JWT usando variáveis de ambiente
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, // deve estar definido no .env
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // expiração dinâmica
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
