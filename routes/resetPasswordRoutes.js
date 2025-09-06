const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  try {
    const user = await User.findOne({ where: { email, resetToken: token } });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou usuário não encontrado.' });
    }

    if (Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ error: 'Token expirado. Solicite um novo link.' });
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    return res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
});

module.exports = router;
