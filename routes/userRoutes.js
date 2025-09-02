const express = require('express');
const router = express.Router();
const User = require('../models/user');

// --- Criar usuário ---
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    // Captura erros de validação e email duplicado
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    // Outros erros
    res.status(500).json({ error: err.message });
  }
});

// --- Listar todos ---
router.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// --- Atualizar usuário ---
router.put('/users/:id', async (req, res) => {
  try {
    const [updated] = await User.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id);
      return res.json(updatedUser); // retorna usuário atualizado
    }
    return res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- Deletar usuário ---
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (deleted) {
      return res.json({ message: 'Usuário deletado com sucesso' });
    }
    return res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
